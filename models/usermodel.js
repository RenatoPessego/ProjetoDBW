const mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  nomes: { type: String, required: true },
  sobrenomes: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  nacionalidade: { type: String, required: true },
  dataNascimento: { type: Date, required: true },
  estadoCivil: { type: String, required: true },
  genero: { type: String, required: true },
  numeroTelemovel: { type: String, required: true, unique: true },
  numeroIdentificacao: { type: String, required: true, unique: true },
  perguntaSeguranca: { type: String, required: true },
  respostaSeguranca: { type: String, required: true },
  dinheiro: { type: Number, required: true, default: 0.0 },
  casasCompradas: { type: [String] },
  imagemPerfil: {
    type: String,
    default: "http://localhost:3000/uploads/imagempadrao.jpg",
  },
  admin: { type: Boolean, required: true, default: false },
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);