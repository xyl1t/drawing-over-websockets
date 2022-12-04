const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static("public"));

const components = [];

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("new user", (data) => {
    console.log("a new user connected");
    console.log(data);
    socket.broadcast.emit("new user", data);
  });

  socket.on("click", (data) => {
    const { x, y, color } = data;
    components.push(data);
    console.log(`click: ${x}, ${y}, ${color}`);
  });
});


function sendUpdate() {
  io.emit("update canvas", components);
}

setInterval(sendUpdate, 25);

const PORT = 9500;
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
