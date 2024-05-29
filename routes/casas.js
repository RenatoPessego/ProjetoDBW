var express = require('express');
var router = express.Router();
const Casascontroller = require("../controllers/casasController");
const indexController = require("../controllers/indexController");
const multer = require("multer");
// Configuração do Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/vendernossosite", indexController.verificarToken, Casascontroller.vendernossosite);
router.get("/vendernossosite/detalhes", indexController.verificarToken, Casascontroller.detalhesVendernossosite);
router.get("/vendernossosite/vender", indexController.verificarToken, Casascontroller.vendernossositeVender);
router.post("/vendernossosite/vender", indexController.verificarToken, Casascontroller.postVendernossosite);
router.post("/vendernossosite/detalhes", indexController.verificarToken, Casascontroller.postVendernossositedetalhes);
router.get("/comprar", indexController.verificarToken, Casascontroller.comprar);
router.get("/comprar/detalhescomprar", indexController.verificarToken, Casascontroller.comprarDetalhescomprar);
router.post("/comprar", indexController.verificarToken, Casascontroller.postComprar);
router.get("/comprar/finalizarcompra", indexController.verificarToken, Casascontroller.comprarFinalizarcompra);
router.get("/minhaspropriedades", indexController.verificarToken, Casascontroller.minhaspropriedades);
router.get("/saldoinsuficiente", indexController.verificarToken, Casascontroller.saldoinsuficiente);
router.get("/mesmodono", indexController.verificarToken, indexController.verificarToken);
router.get("/removercasavenda", indexController.verificarToken, Casascontroller.removercasavenda);
router.get("/detalhes", indexController.verificarToken, Casascontroller.detalhes);
router.get("/venderexternamente", indexController.verificarToken, Casascontroller.venderexternamente);
router.post("/venderexternamente",upload.array("imagensCasa", 12), Casascontroller.postVenderexternamente );

module.exports = router;
