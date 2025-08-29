// Coordinate System Game
const canvas = document.getElementById('coordinate-canvas');
const ctx = canvas.getContext('2d');
const checkBtn = document.getElementById('check-btn');
const againBtn = document.getElementById('again-btn');
const interceptsInfo = document.getElementById('intercepts-info');
const feedback = document.getElementById('feedback');

const CANVAS_SIZE = 600;
const AXIS_MARGIN = 40;
const AXIS_LENGTH = CANVAS_SIZE - 2 * AXIS_MARGIN;
// Center the origin in the middle of the canvas
const ORIGIN = { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 };
const UNIT = AXIS_LENGTH / 60; // -30 to 30

let xIntercept, yIntercept;
let userPoint = { x: 0, y: 0 };
let dragging = false;
let showAnswer = false;

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateIntercepts() {
    // x-intercept: (a, 0), y-intercept: (0, b), a and b in [-30, 30], not 0
    let a = 0, b = 0;
    while (a === 0) a = randomInt(-30, 30);
    while (b === 0) b = randomInt(-30, 30);
    xIntercept = { x: a, y: 0 };
    yIntercept = { x: 0, y: b };
    // Válasszunk véletlenszerűen, hogy melyik interceptet kell plotolni
    const useX = Math.random() < 0.5;
    const intercept = useX ? xIntercept : yIntercept;
    window.correctIntercept = intercept;
    userPoint = { x: 0, y: 0 };
    showAnswer = false;
    interceptsInfo.textContent = `intercept: (${intercept.x}, ${intercept.y})`;
    feedback.textContent = '';
}

generateIntercepts();

function coordToCanvas(pt) {
    // (x, y) -> canvas coordinate
    return {
        x: ORIGIN.x + pt.x * UNIT,
        y: ORIGIN.y - pt.y * UNIT
    };
}

function drawGrid() {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    for (let i = -30; i <= 30; i++) {
        // vertical
        ctx.beginPath();
        let x = ORIGIN.x + i * UNIT;
        ctx.moveTo(x, AXIS_MARGIN);
        ctx.lineTo(x, CANVAS_SIZE - AXIS_MARGIN);
        ctx.stroke();
        // horizontal
        ctx.beginPath();
        let y = ORIGIN.y - i * UNIT;
        ctx.moveTo(AXIS_MARGIN, y);
        ctx.lineTo(CANVAS_SIZE - AXIS_MARGIN, y);
        ctx.stroke();
    }
}

function drawAxes() {
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    // x-axis
    ctx.beginPath();
    ctx.moveTo(AXIS_MARGIN, ORIGIN.y);
    ctx.lineTo(CANVAS_SIZE - AXIS_MARGIN, ORIGIN.y);
    ctx.stroke();
    // y-axis
    ctx.beginPath();
    ctx.moveTo(ORIGIN.x, CANVAS_SIZE - AXIS_MARGIN);
    ctx.lineTo(ORIGIN.x, AXIS_MARGIN);
    ctx.stroke();
    // Numbering
    ctx.font = '12px Arial';
    ctx.fillStyle = '#222';
    for (let i = -30; i <= 30; i += 5) {
        // x-axis
        let pt = coordToCanvas({ x: i, y: 0 });
        ctx.fillText(i, pt.x - 8, ORIGIN.y + 18);
        // y-axis
        pt = coordToCanvas({ x: 0, y: i });
        if (i !== 0) ctx.fillText(i, ORIGIN.x - 28, pt.y + 5);
    }
    // Origin
    ctx.fillText('0', ORIGIN.x - 18, ORIGIN.y + 18);
}

function drawPoint(pt, color, label = null) {
    const c = coordToCanvas(pt);
    ctx.beginPath();
    ctx.arc(c.x, c.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    if (label) {
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#333';
        ctx.fillText(label, c.x + 12, c.y - 12);
    }
}

function draw() {
    drawGrid();
    drawAxes();
    // Origin (fixed black)
    drawPoint({ x: 0, y: 0 }, '#000');
    // User point (movable blue)
    drawPoint(userPoint, '#1976d2');
        // If answer is shown and user is wrong, show only the correct intercept in red
        if (showAnswer && !isUserCorrect()) {
            drawPoint(window.correctIntercept, 'red');
    }
}

draw();

function getMouseCoord(evt) {
    const rect = canvas.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    // Back to coordinate system values
    const coordX = Math.round((x - ORIGIN.x) / UNIT);
    const coordY = Math.round((ORIGIN.y - y) / UNIT);
    return { x: coordX, y: coordY };
}

canvas.addEventListener('mousedown', function(evt) {
    const mouse = getMouseCoord(evt);
    const c = coordToCanvas(userPoint);
    const dist = Math.hypot(evt.clientX - canvas.getBoundingClientRect().left - c.x, evt.clientY - canvas.getBoundingClientRect().top - c.y);
    if (dist < 15) {
        dragging = true;
    }
});

canvas.addEventListener('mousemove', function(evt) {
    if (dragging) {
        const mouse = getMouseCoord(evt);
        // Only allow -30 to 30
        if (mouse.x >= -30 && mouse.x <= 30 && mouse.y >= -30 && mouse.y <= 30) {
            userPoint.x = mouse.x;
            userPoint.y = mouse.y;
            draw();
        }
    }
});

canvas.addEventListener('mouseup', function(evt) {
    dragging = false;
});

canvas.addEventListener('mouseleave', function(evt) {
    dragging = false;
});

function isUserCorrect() {
    // User must plot both intercepts (x and y) in any order
    // Accept if userPoint is at xIntercept or yIntercept
    // Csak az aktuális interceptet kell eltalálni
    return userPoint.x === window.correctIntercept.x && userPoint.y === window.correctIntercept.y;
}

checkBtn.addEventListener('click', function() {
    showAnswer = true;
    draw();
    againBtn.style.display = '';
    checkBtn.style.display = 'none';
    if (isUserCorrect()) {
        feedback.textContent = 'Correct!';
        feedback.style.color = '#388e3c';
    } else {
        feedback.textContent = '';
    }
});

againBtn.addEventListener('click', function() {
    generateIntercepts();
    draw();
    againBtn.style.display = 'none';
    checkBtn.style.display = '';
    feedback.textContent = '';
});
