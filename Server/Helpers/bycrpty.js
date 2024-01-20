const bcrypt = require("bcrypt");

class Bcrypt {
    static hashPassword(password) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        return hash;
    }
    static comparePassword(password, hash) {
        return bcrypt.compareSync(password, hash);
    }
}
module.exports = Bcrypt;
