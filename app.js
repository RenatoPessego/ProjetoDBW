var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const mongoose = require("mongoose");

var passport = require("passport");
const User = require("./models/usermodel");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
var app = express();
const port = 3000;
const Sala = require("./models/roomModel");
const { Socket } = require("dgram");

const userRouter  =require("./routes/users");
const indexRouter = require("./routes/index");
const CasasRouter = require("./routes/casas");
const suporteRouter = require("./routes/suporte");
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(indexRouter);
app.use(userRouter);
app.use(CasasRouter);
app.use(suporteRouter);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

//Verificação Passport
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new LocalStrategy(User.authenticate()));

//Criar sessao
app.use(
  session({
    secret: "housedream",
    resave: false,
    saveUninitialized: false,
  })
);
app.use("/uploads", express.static("./uploads"));

const mongooseKey = process.env.MongooseKey;

mongoose
  .connect(
    "mongodb+srv://" + mongooseKey,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connectado ao MongoDB");
  })
  .catch((error) => {
    console.log("mongodb+srv://" + mongooseKey);
    console.error("Erro ao conectar ao MongoDB:", error);
  });


  const http = require("http");
  const server = http.createServer(app);
  const cors = require("cors");
  const { Server } = require("socket.io");
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
    },
  });
  
  const usersConectados = [];
  const usernames = {};
  io.on("connection", async (socket) => {
    console.log("New user connected:", socket.handshake.query.username);
    usersConectados.push(socket.handshake.query.username);
    try {
      // Cria uma sala
      const sala = await Sala.findOne({
        hostID: socket.handshake.query.username,
      });
      if (!sala) {
        const procurarUser = await User.findOne({
          username: socket.handshake.query.username,
        });
        if (!procurarUser.admin) {
          const newRoom = new Sala({
            hostID: socket.handshake.query.username,
            adminSocketID: "",
            mensagens: [],
          });
          await newRoom.save();
          console.log("Room created");
        }
      }
    } catch (err) {
      console.log(err);
    }
    socket.on("msg privada", async (username, message, hostID) => {
      //o admin sabe sempre para quem está a mandar msg
      //contudo o utilizador não sabe para quem está a mandar msg
      //entao é feito isto para que o utilizador saiba para quem está a mandar msg
      if (hostID == undefined) {
        hostID = username;
        const sala = await Sala.findOne({ hostID: username });
        if (sala) {
          console.log(
            username + " mandou " + message + " para " + sala.adminSocketID
          );
          const msg = username + ": " + message;
          console.log(msg);
          console.log(sala);
          sala.mensagens.push(msg);
          await sala.save();
          socket.join(hostID);
          io.to(sala.adminSocketID).emit("msg privada", username, message);
        }
      } else {
        console.log(username + " mandou " + message + " para " + hostID);
        const sala = await Sala.findOne({ adminSocketID: username });
        if (sala) {
          const msg = username + ": " + message;
          sala.mensagens.push(msg);
          await sala.save();
        }
        socket.join(username);
        io.to(hostID).emit("msg privada", username, message);
      }
    });
  
    socket.on("disconnect", async () => {
      const procurarUser = await User.findOne({
        username: socket.handshake.query.username,
      });
      //se é admin
      // procurar sala em que é admin e decrementar users conectados
      if (procurarUser.admin) {
        const sala = await Sala.findOne({
          adminSocketID: socket.handshake.query.username,
        });
        if (sala) {
          sala.usersConectados -= 1;
          await sala.save();
        }
      }
      console.log("User disconnected:", socket.handshake.query.username);
      //apaga a sala que foi criada quando o utilizador se desconectar
      await Sala.deleteOne({ hostID: socket.handshake.query.username });
    });
  });
  
  server.listen(3001, () => {
    console.log(`Socket ligado!`);
  });

module.exports = app;