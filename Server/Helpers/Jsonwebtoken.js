const jwt = require("jsonwebtoken");

class JWT {
    static sign(data) {
        return jwt.sign(data, process.env.JWT_SECRET);
    }
    static verify(access_token) {
        return jwt.verify(access_token, process.env.JWT_SECRET);
    }
}
module.exports = JWT;
