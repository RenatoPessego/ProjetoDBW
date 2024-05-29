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

const vendernossosite = async (req, res, next) => {
    const token = req.cookies.token;
    const dadosDescodificados = jwt.decode(
      token,
      "housedream",
      (algorithms = ["HS256"])
    );
    const userid = dadosDescodificados.userId;
    try {
      const usuario = await User.findById(userid);
      if (!usuario) {
        return res.redirect("/entrar");
      }
      const casas = await Casa.find({
        aVenda: false,
        _id: { $in: usuario.casasCompradas },
      });
      const title = casas.length > 0 ? "" : "Sem casas";
      res.render("vendernossosite", { todascasas: casas, title });
    } catch (err) {
      console.log(err);
      res.render("vendernossosite", { title: "" });
    }
  };

  const detalhesVendernossosite = async (req, res) => {
    try {
      const casaid = req.query.casaid;
      const infocasa = await Casa.findById(casaid);
      if (casaid == null || infocasa == null) {
        return res.redirect("/vendernossosite");
      }
      res.render("detalhescasa", { infocasa: infocasa });
    } catch (err) {
      res.redirect("/vendernossosite");
    }
  };

  const vendernossositeVender =   async (req, res, next) => {
    try {
      const casaid = req.query.casaid;
      const infocasa = await Casa.findById(casaid);
      if (casaid == null || infocasa == null) {
        return res.redirect("/vendernossosite");
      }
      res.render("vendercasasite", {
        infocasa: infocasa,
        title: "",
      });
    } catch (err) {
      res.redirect("/vendernossosite");
    }
  };
  
const postVendernossosite = async (req, res, next) => {
    const token = req.cookies.token;
    const dadosDescodificados = jwt.decode(
      token,
      "housedream",
      (algorithms = ["HS256"])
    );
    const userid = dadosDescodificados.userId;
    const regex = "^d+$";
    try {
      console.log(req.body);
      const usuario = await User.findById(userid);
      const casa = await Casa.findById(req.body.casa_id);
      try {
        if (!Number.isInteger(Number(req.body.preco_imovel))) {
          res.render("vendercasasite", {
            infocasa: casa,
            title: "O preço não é válido, deverá ser inteiro!",
          });
        } else {
          casa.preco = req.body.preco_imovel;
          casa.aVenda = true;
          casa.descricaoDetalhada = req.body.descricao_imovel;
          await casa.save();
          res.redirect("/vendernossosite");
        }
      } catch (err) {
        console.log(err);
        res.render("vendernossosite", { title: "ERRO" });
      }
    } catch (err) {
      console.log(err);
      res.render("vendernossosite", { title: "ERRO" });
    }
  };
  const postVendernossositedetalhes =  async (req, res, next) => {
    const token = req.cookies.token;
    const dadosDescodificados = jwt.decode(
      token,
      "housedream",
      (algorithms = ["HS256"])
    );
    const userid = dadosDescodificados.userId;
    try {
      console.log(req.body);
      const usuario = await User.findById(userid);
      const casa = await Casa.findById(req.body.homeId);
      req.body.comment = usuario.username + ": " + req.body.comment;
      // Add req.body.comment to the array of comments
      casa.comentarios.push(req.body.comment);
      await casa.save();
      res.redirect("/vendernossosite/detalhes?casaid=" + req.body.homeId);
    } catch (err) {
      res.render("vendernossosite", { title: "" });
    }
  };

const comprar = async (req, res, next) => {
    try {
      const paises = await Casa.distinct("pais");
      const cidades = await Casa.distinct("cidade");
      const casas = await Casa.find({ aVenda: true }).sort({ preco: 1 });
      console.log(casas);
      const title = casas.length > 0 ? "" : "Sem casas";
      res.render("comprar", {
        todascasas: casas,
        paises: paises,
        cidades: cidades,
        title,
      });
    } catch (err) {
      console.log(err);
      res.redirect("/inicial");
    }
  };

