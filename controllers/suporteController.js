const User = require("../models/usermodel.js");
const jwt = require("jsonwebtoken");
const Sala = require("../models/roomModel.js");

const suporte = async (req, res, next) => {
  const token = req.cookies.token;
  const dadosDescodificados = jwt.decode(
    token,
    "housedream",
    (algorithms = ["HS256"])
  );
  const id = dadosDescodificados.userId;
  const usuario = await User.findById(id);
  res.render("suporte", { Erro: "", usuario: usuario });
};
const suporteChat = async (req, res) => {
  const token = req.cookies.token;
  const dadosDescodificados = jwt.decode(
    token,
    "housedream",
    (algorithms = ["HS256"])
  );
  const id = dadosDescodificados.userId;
  const usuario = await User.findById(id);

  res.render("suportechat", { Erro: "", usuario: usuario });
};
const suporteChatAdmin = async (req, res) => {
  const token = req.cookies.token;
  const dadosDescodificados = jwt.decode(
    token,
    "housedream",
    (algorithms = ["HS256"])
  );
  const id = dadosDescodificados.userId;
  const usuario = await User.findById(id);
  const salas = await Sala.find({ usersConectados: { $lt: 2 } });

  if (!usuario.admin) {
    res.redirect("/suporte");
  }
  res.render("suportechatadmin", {
    Erro: "",
    salas: salas,
    usuario: usuario,
  });
};
const chatAdminChat = async (req, res) => {
  const token = req.cookies.token;
  const dadosDescodificados = jwt.decode(
    token,
    "housedream",
    (algorithms = ["HS256"])
  );
  const id = dadosDescodificados.userId;
  const usuario = await User.findById(id);
  if (!usuario.admin) {
    res.redirect("/suporte");
  }

  // Obter o hostID do URL
  const hostID = req.query.hostID;
  const sala = await Sala.findOne({ hostID: hostID });
  if (!sala) {
    res.redirect("/suporte");
  }
  try {
    if (sala) {
      sala.adminSocketID = usuario.username;
      sala.usersConectados += 1;
      await sala.save();
    }
  } catch (err) {
    console.log(err);
  }
  res.render("suporteadminchatfalar", {
    Erro: "",
    usuario: usuario,
    hostID: hostID,
    sala: sala,
  });
};

module.exports = {
  suporte,
  suporteChat,
  suporteChatAdmin,
  chatAdminChat
};