$(() => {
  // setup
  console.log("Loading canvas...");
  const canvas = document.querySelector("#canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx = canvas.getContext("2d");

  ctx.beginPath();
  ctx.arc(240, 160, 20, 0, Math.PI * 2, false);
  ctx.fillStyle = "green";
  ctx.fill();
  ctx.closePath();

  canvas.addEventListener("click", click, false);

  socket = io();

  socket.on("canvasUpdate", (data) => {
    const {x, y} = data;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2, false);
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.closePath();
  });
});

function click(event) {
  const x = event.pageX - canvas.offsetLeft;
  const y = event.pageY - canvas.offsetTop;

  socket.emit("click", {x, y});

  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2, false);
  ctx.fillStyle = "green";
  ctx.fill();
  ctx.closePath();
}
