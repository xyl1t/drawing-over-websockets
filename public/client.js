let ctx;
let socket;
let components = [];
let preview;
let previews = {};
let currentTool;
let currentColor;
let fillComponents;
let mouseX = 0;
let mouseY = 0;
let scrollX = 0;
let scrollY = 0;
let myId;
let myCursor = {};
let cursors = {};

class Tool {
  constructor(type) {
    this.curId = myId;
    this.id = genId();
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
    this.fill = fillComponents;
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
  mouseup(e) {}
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
    this.fill = fillComponents;
  }
  mousemove(e) {
    if (e.leftDown) {
      this.width = e.x - this.x;
      this.height = e.y - this.y;
    }
  }
  mouseup(e) {}
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
  }
  mousemove(e) {
    if (e.leftDown) {
      this.ex = e.x;
      this.ey = e.y;
    }
  }
  mouseup(e) {}
}

function draw(tool) {
  if (!tool) return;

  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.fillStyle = tool.color;
  ctx.strokeStyle = tool.color;
  ctx.translate(-scrollX, -scrollY);
  switch (tool?.type) {
    case "circle":
      ctx.ellipse(tool.cx, tool.cy, tool.rx, tool.ry, 0, 0, Math.PI * 2, false);
      break;
    case "square":
      ctx.rect(tool.x, tool.y, tool.width, tool.height);
      break;
    case "line":
      ctx.moveTo(tool.sx, tool.sy);
      ctx.lineTo(tool.ex, tool.ey);
      break;
  }

  if (tool?.fill) ctx.fill();
  else ctx.stroke();

  // Reset current transformation matrix to the identity matrix
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawCursor(cursor) {
  if (!cursor) return;

  ctx.beginPath();
  ctx.strokeStyle = cursor.color;
  ctx.lineWidth = 2;
  ctx.lineCap = "square";
  // ctx.arc(cursor.x, cursor.y, 10, 0, 2 * Math.PI);
  ctx.moveTo(cursor.x + 5 * 0 - scrollX, cursor.y + 5 * 0 - scrollY);
  ctx.lineTo(cursor.x + 5 * 0 - scrollX, cursor.y + 5 * 3 - scrollY);
  ctx.lineTo(cursor.x + 5 * 0.8 - scrollX, cursor.y + 5 * 2 - scrollY);
  ctx.lineTo(cursor.x + 5 * 2 - scrollX, cursor.y + 5 * 2 - scrollY);
  ctx.lineTo(cursor.x + 5 * 0 - scrollX, cursor.y + 5 * 0 - scrollY);
  ctx.stroke();

  ctx.fillStyle = cursor.color;
  ctx.fillText(
    cursor.name,
    cursor.x - scrollX + 8,
    cursor.y + 24 - scrollY
  );
}

$(() => {
  setup();
  loop();
});

function setup() {
  // setup
  console.log("Loading canvas and context...");
  const canvas = document.querySelector("#canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.addEventListener("mousedown", mousedown, false);
  canvas.addEventListener("mouseup", mouseup, false);
  canvas.addEventListener("mousemove", mousemove, false);
  canvas.addEventListener("wheel", wheel, false);

  ctx = canvas.getContext("2d");

  currentTool = new Line();
  currentColor = document.getElementById("selectedColor").value;
  fillComponents = document.getElementById("fill").checked;

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
  $("#fill").on("change", () => {
    fillComponents = document.getElementById("fill").checked;
  });
  $("#origin").on("click", () => {
    scrollX = 0;
    scrollY = 0;
    $("#coordinates").text(`${scrollX}, ${scrollY}`);
  });
  $("#name").on("change", () => {
    myCursor.name = document.getElementById("name").value;
    socket.emit("cursorUpdate", myCursor);
  });

  console.log("Loading socket...");
  socket = io({
    auth: {
      token: "actualUser",
    },
  });

  socket.on("updateCanvas", (comps, prevs) => {
    components = comps;
    previews = prevs;
  });

  socket.on("updateCursors", (curs) => {
    cursors = curs;
  });

  socket.on("yourCursor", (cur) => {
    myId = cur.id;
    myCursor = cur;
    currentTool.curId = myId;

    // set stroke/fill color to color of cursor
    document.getElementById("selectedColor").value = rgbStringToHex(cur.color);
    currentColor = cur.color;
  });
}

function loop() {
  const input = document.getElementById("name").value;
  if (input != myCursor.name) {
    myCursor.name = input;
    socket.emit("cursorUpdate", myCursor);
  }

  ctx.fillStyle = "#eee";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  for (const c of components) {
    draw(c);
  }

  draw(preview);

  for (const id in previews) {
    if (previews[id].curId != myId) {
      draw(previews[id]);
    }
  }

  for (const id in cursors) {
    if (id != myId) drawCursor(cursors[id]);
    // drawCursor(cursors[id]);
  }

  window.requestAnimationFrame(loop);
}

function mousedown(e) {
  let customEvent = { ...e };
  customEvent.x = e.pageX - canvas.offsetLeft + scrollX;
  customEvent.y = e.pageY - canvas.offsetTop + scrollY;
  currentTool.mousedown(customEvent);
  preview = currentTool;
  socket.emit("pushPreview", preview);
}

function mouseup(e) {
  let customEvent = { ...e };
  customEvent.x = e.pageX - canvas.offsetLeft + scrollX;
  customEvent.y = e.pageY - canvas.offsetTop + scrollY;
  currentTool.mouseup(customEvent);
  socket.emit("popPreview", preview);
  socket.emit("addComponent", preview);
  components.push(preview);
  preview = undefined;
}

function mousemove(e) {
  mouseX = e.pageX - canvas.offsetLeft;
  mouseY = e.pageY - canvas.offsetTop;
  $("#coordinates").text(`${scrollX + mouseX}, ${scrollY + mouseY}`);

  if (myId) {
    myCursor.x = mouseX + scrollX;
    myCursor.y = mouseY + scrollY;
    socket.emit("cursorUpdate", myCursor);
  }

  let customEvent = { ...e };
  customEvent.x = mouseX + scrollX;
  customEvent.y = mouseY + scrollY;
  customEvent.leftDown = e.buttons == 1;
  customEvent.rightDown = e.buttons == 2;
  currentTool.mousemove(customEvent);

  if (customEvent.leftDown) {
    socket.emit("popPreview", preview);
    socket.emit("pushPreview", preview);
  }
}

function wheel(e) {
  e.preventDefault();

  const clamp = (num) => Math.round(Math.max(-1, Math.min(1, num)));

  let deltaX = clamp(e.deltaX);
  let deltaY = clamp(e.deltaY);

  if (e.shiftKey) {
    deltaY = 0;
    deltaX = clamp(e.deltaY || e.deltaX);
  }

  scrollX += deltaX * 50;
  scrollY += deltaY * 50;

  if (myId) {
    myCursor.x = mouseX + scrollX;
    myCursor.y = mouseY + scrollY;
    socket.emit("cursorUpdate", myCursor);
  }

  $("#coordinates").text(`${scrollX + mouseX}, ${scrollY + mouseY}`);
}

function getRandomColor() {
  return `rgb(${Math.floor(Math.random() * 255)},${Math.floor(
    Math.random() * 255
  )},${Math.floor(Math.random() * 255)})`;
}

function rgbStringToHex(rgb) {
  let a = rgb.split("(")[1].split(")")[0];
  a = a.split(",");
  var b = a.map(function (x) {
    //For each array element
    x = parseInt(x).toString(16); //Convert to a base16 string
    return x.length == 1 ? "0" + x : x; //Add zero if we get only one character
  });
  b = "#" + b.join("");
  return b;
}

function genId() {
  return Math.floor((1 + Math.random()) * 0x100000000)
    .toString(16)
    .substring(1);
}
