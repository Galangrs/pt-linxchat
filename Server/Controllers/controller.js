const { Chat, User, Product, Cart, sequelize } = require("../models/");
const { Op } = require("sequelize");
const JWT = require("../Helpers/Jsonwebtoken");
const Bcrypt = require("../Helpers/bycrpty");

class Controller {
    static async register(req, res, next) {
        const { username, password } = req.body;
        try {
            if (!username || !password) {
                throw {
                    name: "Register failed",
                    message: "username or password cannot be empty",
                    status: 401,
                };
            }

            if (username.split(" ").length > 1) {
                throw {
                    name: "Register failed",
                    message: "username 1 word only and cannot contain space",
                    status: 401,
                };
            }

            const isOneWord = /^[a-zA-Z0-9]+$/.test(username);
            if (!isOneWord) {
                throw {
                    name: "Register failed",
                    message:
                        "Username must contain only letters (A-Z, a-z) and numbers (0-9)",
                    status: 401,
                };
            }

            const dataUser = await User.findOne({ where: { username } });
            if (dataUser) {
                throw {
                    name: "Register failed",
                    message: "username already exists",
                    status: 401,
                };
            }
            const hashPassword = Bcrypt.hashPassword(password);
            const newUser = await User.create({
                username,
                password: hashPassword,
            });

            if (!newUser) {
                throw {
                    name: "Register failed",
                    message: "Failed to register",
                    status: 401,
                };
            }

            const access_token = JWT.sign({
                id: newUser.id,
                username: newUser.username,
            });

            res.status(201).json({ access_token });
        } catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        const { username, password } = req.body;
        try {
            if (!username || !password) {
                throw {
                    name: "Login failed",
                    message: "username or password cannot be empty",
                    status: 401,
                };
            }
            const dataUser = await User.findOne({ where: { username } });

            if (!dataUser) {
                throw {
                    name: "Login failed",
                    message: "Invalid username or password",
                    status: 401,
                };
            }
            if (
                !Bcrypt.comparePassword(password, dataUser.dataValues.password)
            ) {
                throw {
                    name: "Login failed",
                    message: "Invalid username or password",
                    status: 401,
                };
            }

            const access_token = JWT.sign({
                id: dataUser.id,
                username: dataUser.username,
            });

            res.status(200).json({ access_token });
        } catch (error) {
            next(error);
        }
    }

    static async getChat(req, res, next) {
        const { id } = req.userData;
        try {
            if (!id) {
                throw {
                    name: "get chat failed",
                    message: "invalid id user",
                    status: 400,
                };
            }

            const dataChat = await Chat.findAll({
                where: {
                    [Op.or]: [{ senderId: id }, { receiverId: id }],
                },
                include: [
                    { model: User, as: "sender" },
                    { model: User, as: "receiver" },
                ],
                order: [["id", "ASC"]],
            });

            const transformedData = dataChat.map((chat) => ({
                type: chat.type,
                message: chat.message,
                sender: chat.sender.username,
                receiver: chat.receiver.username,
            }));

            res.status(200).json(transformedData);
        } catch (error) {
            next(error);
        }
    }

    static async postProduct(req, res, next) {
        const { id } = req.userData;
        const { product, price, stock, img_url } = req.body;
        try {
            if (!id) {
                throw {
                    name: "post product failed",
                    message: "invalid id user",
                    status: 400,
                };
            }
            if (!product || !price || !stock || !img_url) {
                throw {
                    name: "post product failed",
                    message: "all field must be filled",
                    status: 400,
                };
            }

            if (isNaN(Number(price)) || isNaN(Number(stock))) {
                throw {
                    name: "post cart failed",
                    message: "price and stock must be numbers",
                    status: 400,
                };
            }

            const dataProduct = await Product.create({
                product,
                price,
                stock,
                img_url,
                userId: id,
            });

            res.status(201).json(dataProduct);
        } catch (error) {
            next(error);
        }
    }

    static async getProduct(req, res, next) {
        try {
            const dataProduct = await Product.findAll({
                include: [
                    {
                        model: User,
                        attributes: ["id", "username"],
                    },
                ],
            });
            const transformedData = dataProduct.map((product) => ({
                id: product.id,
                product: product.product,
                stock: product.stock,
                price: product.price,
                img_url: product.img_url,
                seller: product.User.username,
            }));
            res.status(200).json(transformedData);
        } catch (error) {
            next(error);
        }
    }

    static async postCart(req, res, next) {
        const { id } = req.userData;
        const { productId, totalItem } = req.body;
        let transactionInstance;

        try {
            if (!id) {
                throw {
                    name: "post cart failed",
                    message: "invalid id user",
                    status: 400,
                };
            }

            if (!productId || !totalItem) {
                throw {
                    name: "post cart failed",
                    message: "all fields must be filled",
                    status: 400,
                };
            }

            if (isNaN(Number(productId)) || isNaN(Number(totalItem))) {
                throw {
                    name: "post cart failed",
                    message: "productId and totalItem must be numbers",
                    status: 400,
                };
            }

            transactionInstance = await sequelize.transaction();

            const dataProduct = await Product.findOne({
                where: { id: productId },
                transaction: transactionInstance,
            });

            if (!dataProduct) {
                throw {
                    name: "post cart failed",
                    message: "product not found",
                    status: 400,
                };
            }

            if (totalItem > dataProduct.stock) {
                throw {
                    name: "post cart failed",
                    message: "stock not enough",
                    status: 400,
                };
            }

            await Product.update(
                { stock: sequelize.literal(`stock - ${totalItem}`) },
                { where: { id: productId }, transaction: transactionInstance }
            );

            const dataCart = await Cart.create(
                {
                    totalItem,
                    userId: id,
                    productId,
                    totalPrice: Number(dataProduct.price * totalItem),
                },
                { transaction: transactionInstance }
            );

            await transactionInstance.commit();
            delete dataCart.dataValues.updatedAt;
            delete dataCart.dataValues.createdAt;

            res.status(201).json({
                ...dataCart.dataValues,
                product: dataProduct.dataValues.product,
            });
        } catch (error) {
            if (transactionInstance) {
                await transactionInstance.rollback();
            }
            next(error);
        }
    }

    static async getCart(req, res, next) {
        const { id } = req.userData;
        try {
            if (!id)
                throw {
                    name: "get cart failed",
                    message: "invalid id user",
                    status: 400,
                };
            const dataCart = await Cart.findAll({
                where: { userId: id },
                include: [{ model: Product }],
            });

            const transformedData = dataCart.map((cart) => ({
                id: cart.id,
                totalItem: cart.totalItem,
                totalPrice: cart.totalPrice,
                product: cart.Product.product,
                img_url: cart.Product.img_url,
            }));

            res.status(200).json(transformedData);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = Controller;
