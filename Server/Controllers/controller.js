const { Chat } = require("../models/");
const { Op } = require("sequelize");
const JWT = require("../Helpers/Jsonwebtoken");

class Controller {
    static async login(req, res) {
        const access_token = JWT.sign(req.body.username);
        res.status(201).json({ access_token });
    }
    static async getChat(req, res) {
        const { access_token } = req.headers;
        const decoded = JWT.verify(access_token);
        if (decoded) {
            const data = await Chat.findAll({
                where: {
                    [Op.or]: [
                        {
                            sender: decoded,
                        },
                        {
                            receiver: decoded,
                        },
                        {
                            type: "Global",
                        },
                    ],
                },
            });
            res.status(200).json(data);
        } else {
            res.status(401).json({ message: "Invalid access_token" });
        }
    }
}

module.exports = Controller;
