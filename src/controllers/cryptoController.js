const axios = require("axios");
const cryptoModel = require("../models/cryptoModel");

// Mental Notes for the assignment

// // incorrect
// arr.foreach( ele=> {

// })
// // await cant be used inside array funcitons

// arr = ["delhi", "mumbai", "london"]
// arr1= [
//   { city: london, temp: 10},
//   { city: delhi, temp: 20},
//   { city: bombay, temp: 14},
// ]

// arr1= []
// for ( ) loop over the array
// {
//   let weather = await axios("weather.com/arr[i]")
//   //  take temp out of it.. temp = weather.temp
//   arr1.push({ city: arr[i], temp: temp})
// }

// //  how to sort an array of objects using the value of one particular

// [
//   { city: london, temp: 10},
//   { city: delhi, temp: 20},
//   { city: bombay, temp: 14},
//   { city: rome, temp: 12}
// ]

const getTopCryptoCoins = async function (req, res) {
  try {
    //better to use for..of here
    var options = {
      method: "get",
      url: "https://api.coincap.io/v2/assets",
      headers: {
        Authorization: "Bearer a3ee4a5a-eb65-4aa9-90f0-612dfc24a8e3",
      },
    };

    let response = await axios(options);

    let coins = response.data.data;

    //   the above API gives back data for exactly 100 coins
    for (i = 0; i < coins.length; i++) {
      let coin = {
        symbol: coins[i].symbol,
        name: coins[i].name,
        marketCapUsd: coins[i].marketCapUsd,
        priceUsd: coins[i].priceUsd
      };

      await cryptoModel.findOneAndUpdate({ symbol: coins[i].symbol }, coin, { upsert: true, new: true } );
    }

    // Here, We are sorting the coins in descending order of %change in last 24 hours ( you can also do ascending order). You can read up on stackoverflow on how to sort an array of objects based on a particular property or key
    // sort funciton sorts the array in place i.e. it performs the sorting operation and replaces the original array
    coins.sort( function (a, b) { return b.changePercent24Hr - a.changePercent24Hr; });

    res.status(200).send({ status: true, data: coins });

  } catch (error) {
    console.log(error);
    res.status(500).send({ status: false, msg: "server error" });
  }
};

module.exports.getTopCryptoCoins = getTopCryptoCoins;
