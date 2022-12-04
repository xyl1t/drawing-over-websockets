let ctx;
let socket;
let components = [];
let currentTool;
let currentColor;
let preview;

$(() => {
  setup();
  loop();
});

class Tool {
  constructor(type) {
    this.type = type;
  }

  mousedown(e) {}
  mouseup(e) {}
  mousemove(e) {}
}

class Circle extends Tool {
  constructor() {
    super("circle");
  }

  mousedown(e) {
    this.x = e.x;
    this.y = e.y;
    this.cx = 0;
    this.cy = 0;
    this.rx = 0;
    this.ry = 0;
    this.color = currentColor;
    preview = this;
  }
  mousemove(e) {
    if (e.leftDown) {
      let startX = this.x;
      let startY = this.y;
      let endX = e.x;
      let endY = e.y;
      if (startX > endX) {
        [startX, endX] = [endX, startX];
      }
      if (startY > endY) {
        [startY, endY] = [endY, startY];
      }
      const width = endX - startX;
      const height = endY - startY;
      this.rx = width / 2;
      this.ry = height / 2;
      this.cx = startX + this.rx;
      this.cy = startY + this.ry;
    }
  }
  mouseup(e) {
    socket.emit("new component", this);
    components.push(this);
    preview = undefined;
  }
}

class Square extends Tool {
  constructor() {
    super("square");
  }

  mousedown(e) {
    this.x = e.x;
    this.y = e.y;
    this.width = 0;
    this.height = 0;
    this.color = currentColor;
    preview = this;
  }
  mousemove(e) {
    if (e.leftDown) {
      this.width = e.x - this.x;
      this.height = e.y - this.y;
    }
  }
  mouseup(e) {
    socket.emit("new component", this);
    components.push(preview);
    preview = undefined;
  }
}

class Line extends Tool {
  constructor() {
    super("line");
  }

  mousedown(e) {
    this.sx = e.x;
    this.sy = e.y;
    this.ex = e.x;
    this.ey = e.y;
    this.color = currentColor;
    preview = this;
  }
  mousemove(e) {
    if (e.leftDown) {
      this.ex = e.x;
      this.ey = e.y;
    }
  }
  mouseup(e) {
    socket.emit("new component", this);
    components.push(preview);
    preview = undefined;
  }
}

function draw(tool) {
  switch (tool?.type) {
    case "circle":
      ctx.beginPath();
      // ctx.arc(tool.x, tool.y, tool.radius, 0, Math.PI * 2, false);
      ctx.ellipse(tool.cx, tool.cy, tool.rx, tool.ry, 0, 0, Math.PI * 2, false);
      ctx.fillStyle = tool.color;
      ctx.fill();
      ctx.closePath();
      break;
    case "square":
      ctx.beginPath();
      ctx.rect(tool.x, tool.y, tool.width, tool.height);
      ctx.fillStyle = tool.color;
      ctx.fill();
      break;
    case "line":
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = tool.color;
      ctx.moveTo(tool.sx, tool.sy);
      ctx.lineTo(tool.ex, tool.ey);
      ctx.stroke();
      break;
  }
}

function setup() {
  // setup
  console.log("Loading canvas and context...");
  const canvas = document.querySelector("#canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.addEventListener("mousedown", mousedown, false);
  canvas.addEventListener("mouseup", mouseup, false);
  canvas.addEventListener("mousemove", mousemove, false);

  ctx = canvas.getContext("2d");

  currentTool = new Line();
  currentColor = document.getElementById("selectedColor").value;

  $("#square").on("click", () => {
    currentTool = new Square();
    console.log(currentTool);
  });
  $("#circle").on("click", () => {
    currentTool = new Circle();
    console.log(currentTool);
  });
  $("#line").on("click", () => {
    currentTool = new Line();
    console.log(currentTool);
  });
  $("#selectedColor").on("change", () => {
    currentColor = document.getElementById("selectedColor").value;
  });

  console.log("Loading socket...");
  socket = io();

  socket.emit("new user", "stub");

  socket.on("new user", (data) => {
    console.log(data);
  });

  socket.on("update canvas", (data) => {
    components = data;
  });
}

function loop() {
  ctx.fillStyle = "#eee";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  for (const c of components) {
    draw(c);
  }

  draw(preview);

  window.requestAnimationFrame(loop);
}

function mousedown(e) {
  e.x = e.pageX - canvas.offsetLeft;
  e.y = e.pageY - canvas.offsetTop;
  currentTool.mousedown(e);
}
function mouseup(e) {
  e.x = e.pageX - canvas.offsetLeft;
  e.y = e.pageY - canvas.offsetTop;
  currentTool.mouseup(e);
}
function mousemove(e) {
  e.x = e.pageX - canvas.offsetLeft;
  e.y = e.pageY - canvas.offsetTop;
  e.leftDown = e.buttons == 1;
  e.rightDown = e.buttons == 2;
  currentTool.mousemove(e);
}

function getRandomColor() {
  return `rgb(${Math.floor(Math.random() * 255)},${Math.floor(
    Math.random() * 255
  )},${Math.floor(Math.random() * 255)})`;
}
