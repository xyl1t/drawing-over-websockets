let ctx;
let socket;
let color;

$(() => {
  setup();
});

function setup() {
  // setup
  console.log("Loading canvas and context...");
  const canvas = document.querySelector("#canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.addEventListener("click", click, false);

  ctx = canvas.getContext("2d");

  console.log("Loading socket...");
  socket = io();

  color = `rgb(${Math.floor(Math.random() * 255)},
${Math.floor(Math.random() * 255)},
${Math.floor(Math.random() * 255)})`;

  socket.emit("new user", color);

  socket.on("new user", (data) => {
    console.log(data);
  });

  socket.on("canvasUpdate", (data) => {
    const { x, y, color } = data;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
  });
}

function click(event) {
  const x = event.pageX - canvas.offsetLeft;
  const y = event.pageY - canvas.offsetTop;

  socket.emit("click", { x, y, color });

  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2, false);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}
