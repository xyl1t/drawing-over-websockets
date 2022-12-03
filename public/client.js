$(() => {
  // setup
  setup();
});

function setup() {
  console.log("Setting up...");
  leftButtonDown = false;
  $(document).mousedown(function (e) {
    // Left mouse button was pressed, set flag
    if (e.which === 1) leftButtonDown = true;
  });
  $(document).mouseup(function (e) {
    // Left mouse button was released, clear flag
    if (e.which === 1) leftButtonDown = false;
  });

  const canvas = document.querySelector("#canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx = canvas.getContext("2d");

  canvas.addEventListener("click", click, false);
  canvas.addEventListener("mousemove", move, false);

  socket = io();

  socket.on("canvasUpdate", (data) => {
    const { x, y } = data;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2, false);
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.closePath();
  });
}

function click(event) {
  const x = event.pageX - canvas.offsetLeft;
  const y = event.pageY - canvas.offsetTop;

  socket.emit("click", { x, y });

  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2, false);
  ctx.fillStyle = "green";
  ctx.fill();
  ctx.closePath();
}

var newX;
var newY;

function move(event) {
  if (leftButtonDown) {
    if (newX) {
      oldX = newX;
      oldY = newY;
      newX = event.pageX - canvas.offsetLeft;
      newY = event.pageY - canvas.offsetTop;

      ctx.beginPath();
      ctx.moveTo(oldX, oldY);
      ctx.lineTo(newX, newY);
      ctx.stroke();
    } else {
      newX = event.pageX - canvas.offsetLeft;
      newY = event.pageY - canvas.offsetTop;
    }
  } else {
    newX = undefined;
  }
}
