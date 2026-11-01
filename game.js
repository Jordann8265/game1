// Grab the canvas and 2D context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ---------------------------------------------------------
// 1. THE PLAYER BLUEPRINT (CLASS)
// ---------------------------------------------------------
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.color = "#4f46e5";
        this.speed = 250; // Pixels per second movement speed
    }

    // Behavior: Update logic handles movement and boundaries
    update(deltaTime, keys, canvasWidth) {
        // A. Horizontal Movement Math
        if (keys["ArrowLeft"] || keys["a"]) {
            this.x -= this.speed * deltaTime;
        }
        if (keys["ArrowRight"] || keys["d"]) {
            this.x += this.speed * deltaTime;
        }

        // B. Boundary Constraints (Prevent walking off-screen)
        // Left wall constraint
        if (this.x < 0) {
            this.x = 0;
        }
        
        // Right wall constraint (accounting for player's width)
        if (this.x > canvasWidth - this.width) {
            this.x = canvasWidth - this.width;
        }
    }

    // Behavior: Render logic
    draw(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}

// ---------------------------------------------------------
// 2. INPUT TRACKING SYSTEM
// ---------------------------------------------------------
const inputKeys = {};

window.addEventListener("keydown", (event) => {
    inputKeys[event.key] = true;
});

window.addEventListener("keyup", (event) => {
    inputKeys[event.key] = false;
});

// ---------------------------------------------------------
// 3. INITIALIZE GAME OBJECTS
// ---------------------------------------------------------
const player = new Player(100, 300);
const floorY = 400;

let lastTime = 0;

// ---------------------------------------------------------
// 4. THE CORE GAME LOOP
// ---------------------------------------------------------
function gameLoop(currentTime) {
    let deltaTime = (currentTime - lastTime) / 1000;
    if (isNaN(deltaTime)) deltaTime = 0;
    lastTime = currentTime;

    // A. UPDATE STATE (Pass keys and canvas width into the player update method)
    player.update(deltaTime, inputKeys, canvas.width);

    // B. RENDER PHASE (Painter's Algorithm)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Layer 1: Background
    ctx.fillStyle = "#0f172a"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Layer 2: Floor Platform
    ctx.fillStyle = "#334155"; 
    ctx.fillRect(0, floorY, canvas.width, canvas.height - floorY);

    // Layer 3: Player
    player.draw(ctx);

    // C. REPEAT
    requestAnimationFrame(gameLoop);
}

// Kick off the engine heartbeat
requestAnimationFrame(gameLoop);