var express = require("express");
var router = express.Router();
const indexController = require("../controllers/indexController");


router.get("/inicial", indexController.verificarToken , indexController.inicial);

router.get("/", indexController.primaria);

router.get("/sobrenos",indexController.verificarToken, indexController.sobrenos);

module.exports = router;
