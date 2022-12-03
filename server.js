const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("click", (data) => {
    const { x, y } = data;
    console.log("message: " + data);
    socket.broadcast.emit("canvasUpdate", data);
    console.log(`${x} ${y}`);
  });

  socket.on("new user", (data) => {
    console.log("a user connected");
    console.log(data);
    socket.broadcast.emit("new user", data);
  });

});

const PORT = 9500;
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
