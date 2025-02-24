const socket = io();

const canvas = document.getElementById('board');
const context = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const clearBtn = document.getElementById('clearBtn');

let drawing = false;
let lastPos = { x: 0, y: 0 };

// Draw a line segment on the canvas
function drawLine({ x0, y0, x1, y1, color, size }) {
  context.strokeStyle = color;
  context.lineWidth = size;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(x0, y0);
  context.lineTo(x1, y1);
  context.stroke();
}

// Clear the canvas
function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

// Mouse event handlers
canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  lastPos = { x: e.offsetX, y: e.offsetY };
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
});

canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  const currentPos = { x: e.offsetX, y: e.offsetY };
  const data = {
    x0: lastPos.x,
    y0: lastPos.y,
    x1: currentPos.x,
    y1: currentPos.y,
    color: colorPicker.value,
    size: brushSize.value
  };
  // Emit drawing action and draw immediately locally
  socket.emit('drawing', data);
  drawLine(data);
  lastPos = currentPos;
});

// Clear board button event
clearBtn.addEventListener('click', () => {
  socket.emit('clearBoard');
});

// Listen for server events
socket.on('boardState', (actions) => {
  // Redraw entire board state on connection.
  actions.forEach(drawLine);
});

socket.on('drawing', (data) => {
  drawLine(data);
});

socket.on('clearBoard', () => {
  clearCanvas();
});
