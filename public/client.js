let ctx;
let socket;
let components = [];

$(() => {
  setup();
  loop();
});

function loop() {
  ctx.fillStyle = "#eee";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  for (const c of components) {
    if (c.type == "circle") {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = c.color;
      ctx.fill();
      ctx.closePath();
    }
  }

  window.requestAnimationFrame(loop);
}

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

  color = `rgb(${Math.floor(Math.random() * 255)},${Math.floor(
    Math.random() * 255
  )},${Math.floor(Math.random() * 255)})`;

  socket.emit("new user", color);

  socket.on("new user", (data) => {
    console.log(data);
  });

  // socket.on("click", (data) => {
  //   const { x, y, color } = data;
  //   ctx.beginPath();
  //   ctx.arc(x, y, 20, 0, Math.PI * 2, false);
  //   ctx.fillStyle = color;
  //   ctx.fill();
  //   ctx.closePath();
  // });
  socket.on("update canvas", (data) => {
    components = data;
  });
}

function click(event) {
  const x = event.pageX - canvas.offsetLeft;
  const y = event.pageY - canvas.offsetTop;

  socket.emit("click", {
    type: "circle",
    x,
    y,
    radius: 20,
    color,
  });

  // ctx.beginPath();
  // ctx.arc(x, y, 20, 0, Math.PI * 2, false);
  // ctx.fillStyle = color;
  // ctx.fill();
  // ctx.closePath();
}
