const JWT = require("../Helpers/Jsonwebtoken");
function authentication(req, res, next) {
    const { access_token } = req.headers;
    try {
        const userData = JWT.verify(access_token);
        req.userData = userData;
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = authentication;
