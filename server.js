const express = require("express");
const socket = require("socket.io");

// App setup
const PORT = 5000;
const app = express();
const server = app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});

// Static files
app.use(express.static("public"));

// Socket setup
const io = socket(server);
var adminUser
const activeUsers = new Set();
const blockedUsers = new Set()

io.on("connection", function (socket) {
    console.log("Made socket connection");

    socket.on("blockthisuser", (user) => {
        var temp = {
            socket,
            user
        };
        blockedUsers.add(temp)
        io.emit("userBlocked", [user])
    })

    socket.on("newUser", (data) => {
        socket.userId = data;
        //the first in the chat would be admin
        if (activeUsers.size === 0) {
            adminUser = data;
        }

        console.log("admin user");
        io.emit("admin", adminUser)
        activeUsers.add(data);
        io.emit("newUser", [...activeUsers]);
    });

    socket.on("disconnect", () => {
        activeUsers.delete(socket.userId);
        io.emit("disconnected", socket.userId);
    });

    socket.on("message", function (data) {
        io.emit("message", data);
    });
});