const ProductModel = require("../Models/productModel")
const aws = require("aws-sdk")
const mongoose = require("mongoose")

//===============VALIDATION====================
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidrequestBody = function (requestBody) {
    return Object.keys(requestBody).length !== 0

}
//const validObject = function (value) {
//  return mongoose.Types.ObjectId.isValid(value)
//}


const validSize = function (value) {
    return ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(value) !== -1
}
//====AWS=========
aws.config.update({
    accessKeyId: "AKIAY3L35MCRRMC6253G",  // id
    secretAccessKey: "88NOFLHQrap/1G2LqUy9YkFbFRe/GNERsCyKvTZA",  // like your secret password
    region: "ap-south-1" // Mumbai region
});


// this function uploads file to AWS and gives back the url for the file
let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) { // exactly 

        // Create S3 service object
        let s3 = new aws.S3({ apiVersion: "2006-03-01" });
        var uploadParams = {
            ACL: "public-read", // this file is publically readable
            Bucket: "classroom-training-bucket", // HERE
            Key: "pk_newFolder/productimages" + file.originalname, // HERE    "pk_newFolder/harry-potter.png" pk_newFolder/harry-potter.png
            Body: file.buffer,
        };

        // Callback - function provided as the second parameter ( most oftenly)
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err });
            }
            console.log(data)
            console.log(`File uploaded successfully. ${data.Location}`);
            return resolve(data.Location); //HERE 
        });
    });
};
//===============================================================================

const CreateProduct = async function (req, res) {
    try {
        const requestBody = req.body.data
        const JSONbody = JSON.parse(requestBody)
        console.log(JSONbody)
        const { title, description, price, isFreeShipping, style, availableSizes, installments } = JSONbody
        if (!isValidrequestBody(JSONbody)) {
            return res.status(400).send({ status: false, msg: "Provide product details you want to update" })
        }
        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: 'title is not valid' })

        }
        if (!validSize(availableSizes)) {
            return res.status(400).send({ status: false, msg: "Size does not match" })
        }
        if (!isValid(description)) {
            return res.status(400).send({ status: false, message: 'description is not valid' })

        }
        if (typeof price != "number") {
            return res.status(400).send({ status: false, message: 'Enter a valid price' })

        }
        // let lc = title.toLowerCase()
        let findTitle = await ProductModel.find({ title: title.toLowerCase() })
        if (findTitle.length != 0) {
            res.status(400).send({ status: false, msg: "title already exists" })
        }

        let files = req.files;
        if (files && files.length > 0) {
            //upload to s3 and return true..incase of error in uploading this will goto catch block( as rejected promise)
            var uploadedFileURL = await uploadFile(files[0]); // expect this function to take file as input and give url of uploaded file as output 
            //   res.status(201).send({ status: true, data: uploadedFileURL });
            const ProductData = {
                title: title, description: description, price: price, currencyId: "₹", currencyFormat: "INR",
                isFreeShipping: isFreeShipping, productImage: uploadedFileURL, style: style, availableSizes: availableSizes, installments: installments
            }
            let saveProduct = await ProductModel.create(ProductData)
            res.status(201).send({ status: true, message: "Product successfully created", data: saveProduct })


        } else {
            res.status(400).send({ status: false, msg: "Please upload a product image" });
        }
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports.CreateProduct = CreateProduct
//===================================================================================================
const GetProducts = async function (req, res) {
    try {
        let Size = req.query.Size
        let name = req.query.name
        let priceSort = req.query.priceSort
        let priceGreaterThan = req.query.priceGreaterThan
        let priceLessThan = req.query.priceLessThan
        let priceObj = {}
        if (priceGreaterThan) {
            priceObj["$gt"] = priceGreaterThan
        }
        if (priceLessThan) {
            priceObj["$lt"] = priceLessThan
        }
        if (priceLessThan || priceGreaterThan) {
            let priceSearch = await ProductModel.find({ price: priceObj, isDeleted: false }).sort({ price: priceSort })
            console.log(priceSearch)
            if (priceSearch.length != 0) {
                return res.status(200).send({ status: true, msg: "Success", data: { priceSearch } })
            } else {
                return res.status(400).send({ status: false, msg: "No matches in this price range found" })
            }
        }
        if (Size) {
            let findSize = await ProductModel.find({ availableSizes: Size, isDeleted: false }).sort({ price: priceSort })

            if (findSize.length != 0) {
                return res.status(200).send({ status: true, msg: "Success", data: { findSize } })
            } else {
                return res.status(400).send({ status: false, msg: `No products of size ${Size} found` })
            }
        }
        if (name) {
            let findName = await ProductModel.find({ title: { $regex: name, $options: 'i' }, isDeleted: false }).sort({ price: priceSort })
            // console.log(findName)
            if (findName.length != 0) {
                return res.status(200).send({ status: true, msg: "Success", data: { findName } })
            } else {
                return res.status(400).send({ status: false, msg: `No product of name ${name} found` })
            }
        }

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.GetProducts = GetProducts
//======================================================================
const getProductById = async function (req, res) {
    try {
        const findProduct = await ProductModel.findById({ _id: req.params.productId, isDeleted: false })
        if (!findProduct) {
            return res.status(400).send({ status: false, msg: "productId does not exists" })
        }
        res.status(200).send({ status: true, data: findProduct })
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.getProductById = getProductById
//================================================================================================
const update = async function (req, res) {
    try {
        let reqBody = req.body
        const { title, description, price, isFreeShipping, style, availableSizes, installments } = reqBody
        const findProduct = await ProductModel.findOne({ _id: req.params.productId, isDeleted: false })
        if (!findProduct) {
            return res.status(404).send({ status: false, msg: "product id does not exists" })
        }
        let files = req.files;
        if (files && files.length > 0) {
            //upload to s3 and return true..incase of error in uploading this will goto catch block( as rejected promise)
            var uploadedFileURL = await uploadFile(files[0]); // expect this function to take file as input and give url of uploaded file as output 
            //   res.status(201).send({ status: true, data: uploadedFileURL });
        }
        const ProductData = {
            title: title, description: description, price: price, currencyId: "₹", currencyFormat: "INR",
            isFreeShipping: isFreeShipping, productImage: uploadedFileURL,
            style: style, availableSizes: availableSizes, installments: installments
        }
        let updateProduct = await ProductModel.findOneAndUpdate({ _id: req.params.productId },
            ProductData, { new: true })
        res.status(200).send({ status: true, msg: 'Success', data: { updateProduct } })


    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.update = update
//=========================================================================
const productDel=async function (req, res){
    try{
        const find=await ProductModel.findOneAndUpdate({_id:req.params.productId , isDeleted:false},{isDeleted:true,deletedAt:new Date()},{new:true})
        if(!find){
           return res.status(404).send({status:false,msg:"productId does not exists"})
        }
        res.status(201).send({status:true,data:find})


    }catch(err){
        res.status(500).send({status:false, msg:err.message})
    }
}
module.exports.productDel=productDel