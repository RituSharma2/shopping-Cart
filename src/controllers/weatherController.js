const axios = require("axios");


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








const getWeather = async function (req, res) { 
  try {

      let cities=  ["Bengaluru","Mumbai", "Delhi", "Kolkata", "Chennai", "London", "Moscow"]
      let cityObjArray=[] 

      // [ { city: "bengaluru", temp: 290}, { city: "Mumbai", temp: 285} ,{ city: "Delhi", temp: 291}, { city: "Kolkata", temp: 288} ]

      //better to use for..of here
      for (i=0 ;i<cities.length; i++){
        
          let obj= { city: cities[i] }
          let resp=  await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${cities[i]}&appid=f1a93c7f2832ca822dc0920253b1614a`)
          console.log(resp.data.main.temp)

          obj.temp= resp.data.main.temp

          cityObjArray.push(obj)
      }

      let sorted = cityObjArray.sort(  function(a, b) { return a.temp - b.temp } )
      // can pass cityObjArray also here as sort method does sorting on the same array(in place) and original array is replaced by the sorted one
      //either ways both(sorted and cityObjArray) are referring to same array..assignment by reference is the default assignment in an array
      console.log(sorted)
      res.status(200).send({status: true, data: sorted}) // can pass cityObjArray also here as sort method does sorting on the same array(in place) and original array is replaced by the sorted one
  } catch (error) {
      console.log(error)
      res.status(500).send({status: false, msg: "server error"})
  }
}



module.exports.getWeather = getWeather;
