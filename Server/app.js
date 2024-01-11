require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { Chat } = require("./models/");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT = require("./Helpers/Jsonwebtoken");
const Controller = require("./Controllers/controller");

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
app.get("/getchat", Controller.getChat);
const User = {};

io.on("connection", (socket) => {
    const access_token = socket.handshake.headers["access_token"];
    const decoded = JWT.verify(access_token);
    if (decoded) {
        User[socket.id] = decoded;
    }

    socket.on("message", (data) => {
        if (access_token) {
            const { message, type, clientName } = data;

            if (type === "Personal") {
                const senderUsername = User[socket.id];

                const receiverSocketId = Object.keys(User).find(
                    (socketId) => User[socketId] === clientName
                );
                Chat.create({
                    sender: User[socket.id],
                    receiver: User[receiverSocketId],
                    type: "Personal",
                    message,
                })
                    .then((res) => {
                        if (receiverSocketId) {
                            io.to(receiverSocketId).emit("message", {
                                type: "Personal",
                                sender: senderUsername,
                                message: message,
                            });
                            io.to(socket.id).emit("message", {
                                type: "Personal",
                                sender: User[socket.id],
                                message: message,
                            });
                        }
                    })
                    .catch((err) => {
                        if (receiverSocketId) {
                            io.to(receiverSocketId).emit("message", {
                                type: "Personal",
                                sender: senderUsername,
                                message: "Error message",
                            });
                            io.to(socket.id).emit("message", {
                                type: "Personal",
                                sender: User[socket.id],
                                message: "Error message",
                            });
                        }
                    });
            } else if (type === "Global") {
                Chat.create({
                    sender: User[socket.id],
                    receiver: null,
                    type: "Global",
                    message,
                })
                    .then((data) => {
                        io.emit("message", {
                            type: "Global",
                            sender: User[socket.id],
                            message: message,
                        });
                    })
                    .catch((err) => {
                        io.emit("message", {
                            type: "Global",
                            sender: User[socket.id],
                            message: "Error message",
                        });
                    });
            }
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
