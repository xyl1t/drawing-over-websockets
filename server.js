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

const theServer = {
  name: "server",
  color: "rgb(255,0,0)",
};


io.on("connection", (socket) => {
  const token = socket.handshake.auth.token;
  if (token != "actualUser") socket.disconnect(true);

  const newCursor = {
    id: socket.id,
    name: "",
    color: getRandomColor(),
    x: 0,
    y: 0,
    lastHeartbeat: new Date().getTime(),
  };
  cursors[newCursor.id] = newCursor;
  sockets[newCursor.id] = socket;

  console.log("a new cursor connected", newCursor);
  console.log("all cursors", cursors);
  socket.emit("yourCursor", newCursor);
  socket.broadcast.emit("chat", theServer, "A new cursor joined!");

  socket.on("disconnect", () => {
    console.log("cursor disconnected");
    delete cursors[socket.id];
    console.log(cursors);
  });

  socket.on("addComponent", (data) => {
    components.push(data);
    // updateCanvas();
  });

  socket.on("pushPreview", (p) => {
    previews[p.id] = p;
    // console.log(previews)
  });

  socket.on("popPreview", (p) => {
    delete previews[p.id];
    // console.log(previews)
  });

  socket.on("cursorUpdate", (cursor) => {
    if (!cursors[cursor.id]) return;
    cursors[cursor.id] = cursor;
  });

  socket.on("chat", (cursor, msg) => {
    console.log("chat", cursor, msg)
    io.emit("chat", cursor, msg);
  })

  socket.on("pulse", (cursor) => {
    if (!cursors[cursor.id]) return;
    cursors[cursor.id].lastHeartbeat = new Date().getTime();
    // console.log(cursor.id, cursors[cursor.id].lastHeartbeat, cursors)
  });
});

function updateCanvas() {
  io.emit("updateCanvas", components, previews);
}
function updateCursors() {
  for (const id in cursors) {
    if (cursors[id].lastHeartbeat + 60000 < new Date().getTime()) {
      console.log("dead ", cursors[id])
      sockets[id].disconnect();
    }
  }
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
