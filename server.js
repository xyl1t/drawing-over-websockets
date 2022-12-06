const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static("public"));

const components = [];
const previews = {};
const cursors = {};
const sockets = {};

io.on("connection", (socket) => {
  const token = socket.handshake.auth.token;
  if (token != "actualUser") socket.disconnect(true);

  console.log("a new cursor connected");
  const newCursor = {
    id: socket.id,
    name: "",
    color: getRandomColor(),
    x: 0,
    y: 0,
  };
  cursors[newCursor.id] = newCursor;
  console.log(cursors);
  socket.emit("yourCursor", newCursor);

  socket.on("disconnect", () => {
    console.log("cursor disconnected");
    delete cursors[socket.id];
    console.log(cursors);
  });

  socket.on("addComponent", (data) => {
    components.push(data);
  });

  socket.on("pushPreview", (p) => {
    previews[p.id] = p;
    console.log(previews)
  })

  socket.on("popPreview", (p) => {
    delete previews[p.id];
    console.log(previews)
  })

  socket.on("cursorUpdate", (cursor) => {
    // if (!cursors[cursor.id]) return;
    cursors[cursor.id] = cursor;
  });
});

function updateCanvas() {
  io.emit("updateCanvas", components, previews);
}
function updateCursors() {
  io.emit("updateCursors", cursors);
}

setInterval(updateCanvas, 1000 / 30);
setInterval(updateCursors, 1000 / 30);

const PORT = 9500;
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});

function getRandomColor() {
  return `rgb(${Math.floor(Math.random() * 255)},${Math.floor(
    Math.random() * 255
  )},${Math.floor(Math.random() * 255)})`;
}
