const jwt = require("jsonwebtoken")


const Token = (id) => {
    return jwt.sign(
        {id},
        process.env.JSON_SECRET,
        {expiresIn: '1h'}
    )
}

module.exports = Token;