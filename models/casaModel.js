const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const CasaSchema = new Schema({
  aVenda: { type: Boolean, required: true },
  nomeImovel: { type: String, required: true },
  descricaoDetalhada: { type: String, required: true },
  nAndares: { type: Number, required: true },
  nQuartos: { type: Number, required: true },
  nCasasBanho: { type: Number, required: true },
  area: { type: Number, required: true },
  nEstacionamento: { type: Number, required: true },
  acessibilidade: { type: String, required: true, default: "off" },
  zonaExterior: { type: String, required: true, default: "off" },
  classificacaoEnergetica: { type: String, required: true },
  piscina: { type: String, required: true, default: "off" },
  varanda: { type: String, required: true, default: "off" },
  garagem: { type: String, required: true, default: "off" },
  elevador: { type: String, required: true, default: "off" },
  arCondicionado: { type: String, required: true, default: "off" },
  jardim: { type: String, required: true, default: "off" },
  preco: { type: Number, required: true },
  pais: { type: String, required: true },
  cidade: { type: String, required: true },
  nTelemovel: { type: String, required: true },
  email: { type: String, required: true },
  imagensCasa: { type: [String] },
  comentarios: { type: [String] },
});

module.exports = mongoose.model("Casa", CasaSchema);
