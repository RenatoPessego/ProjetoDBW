const mongoose = require("mongoose");
const { getMaxListeners } = require("./casaModel");
var Schema = mongoose.Schema;

const SalaSchema = new Schema({
  hostID: { type: String },
  adminSocketID: { type: String },
  mensagens: { type: [String] },
  usersConectados: { type: Number, default: 1 },
});

module.exports = mongoose.model("Sala", SalaSchema);