const comprarDetalhescomprar = async (req, res) => {
    try {
      const casaid = req.query.casaid;
      const infocasa = await Casa.findById(casaid);
      if (casaid == null || infocasa == null) {
        return res.redirect("/comprar");
      }
      res.render("detalhescomprarcasa", { infocasa: infocasa });
    } catch (err) {
      res.redirect("/comprar");
    }
  };

const postComprar = async (req, res, next) => {
    const ordenacao = req.body.ordenarPreco;
    const pais = req.body.pais;
    const cidade = req.body.cidade;
    const area = req.body.area;
    const preco = req.body.preco;
    const acessibilidade = req.body.acessibilidade;
    let filtros = { aVenda: true };
    console.log(pais);
    console.log(ordenacao);
    if (ordenacao === "decrescente") {
      ordenacaoPreco = -1;
    } else {
      ordenacaoPreco = 1;
    }
    // Adicionar os filtros ao array filtros
    if (pais && pais !== "") {
      filtros.pais = pais;
    }
    if (cidade && cidade !== "") {
      filtros.cidade = cidade;
    }
  
    // Adicionar os filtros de area para cada caso especifico
    if (area && area !== "") {
      switch (area) {
        case "area50":
          filtros.area = { $lte: 50 };
          break;
        case "area100":
          filtros.area = { $gt: 50, $lte: 100 };
          break;
        case "area150":
          filtros.area = { $gt: 100, $lte: 150 };
          break;
        case "area200":
          filtros.area = { $gt: 150, $lte: 200 };
          break;
        case "area250":
          filtros.area = { $gt: 200, $lte: 250 };
          break;
        case "area300":
          filtros.area = { $gt: 250, $lte: 300 };
          break;
        case "areamaior300":
          filtros.area = { $gt: 300 };
          break;
      }
    }
  
    // Adicione os filtros de preço
    if (preco && preco !== "") {
      switch (preco) {
        case "preco100":
          filtros.preco = { $lte: 100000 };
          break;
        case "preco200":
          filtros.preco = { $gt: 100000, $lte: 200000 };
          break;
        case "preco300":
          filtros.preco = { $gt: 200000, $lte: 300000 };
          break;
        case "preco500":
          filtros.preco = { $gt: 300000, $lte: 500000 };
          break;
        case "precomais500":
          filtros.preco = { $gt: 500000 };
          break;
      }
    }
  
    if (acessibilidade && acessibilidade !== "") {
      filtros.acessibilidade = acessibilidade;
    }
  
    try {
      console.log(ordenacaoPreco);
      console.log(filtros);
      const casas = await Casa.find(filtros).sort({ preco: ordenacaoPreco });
      console.log(casas);
      const paises = await Casa.distinct("pais");
      const cidades = await Casa.distinct("cidade");
      const title = casas.length > 0 ? "" : "Sem casas";
  
      res.render("comprar", { todascasas: casas, paises, cidades, title });
    } catch (err) {
      console.log(err);
      res.render("comprar", { title: "Erro ao carregar casas" });
    }
  };

