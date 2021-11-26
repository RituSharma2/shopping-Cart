const express = require('express');
const router = express.Router();

const cryptoController= require("../controllers/cryptoController")

router.get("/cryptoCoins", cryptoController.getTopCryptoCoins)


module.exports = router;