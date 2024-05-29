var express = require('express');
var router = express.Router();
const userController = require("../controllers/userController");
const indexController = require("../controllers/indexController");
const multer = require("multer");
  // Configuração do Multer
  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });

router.get("/entrar", userController.entrar);
router.get("/registar", userController.registar);
router.post("/registar", userController.postregistar);
router.post("/entrar", userController.postentrar);
router.get("/perfil", indexController.verificarToken, userController.perfil);
router.get("/mudarfotoperfil", indexController.verificarToken, userController.mudarfotoperfil);
router.get("/mudarsenha", indexController.verificarToken, userController.mudarsenha);
router.post("/mudarsenha", userController.postMudarsenha);
router.post("/mudarfotoperfil", upload.single("fotoperfilnova"), userController.postMudarFotoPerfil);
router.get("/sair", userController.sair);
router.get("/recuperar_senha", userController.recuperarsenha);
router.post("/recuperar_senha", userController.postRecuperarSenha );
router.get("/recuperar_senha_2", userController.recuperar_senha_2);
router.post("/recuperar_senha_2", userController.postRecuperarSenha2);
router.get("/gerar_pergunta_seguranca", userController.gerar_pergunta_seguranca);
router.get("/carregarsaldo", indexController.verificarToken, userController.carregarsaldo);
router.post("/carregarsaldo", userController.postCarregarsaldo);

module.exports = router;