const comprarFinalizarcompra = async (req, res, next) => {
    try {
      const casaid = req.query.casaid;
      const infocasa = await Casa.findById(casaid);
      if (casaid == null || infocasa == null) {
        return res.redirect("/comprar");
      }
      console.log("Ids guardados");
      try {
        //Guardar cookies
        const token = req.cookies.token;
        const dadosDescodificados = jwt.decode(
          token,
          "housedream",
          (algorithms = ["HS256"])
        );

        const userid = dadosDescodificados.userId;
        console.log("cookies guardados");
        //Fim de guardar cookies

        const donoAtual = await User.findOne({ casasCompradas: casaid }); //guardar o dono atual
        const comprador = await User.findById(userid); //guardar o comprador
        const precoCasa = infocasa.preco; //guardar o preco da casa
        const dinheiroDonoAtual = donoAtual.dinheiro; //guardar o dinheiro do dono atual
        const dinheiroComprador = comprador.dinheiro; //guardar o dinheiro do comprador
        console.log("informações guardadas");
        console.log(donoAtual._id);
        console.log(comprador._id);
        if (dinheiroComprador < precoCasa) {
          res.redirect("/saldoinsuficiente"); //Fazer uma página de saldo insuficiente que dá a opção de voltar à pagina comprar ou carregar saldo
        } //Verificar se o dinheiro do comprador é superior ao preço
        else if (donoAtual.username === comprador.username) {
          res.redirect("/mesmodono?casaid=" + casaid);
        } else {
          console.log("Saldo Suficiente");
          try {
            const dinheiroCompradorFinal = dinheiroComprador - precoCasa; //Se for subtrair o preco ao dinheiro do comprador
            console.log("Dinheiro do comprador definido");
            console.log(dinheiroCompradorFinal);
            comprador.dinheiro = dinheiroCompradorFinal;
            const dinheiroDonoAtualFinal = dinheiroDonoAtual + precoCasa; //somar o preco ao dinheiro do dono atual
            console.log("Dinherio do vendedor definido");
            donoAtual.dinheiro = dinheiroDonoAtualFinal;
            await User.findByIdAndUpdate(donoAtual._id, {
              $pull: { casasCompradas: casaid },
            }); //tirar a casa do array do dono atual
            console.log("Casa tirada do array do dono atual");
            await User.findByIdAndUpdate(comprador._id, {
              $push: { casasCompradas: casaid },
            }); //adicionar a casas ao array do comprador
            console.log("Casa adicionada ao array do comprador");
            infocasa.aVenda = false; //tirar a casa do a venda
            console.log("tirada a casa da pagina venda");
            await donoAtual.save();
            console.log("dono Atual salvo");
            await comprador.save();
            console.log("comprador salvo");
            await infocasa.save();
            console.log("Informacao da casa salva");
            res.redirect("/minhaspropriedades"); //redirecionar para o perfil/minhas propriedas(se a fizermos)
            //Se der algum erro na compra voltar à pagina comprar
          } catch (err) {
            res.redirect("/comprar");
          }
        }
      } catch (err) {
        res.redirect("/comprar");
      }
    } catch (err) {
      res.redirect("/comprar");
    }
  };

  const minhaspropriedades = async (req, res) => {
    const token = req.cookies.token;
    const dadosDescodificados = jwt.decode(
      token,
      "housedream",
      (algorithms = ["HS256"])
    );
    const userid = dadosDescodificados.userId;
    try {
      const usuario = await User.findById(userid);
      if (!usuario) {
        return res.redirect("/entrar");
      }
      const casas = await Casa.find({
        _id: { $in: usuario.casasCompradas },
      });
      const title = casas.length > 0 ? "" : "Sem casas";
      res.render("minhaspropriedades", { todascasas: casas, title });
    } catch (err) {
      console.log(err);
      res.render("inicial");
    }
  };

  const saldoinsuficiente = function (req, res, next) {
    res.render("saldoinsuficiente");
  };

const mesmodono = function (req, res, next) {
    const casaid = req.query.casaid;
    res.render("mesmodono", { idcasa: casaid });
  };

const removercasavenda = async (req, res, next) => {
    try {
      const casaid = req.query.casaid;
      const casa = await Casa.findById(casaid);
      casa.aVenda = false;
      casa.save();
      res.redirect("/minhaspropriedades");
    } catch (err) {
      res.redirect("/inicial");
    }
  };

const detalhes = async (req, res, next) => {
    try {
      const casaid = req.query.casaid;
      const infocasa = await Casa.findById(casaid);
      if (casaid == null || infocasa == null) {
        return res.redirect("/minhaspropriedades");
      }
      res.render("detalhescasa", { infocasa: infocasa });
    } catch (err) {
      res.redirect("/minhaspropriedades");
    }
  };

const venderexternamente = function (req, res, next) {
    res.render("venderexternamente", { mensagem: "" });
  };

