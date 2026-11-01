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
        this.speed = 250;          // Horizontal movement speed
        
        // Physics properties
        this.vy = 0;               // Vertical velocity (speed and direction of falling/jumping)
        this.gravity = 900;        // Downward pull force
        this.jumpForce = -450;     // Upward push when jumping
        this.isGrounded = false;   // Are we standing on the floor?
    }

    // Behavior: Update logic handles movement, gravity, and collisions
    update(deltaTime, keys, canvasWidth, floorY) {
        // A. Horizontal Movement
        if (keys["ArrowLeft"] || keys["a"]) {
            this.x -= this.speed * deltaTime;
        }
        if (keys["ArrowRight"] || keys["d"]) {
            this.x += this.speed * deltaTime;
        }

        // B. Vertical Physics (Gravity)
        // Pull down by adding gravity to vertical velocity
        this.vy += this.gravity * deltaTime;
        // Move the player vertically based on velocity
        this.y += this.vy * deltaTime;

        // C. Jump Input (Only jump if we are touching the ground)
        if ((keys["ArrowUp"] || keys["w"] || keys[" "]) && this.isGrounded) {
            this.vy = this.jumpForce;
            this.isGrounded = false;
        }

        // D. Floor Collision Detection
        // Check if the player's bottom edge hits or passes the floor line
        if (this.y + this.height >= floorY) {
            this.y = floorY - this.height; // Snap feet perfectly to the floor
            this.vy = 0;                   // Stop falling velocity
            this.isGrounded = true;        // Mark as standing safely
        } else {
            this.isGrounded = false;       // In the air
        }

        // E. Screen Boundary Constraints (Left/Right walls)
        if (this.x < 0) {
            this.x = 0;
        }
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
// Start the player higher up in the air (Y: 100) so we can watch them fall!
const player = new Player(100, 100);
const floorY = 400;

let lastTime = 0;

// ---------------------------------------------------------
// 4. THE CORE GAME LOOP
// ---------------------------------------------------------
function gameLoop(currentTime) {
    let deltaTime = (currentTime - lastTime) / 1000;
    if (isNaN(deltaTime)) deltaTime = 0;
    lastTime = currentTime;

    // A. UPDATE STATE
    player.update(deltaTime, inputKeys, canvas.width, floorY);

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