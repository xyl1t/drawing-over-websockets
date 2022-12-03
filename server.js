const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  socket.on("click", (data) => {
    const { x, y } = data;
    console.log("message: " + data);
    io.emit("canvasUpdate", data);
    console.log(`${x} ${y}`);
  });
  socket.broadcast.emit("a new user joined!!!");
});

const PORT = 9500;
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
