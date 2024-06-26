const User = require("../models/usermodel");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const Casa = require("../models/casaModel");
const data = new Date();
const OpenAI = require("openai-api");
const readlineSync = require("readline-sync");
require("dotenv").config();
//const { OpenAI } = require('openai-api');
const axios = require("axios");

const regex = /^[a-zA-ZÀ-ÖØ-öø-ÿçÇ\s]+$/;
const { ObjectId } = require("mongodb");
const { title } = require("process");
const Sala = require("../models/roomModel");



const entrar = function (req, res, next) {
    res.render("entrar", { mensagem: "" });
  };

  const registar = function (req, res, next) {
    res.render("registar", { mensagem: "" });
  };

  const postregistar = async (req, res) => {
    //Fazer verificações
    const usernameRepetido = await User.findOne({ username: req.body.username });
    const numeroIdentificacaoRepetido = await User.findOne({
      numeroIdentificacao: req.body.numeroIdentificacao,
    });
    const numeroTelemovelRepetido = await User.findOne({
      numeroTelemovel: req.body.numeroTelemovel,
    });
    const dataNascimento = new Date(req.body.dataNascimento);
    const hoje = new Date();
    const idadeMinima = 13;
    const idadeUsuario = hoje.getFullYear() - dataNascimento.getFullYear();
    const telefoneRegex = /^\+(?:[0-9] ?){6,14}[0-9]$/;
    const numeroIdentificacaoRegex = /^[a-zA-Z0-9]{6,20}$/;
  
    if (req.body.perguntaSeguranca === "" || !req.body.perguntaSeguranca) {
      res.render("registar", {
        mensagem: "Por favor gere uma pergunta de segurança",
      });
    } else if (
      !regex.test(req.body.nomes) ||
      !regex.test(req.body.sobrenomes) ||
      req.body.nomes === "" ||
      req.body.sobrenomes === ""
    ) {
      res.render("registar", {
        mensagem:
          "Os nomes e sobrenomes não podem conter números e não podem estar vazios",
      });
    } else if (req.body.username === "") {
      res.render("registar", { mensagem: "O username não pode estar vazio" });
    } else if (usernameRepetido) {
      res.render("registar", { mensagem: "Username indisponível." });
    } else if (req.body.nacionalidade === "") {
      res.render("registar", {
        mensagem: "Por favor, introduza uma nacionalidade",
      });
    } else if (isNaN(dataNascimento.getTime())) {
      res.render("registar", {
        mensagem: "Por favor, introduza uma data de nascimento válida",
      });
    } else if (idadeUsuario < idadeMinima) {
      res.render("registar", {
        mensagem: "Deve ter pelo menos 13 anos para se registar",
      });
    } else if (req.body.estadoCivil === "") {
      res.render("registar", { mensagem: "Por favor selecione um estado civil" });
    } else if (req.body.genero === "") {
      res.render("registar", { mensagem: "Por favor selecione um genero" });
    } else if (!telefoneRegex.test(req.body.numeroTelemovel)) {
      res.render("registar", {
        mensagem:
          "Por favor introduza um número válido. Não se esqueça de introduzir o indicativo do seu país ou região com o símbolo '+'",
      });
    } else if (numeroTelemovelRepetido) {
      res.render("registar", {
        mensagem:
          "Esse número de telemóvel já está registado, por favor faça login ou recupere a sua senha.",
      });
    } else if (!numeroIdentificacaoRegex.test(req.body.numeroIdentificacao)) {
      res.render("registar", {
        mensagem:
          "Número de identificação inválido. Não pode conter caracteres especiais e tem entre 6 e 20 digitos, dependendo do país.",
      });
    } else if (numeroIdentificacaoRepetido) {
      res.render("registar", {
        mensagem:
          "Esse número de identificação já foi utilizado, por favor faça login ou recupere a sua senha.",
      });
    } else if (req.body.respostaSeguranca === "") {
      res.render("registar", {
        message: "Por favor escreva uma resposta de segurança!",
      });
    } else if (req.body.password !== req.body.repetirSenha) {
      res.render("registar", {
        message: "As password introduzidas não são iguais!",
      });
    } else if (req.body.password.length < 3) {
      res.render("registar", {
        message: "A sua senha deve ter pelo menos 3 digítos!",
      });
    } else {
      User.register(
        new User({
          nomes: req.body.nomes,
          sobrenomes: req.body.sobrenomes,
          username: req.body.username,
          nacionalidade: req.body.nacionalidade,
          dataNascimento: req.body.dataNascimento,
          estadoCivil: req.body.estadoCivil,
          genero: req.body.genero,
          numeroTelemovel: req.body.numeroTelemovel,
          numeroIdentificacao: req.body.numeroIdentificacao,
          perguntaSeguranca: req.body.perguntaSeguranca,
          respostaSeguranca: req.body.respostaSeguranca,
          dinheiro: 0,
          casasCompradas: [],
          imagemPerfil:
            "data:image/jpg;base64,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",
          admin: false,
        }),
        req.body.password,
        function (err, User) {
          if (err) {
            res.json({
              sucess: false,
              mensagem: "Não foi possivel guardar a sua conta. Erro: " + err,
            });
          } else {
            res.redirect("/entrar");
          }
        }
      );
    }
  };

  const postentrar = function (req, res) {
    if (!req.body.username) {
      res.render("entrar", { mensagem: "Não foi dado um nome de utilizador" });
    } else if (!req.body.password) {
      res.render("entrar", { mensagem: "A password não pode estar vazia" });
    } else {
      passport.authenticate("local", function (err, user, info) {
        if (err) {
          res.render("entrar", { mensagem: "erro: " + err });
        } else {
          if (!user) {
            res.render("entrar", {
              mensagem: "nome de utilizador or password incorreta",
            });
          } else {
            const cookie = jwt.sign({ userId: user._id }, "housedream", {
              expiresIn: "24h",
            });
            res.cookie("token", cookie, { maxAge: 24 * 60 * 60 * 1000 }); // Define o cookie com validade de 24 horas
            res.redirect("/inicial");
          }
        }
      })(req, res);
    }
  };

  const perfil = async (req, res, next) => {
    try {
      const token = req.cookies.token;
      const dadosDescodificados = jwt.decode(
        token,
        "housedream",
        (algorithms = ["HS256"])
      );
      console.log(dadosDescodificados.userId);
      const id = dadosDescodificados.userId;
  
      try {
        const usuario = await User.findById(id);
  
        if (!usuario) {
          return res.status(404).send("Usuário não encontrado");
        }
        const dataNascimentoFormatada =
          usuario.dataNascimento.toLocaleDateString("pt-PT");
        res.render("perfil", { usuario, dataNascimentoFormatada });
      } catch (err) {
        console.error("Erro ao obter informações do usuário:", err);
        res.status(500).send("Erro ao obter informações do usuário");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const mudarfotoperfil = async (req, res, next) => {
    const token = req.cookies.token;
    const dadosDescodificados = jwt.decode(
      token,
      "housedream",
      (algorithms = ["HS256"])
    );
    console.log(dadosDescodificados.userId);
    const id = dadosDescodificados.userId;
  
    try {
      const usuario = await User.findById(id);
  
      if (!usuario) {
        return res.status(404).send("Usuário não encontrado");
      }
      res.render("mudarfotoperfil", { usuario });
    } catch (err) {
      console.error("Erro ao obter informações do usuário:", err);
      res.status(500).send("Erro ao obter informações do usuário");
    }
  };

  const mudarsenha = function (req, res, next) {
    res.render("mudarsenha");
  };

  const postMudarsenha = async (req, res) => {
    let senhaAtual = req.body.passwordAtual; // Corrigido para passwordAtual
    let senhaNova = req.body.passwordNova; // Corrigido para passwordNova
    let senhaNovaRepetir = req.body.passwordNovaRepetir; // Corrigido para passwordNovaRepetir
    const token = req.cookies.token;
    const dadosDescodificados = jwt.decode(
      token,
      "housedream",
      (algorithms = ["HS256"])
    );
    const id = dadosDescodificados.userId;
    console.log(id);
    try {
      const usuario = await User.findById(id);
      console.log(usuario);
      if (senhaNova !== senhaNovaRepetir) {
        res.send("A nova senha introduzida não é igual na sua repetição");
      } else {
        try {
          // Corrigido para fornecer a senha atual e a nova senha corretamente
          await usuario.changePassword(senhaAtual, senhaNova);
          res.cookie("token", "", { expires: new Date(0) }); //Limopa os cookies
          res.redirect("/entrar"); //e rederecionar pro login
        } catch (err) {
          res.send("Introduziu a senha atual errada!");
        }
      }
    } catch (err) {
      console.error("Erro ao obter informações do usuário:", err);
      res.send("Erro ao obter informacoes do usuario");
    }
  };

  
  // Configuração do Multer
  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });

const postMudarFotoPerfil = async (req, res, next) => {
    try {
      // Verifica se uma imagem foi enviada
      if (!req.file) {
        return res.status(400).send("Nenhuma imagem foi enviada");
      }

      // Converte a imagem para base64
      const imageBuffer = req.file.buffer;
      const base64Image = imageBuffer.toString("base64");

      // Atualiza o link da foto de perfil do usuário na base de dados
      const token = req.cookies.token;
      const dadosDescodificados = jwt.decode(
        token,
        "housedream",
        (algorithms = ["HS256"])
      );
      const id = dadosDescodificados.userId;

      // Encontra o usuário pelo ID
      const usuario = await User.findById(id);
      if (!usuario) {
        return res.status(404).send("Usuário não encontrado");
      }

      // Atualiza o link da foto de perfil
      usuario.imagemPerfil = "data:image/jpeg;base64," + base64Image;
      await usuario.save(); // Salva as alterações no banco de dados

      // Redireciona o usuário
      res.redirect("/perfil");
    } catch (err) {
      console.error("Erro ao atualizar a foto de perfil:", err);
      res.status(500).send("Erro ao atualizar a foto de perfil");
    }
  };

  const sair = function (req, res) {
    res.cookie("token", "", { expires: new Date(0) });
    return res.redirect("/entrar"); //e rederecionar pro login
  };

  const recuperarsenha = function (req, res) {
    res.render("recuperarsenha", { mensagem: " " });
  };
  
const postRecuperarSenha = async (req, res) => {
    try {
      const utilizador = await User.findOne({ username: req.body.username });
      const data = utilizador.dataNascimento;
      const ano = data.getFullYear();
      const mes = String(data.getMonth() + 1).padStart(2, "0");
      const dia = String(data.getDate()).padStart(2, "0");
      const dataFormatada = `${ano}-${mes}-${dia}`;
  
      if (req.body.nomes !== utilizador.nomes) {
        res.render("recuperarsenha", {
          mensagem: "O(s) nome(s) não corresponde aos dados do utilizador dado",
        });
      } else if (req.body.sobrenomes !== utilizador.sobrenomes) {
        res.render("recuperarsenha", {
          mensagem:
            "O(s) sobrenome(s) não corresponde aos dados do utilizador dado",
        });
      } else if (req.body.nacionalidade !== utilizador.nacionalidade) {
        res.render("recuperarsenha", {
          mensagem:
            "A nacionalidade não corresponde aos dados do utilizador dado",
        });
      } else if (req.body.dataNascimento !== dataFormatada) {
        res.render("recuperarsenha", {
          mensagem:
            "A data de nascimento não corresponde aos dados do utilizador dado",
        });
      } else if (req.body.estadoCivil !== utilizador.estadoCivil) {
        res.render("recuperarsenha", {
          mensagem: "O estado civil não corresponde aos dados do utilizador dado",
        });
      } else if (req.body.genero !== utilizador.genero) {
        res.render("recuperarsenha", {
          mensagem: "O genero não corresponde aos dados do utilizador dado",
        });
      } else if (req.body.numeroTelemovel !== utilizador.numeroTelemovel) {
        res.render("recuperarsenha", {
          mensagem:
            "O numero de telemóvel não corresponde aos dados do utilizador dado",
        });
      } else if (
        req.body.numeroIdentificacao !== utilizador.numeroIdentificacao
      ) {
        res.render("recuperarsenha", {
          mensagem:
            "O numero de identificação não corresponde aos dados do utilizador dado",
        });
      } else if (
        req.body.numeroIdentificacao !== utilizador.numeroIdentificacao
      ) {
        res.render("recuperarsenha", {
          mensagem:
            "O numero de identificação não corresponde aos dados do utilizador dado",
        });
      } else {
        if (req.body.nomes !== utilizador.nomes) {
          res.render("recuperarsenha", {
            mensagem: "O(s) nome(s) não corresponde aos dados do utilizador dado",
          });
        } else if (req.body.sobrenomes !== utilizador.sobrenomes) {
          res.render("recuperarsenha", {
            mensagem:
              "O(s) sobrenome(s) não corresponde aos dados do utilizador dado",
          });
        } else if (req.body.nacionalidade !== utilizador.nacionalidade) {
          res.render("recuperarsenha", {
            mensagem:
              "A nacionalidade não corresponde aos dados do utilizador dado",
          });
        } else if (req.body.dataNascimento !== dataFormatada) {
          res.render("recuperarsenha", {
            mensagem:
              "A data de nascimento não corresponde aos dados do utilizador dado",
          });
        } else if (req.body.estadoCivil !== utilizador.estadoCivil) {
          res.render("recuperarsenha", {
            mensagem:
              "O estado civil não corresponde aos dados do utilizador dado",
          });
        } else if (req.body.genero !== utilizador.genero) {
          res.render("recuperarsenha", {
            mensagem: "O genero não corresponde aos dados do utilizador dado",
          });
        } else if (req.body.numeroTelemovel !== utilizador.numeroTelemovel) {
          res.render("recuperarsenha", {
            mensagem:
              "O numero de telemóvel não corresponde aos dados do utilizador dado",
          });
        } else if (
          req.body.numeroIdentificacao !== utilizador.numeroIdentificacao
        ) {
          res.render("recuperarsenha", {
            mensagem:
              "O numero de identificação não corresponde aos dados do utilizador dado",
          });
        } else if (
          req.body.numeroIdentificacao !== utilizador.numeroIdentificacao
        ) {
          res.render("recuperarsenha", {
            mensagem:
              "O numero de identificação não corresponde aos dados do utilizador dado",
          });
        } else {
          res.redirect("/recuperar_senha_2?userID=" + utilizador._id);
        }
      }
    } catch (err) {
      res.render("recuperarsenha", {
        mensagem: "Não existe um utilizador com esse nome de utilizador",
      });
    }
  };

  const recuperar_senha_2 = async (req, res) => {
    try {
      const userID = req.query.userID;
      if (!userID) {
        res.redirect("/recuperar_senha");
      } else {
        try {
          const utilizador = await User.findById(userID); // Aguardar a resolução da promessa
          if (!utilizador) {
            return res.redirect("/recuperarsenha");
          } else {
            res.render("recuperarsenha2", {
              pergunta: utilizador.perguntaSeguranca,
              mensagem: "",
            });
          }
        } catch (err) {
          res.send(err);
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Erro ao processar a solicitação");
    }
  };

  const postRecuperarSenha2 = async (req, res) => {
    try {
      const userID = req.query.userID;
      console.log(userID);
      if (!userID) {
        return res.redirect("/recuperar_senha");
      } else {
        const utilizador = await User.findById(userID); // Aguardar a resolução da promessa
  
        if (!utilizador) {
          return res.redirect("/recuperar_senha");
        } else if (req.body.respostaSeguranca !== utilizador.respostaSeguranca) {
          console.log(utilizador.respostaSeguranca);
          console.log(req.body.respostaSeguranca);
          res.render("recuperarsenha2", {
            pergunta: utilizador.perguntaSeguranca,
            mensagem:
              "A resposta de segurança não corresponde aos dados do utilizador dado",
          });
        } else {
          if (req.body.novasenha !== req.body.repetir_senha) {
            res.render("recuperarsenha2", {
              pergunta: utilizador.perguntaSeguranca,
              mensagem: "As senhas não são iguais",
            });
          } else {
            try {
              await utilizador.setPassword(req.body.novasenha);
              await utilizador.save();
  
              res.cookie("token", "", { expires: new Date(0) });
              res.redirect("/entrar"); //e rederecionar pro login
            } catch (err) {
              res.send("Ocorreu algum erro!");
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Erro ao processar a solicitação");
    }
  };
  
  const chaveAPI = process.env.chaveAPI;
  const Authorization = process.env.Authorization;

  const openai = new OpenAI({
    apiKey: chaveAPI,
  });

  

  const gerar_pergunta_seguranca = async (req, res) => {
    try {
      
      // Chame a API do ChatGPT para gerar a pergunta de segurança
      const prompt = "Qual é a sua pergunta de segurança?";
      const completion = await axios.post(
        
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content:
                "Dá-me uma pergunta que possa ser usada como pergunta de segurança. Evita repetir. Dá me apenas uma pergunta por vez sem mais nada, de forma a puder usar na API do ChatGPT!",
            },
          ],
          temperature: 1.7,
          max_tokens: 400,
        },
        {
          headers: {
            "Content-Type": "application/json",
            
            Authorization: Authorization,
          },
        }
      );
      // Retorne a pergunta de segurança gerada
      res.json({
        perguntaSeguranca: completion.data.choices[0].message.content.trim(),
      });
    } catch (error) {
      console.error("Erro ao gerar pergunta de segurança:", error);
      res.status(500).json({ error: "Erro ao gerar pergunta de segurança" });
    }
  };

  const carregarsaldo = function (req, res, next) {
    res.render("carregarsaldo", { mensagem: "" });
  };

  const postCarregarsaldo = async (req, res) => {
    const token = req.cookies.token;
    const dadosDescodificados = jwt.decode(
      token,
      "housedream",
      (algorithms = ["HS256"])
    );
    console.log(dadosDescodificados.userId);
    const id = dadosDescodificados.userId;
    let hoje = new Date();
    let dd = String(hoje.getDate()).padStart(2, "0");
    let mm = String(hoje.getMonth() + 1).padStart(2, "0");
    let yyyy = hoje.getFullYear();
    hoje = yyyy + "-" + mm + "-" + dd;
    console.log(req.body.validade_cartao);
    console.log(req.body.hoje);
    if (
      req.body.valor == 0 ||
      req.body.valor == "" ||
      !Number.isInteger(Number(req.body.valor))
    ) {
      res.render("carregarsaldo", {
        mensagem: "O valor de saldo a carregar inserido não é válido!",
      });
    } else if (!Number.isInteger(Number(req.body.numero_cartao))) {
      res.render("carregarsaldo", {
        mensagem: "O número do cartão inserido não é válido!",
      });
    } else if (!regex.test(req.body.nome_cartao)) {
      res.render("carregarsaldo", {
        mensagem: "O nome do cartão não pode conter números",
      });
    } else if (
      !Number.isInteger(Number(req.body.cvc_cartao)) ||
      (req.body.cvc_cartao.length !== 4 && req.body.cvc_cartao.length !== 3)
    ) {
      res.render("carregarsaldo", { mensagem: "O CVC introduzido é invalido" });
    } else if (req.body.validade_cartao < hoje) {
      res.render("carregarsaldo", { mensagem: "O cartão já expirou" });
    } else {
      try {
        const usuario = await User.findById(id);
        console.log(usuario.dinheiro);
  
        const dinheiro = Number(usuario.dinheiro) + Number(req.body.valor);
        usuario.dinheiro = dinheiro;
        usuario.save();
        res.redirect("/perfil");
      } catch (err) {
        console.error("Erro ao obter informações do usuário:", err);
        res.status(500).send("Erro ao obter informações do usuário");
      }
    }
  };
  module.exports = {postCarregarsaldo, carregarsaldo, entrar, registar, postregistar, postentrar, perfil, mudarfotoperfil, mudarsenha, postMudarsenha, postMudarFotoPerfil, sair, recuperarsenha, postRecuperarSenha, recuperar_senha_2, postRecuperarSenha2, gerar_pergunta_seguranca};