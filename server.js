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

  socket.on("new component", (data) => {
    const { x, y, color } = data;
    components.push(data);
    // if (components.length > 10) components.shift();
    console.log('new component:', data);
  });
  socket.on("test", (data) => {
    console.log(data)
  })
});


function sendUpdate() {
  io.emit("update canvas", components);
}

setInterval(sendUpdate, 50);

const PORT = 9500;
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
