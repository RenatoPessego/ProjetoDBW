const express = require("express");
const router = express.Router();
const indexController = require("../controllers/indexController");

const suporteController = require("../controllers/suporteController");
router.get(
  "/suporte",
  indexController.verificarToken,
  suporteController.suporte
);
router.get(
  "/suporte/chat",
  indexController.verificarToken,
  suporteController.suporteChat
);
router.get(
  "/suporte/chatadmin",
  indexController.verificarToken,
  suporteController.suporteChatAdmin
);
router.get(
  "/chatadmin/chat",
  indexController.verificarToken,
  suporteController.chatAdminChat
);

module.exports = router;
