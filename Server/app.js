require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { Chat, User } = require("./models/");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT = require("./Helpers/Jsonwebtoken");
const Controller = require("./Controllers/controller");
const errorHandel = require("./handlers/errorHandel");
const authentication = require("./handlers/middelware");

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
    allowEIO3: true,
});

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.post("/login", Controller.login);
app.post("/register", Controller.register);
app.get("/products", Controller.getProduct);

app.use(authentication);

app.get("/chat", Controller.getChat);
app.post("/products", Controller.postProduct);
app.post("/cart", Controller.postCart);
app.get("/cart", Controller.getCart);

app.use(errorHandel);

const UserClient = {};

io.on("connection", (socket) => {
    console.log("Client connected : ", socket.id);
    const access_token = socket.handshake.headers["access_token"];

    const decoded = JWT.verify(access_token);
    if (!decoded) return;
    UserClient[socket.id] = decoded;

    socket.on("message", async (data) => {
        try {
            const { message, clientName } = data;
            if (!message || !clientName)
                throw { message: "Message or receiver cannot be empty" };
            const dataReciever = await User.findOne({
                where: { username: clientName },
            });

            if (!dataReciever) throw { message: "Couldn't find user" };

            function findKeyById(targetId, dataObject) {
                for (const key in dataObject) {
                    if (dataObject[key].id === targetId) {
                        return key;
                    }
                }
                return null;
            }

            const resultKey = findKeyById(dataReciever.id, UserClient);

            const newChat = await Chat.create({
                type: "Personal",
                message,
                senderId: UserClient[socket.id].id,
                receiverId: dataReciever.id,
            });
            if (!newChat) throw { message: "Send message failed" };
            if (resultKey) {
                io.to(resultKey).emit("message", {
                    type: "Personal",
                    message,
                    sender: UserClient[socket.id].username,
                    receiver: dataReciever.username,
                });
            }
            io.to(socket.id).emit("message", {
                type: "Personal",
                message,
                sender: UserClient[socket.id].username,
                receiver: dataReciever.username,
            });
        } catch (error) {
            io.to(socket.id).emit("message", {
                type: "System",
                message: error.message,
                sender: "Admin",
            });
        }
    });
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

httpServer.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});
