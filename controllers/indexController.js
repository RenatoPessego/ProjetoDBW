
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

//Verificar login
function verificarToken(req, res, next) {
    // Obtém o token dos cookies
    const token = req.cookies.token;
  
    // Verifica se o token está presente
    if (!token) {
      return res.redirect("/entrar"); // Redireciona para a página de login se não houver token
    }
  
    // Verifica se o token é válido
    jwt.verify(token, "housedream", function (err, decoded) {
      if (err) {
        return res.redirect("/entrar"); // Redireciona para a página de login se o token for inválido
      }
      // Se o token for válido, avança para a próxima middleware
      req.userId = decoded.userId;
      next();
    });
  }

  // Aplicar o middleware verificarToken à rota '/inicial'

function aleatorizararray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

 const inicial = async (req, res, next) => {
    try {
      let title = "";
      const casas = await Casa.find({
        aVenda: true,
      });
      const paises = await Casa.distinct("pais");
      const cidades = await Casa.distinct("cidade");
      let arraycasas = casas;
      if (arraycasas.length > 3) {
        title = "";
        arraycasas = aleatorizararray(arraycasas).slice(0, 3);
      } else if (arraycasas.length == 0) {
        title = "Sem casas a venda";
      } else {
        title = "";
      }
      console.log(title);
      res.render("inicial", {
        casasbaralhadas: arraycasas,
        paises: paises,
        cidades: cidades,
        title,
      });
    } catch (err) {
      console.log(err);
      res.render("/suporte");
    }
  };
  const primaria = function (req, res, next) {
    res.render("primaria", { title: "Primaria" });
  };

  const sobrenos = function (req, res, next) {
    console.log("Aqui");
    res.render("sobrenos", { title: "sobrenos" });
  };

  
  // Configuração do Multer
  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });

  module.exports = {inicial, verificarToken, primaria, sobrenos};