const postVenderexternamente =   async (req, res) => {
    const telefoneRegex = /^\+(?:[0-9] ?){6,14}[0-9]$/;
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    const token = req.cookies.token;
    const dadosDescodificados = jwt.decode(
      token,
      "housedream",
      (algorithms = ["HS256"])
    );
    const userid = dadosDescodificados.userId;
    try {
      const utilizador = await User.findById(userid);
      if (
        req.body.nomeImovel === "" ||
        req.body.nAndares === "" ||
        req.body.nQuartos === "" ||
        req.body.nAndares === "" ||
        req.body.nCasasBanho === "" ||
        req.body.area === "" ||
        req.body.nEstacionamento === "" ||
        req.body.classificacaoEnergetica === "" ||
        req.body.preco === "" ||
        req.body.pais === "" ||
        req.body.cidadecasa === "" ||
        req.body.numerotelemovel === "" ||
        req.body.email === ""
      ) {
        res.render("venderexternamente", {
          mensagem: "Tem algum parametro obrigatorio vazio",
        }); //verificar se todos os parametros obrigatorios estao preenchidos
      } else if (!regex.test(req.body.nomeImovel)) {
        res.render("venderexternamente", {
          mensagem: "Nao introduziu um valor valido para o nome Imovel",
        });
      } else if (!regex.test(req.body.pais)) {
        res.render("venderexternamente", {
          mensagem: "Nome de pais inválido",
        });
      } else if (!regex.test(req.body.cidadecasa)) {
        res.render("venderexternamente", {
          mensagem: "Nome de cidade inválido",
        });
      } else if (!telefoneRegex.test(req.body.numerotelemovel)) {
        res.render("venderexternamente", {
          mensagem:
            "Numero de telemovel inválido. Por favor inserir o número válido com o indicativo da região.",
        });
      } else if (req.files.length == "0") {
        res.render("venderexternamente", {
          mensagem: "Introduza pelo menos uma imagem para a casa",
        });
      } else if (req.files.length > "12") {
        res.render("venderexternamente", {
          mensagem: "Introduza no máximo 12 imagens",
        });
      } else if (req.body.classificacaoEnergetica == "") {
        res.render("venderexternamente", {
          mensagem: "Escolha uma classe energética",
        });
      } else if (!emailRegex.test(req.body.email)) {
        res.render("venderexternamente", {
          mensagem: "Escolha uma classe energética",
        });
      } else {
        console.log(req.body);
        // Aqui obtemos o caminho da imagem salvo
        const imagens = req.files;
        const linksdascasas = [];
        if (imagens && imagens.length > 0) {
          imagens.forEach((imagem) => {
            const base64Image = imagem.buffer.toString("base64");
            const url = "data:image/jpeg;base64," + base64Image;
            linksdascasas.push(url);
          });
        }
        console.log(linksdascasas);
        const casaNova = new Casa({
          aVenda: true,
          nomeImovel: req.body.nomeImovel,
          descricaoDetalhada: req.body.descricaoDetalhada,
          nAndares: req.body.nAndares,
          nQuartos: req.body.nQuartos,
          nCasasBanho: req.body.nCasasBanho,
          area: req.body.area,
          nEstacionamento: req.body.nEstacionamento,
          acessibilidade: req.body.acessibilidade,
          zonaExterior: req.body.zonaExterior,
          classificacaoEnergetica: req.body.classificacaoEnergetica,
          piscina: req.body.piscina,
          varanda: req.body.varanda,
          garagem: req.body.garagem,
          elevador: req.body.elevador,
          arCondicionado: req.body.arCondicionado,
          jardim: req.body.jardim,
          preco: req.body.preco,
          pais: req.body.pais,
          cidade: req.body.cidadecasa,
          nTelemovel: req.body.numerotelemovel,
          email: req.body.email,
          imagensCasa: linksdascasas,
          comentarios: [],
        });
        utilizador.casasCompradas.push(casaNova._id);
        await utilizador.save();
        await casaNova.save();
        console.log("casasalva");
        res.redirect("/inicial");
      }
    } catch (err) {
      console.log(err);
    }
  };
module.exports = {postVenderexternamente, venderexternamente, detalhes, removercasavenda, mesmodono, saldoinsuficiente, minhaspropriedades, comprarFinalizarcompra, postComprar, comprarDetalhescomprar, comprar, postVendernossositedetalhes, vendernossosite, detalhesVendernossosite, vendernossositeVender, postVendernossosite};