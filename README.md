// 1. aws-s3 and aws-sdk // step1: multer will be used as usual ( from fs learnings) // step2(BEST PRACTICE): always write s3 uploadFile code spereately - in a spereate function/file... expect this function to take file as input and give url of uploaded file as output // step 3: aws-sdk install as package // step 4: setup config for aws - authentication // step5: build the function for uploading file- marked HERE in index.js

// 2. Promises

// a) You can never use await on callback..if you are awaiting a function or a task , you can be sure that the task(function)_ has a promise written iside it
// b) how to write promise:  wrap your entire code within " return new Promise(function (resolve, reject) { ........   }"  and when error- return reject(err)... else when data, return resolve(data)




// config AWS

// step1: multer will be used as usual 
// step2(BEST PRACTICE): always write s3 uploadFile code spereately - in a spereate function/file... expect this function to take file as input and give url of uploaded file as output 
// step 3: aws-sdk install as package
// step 4: setup config for aws - authentication
// step5: build the function for uploading file- marked HERE

// 1. aws-s3 and aws-sdk


// 2. Promises

      // a) You can never use await on callback..if you are awaiting a function or a task , you can be sure that the task(function)_ has a promise written iside it
      // b) how to write promise:  wrap your entire code within " return new Promise(function (resolve, reject) { ........   }"  and when error- return reject(err)... else when data, return resolve(data)
	  c) call back hell :- When you write a nested callback piece of code( one callback inside another, which is inside another callback and so on...) , your code becomes very difficult to read and manage- this is called callback hell in the tech community