const jwt = require("jsonwebtoken")

const Auth = async function (req, res, next) {
    try {

        let authHeader = req.headers['authorization']
        if (!authHeader) {
            res.status(401).send({ status: false, Message: 'Mandatory authentication token is missing.' })
        } else {
            let tokenindex = authHeader && authHeader.split(' ')[1]
            let decodedtoken = jwt.verify(tokenindex,"Group8")
            if (decodedtoken) {
                req.user= decodedtoken
                // console.log(decodedtoken)
                next()
            }
        }
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

module.exports.Auth = Auth