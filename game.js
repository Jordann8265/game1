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
        this.vy = 0;               // Vertical velocity
        this.gravity = 900;        // Downward pull force
        this.jumpForce = -450;     // Upward push when jumping
        this.isGrounded = false;   // Are we standing on a surface?
    }

    // Behavior: Update logic handles movement, gravity, and collisions
    update(deltaTime, keys, canvasWidth, floorY, platforms) {
        // A. Horizontal Movement
        if (keys["ArrowLeft"] || keys["a"]) {
            this.x -= this.speed * deltaTime;
        }
        if (keys["ArrowRight"] || keys["d"]) {
            this.x += this.speed * deltaTime;
        }

        // B. Jump Input (Checked BEFORE gravity so it triggers instantly)
        if ((keys["ArrowUp"] || keys["w"] || keys[" "]) && this.isGrounded) {
            this.vy = this.jumpForce;
            this.isGrounded = false; // Leave the ground immediately
        }

        // C. Vertical Physics (Gravity)
        this.vy += this.gravity * deltaTime;
        this.y += this.vy * deltaTime;

        // Assume we are in the air until proven otherwise
        this.isGrounded = false;

        // D. Platform Collision Detection (Check floating platforms first)
        for (let plat of platforms) {
            // Check if player's horizontal bounds overlap the platform
            if (
                this.x + this.width > plat.x &&
                this.x < plat.x + plat.width &&
                this.y + this.height >= plat.y &&
                this.y + this.height <= plat.y + 15 && // Landing threshold from above
                this.vy >= 0                             // Only collide while falling down
            ) {
                this.y = plat.y - this.height; // Snap feet to top of platform
                this.vy = 0;                   // Kill falling velocity
                this.isGrounded = true;        // Stand safely
                break;
            }
        }

        // E. Floor Collision Detection (If not already standing on a platform)
        if (!this.isGrounded && this.y + this.height >= floorY) {
            this.y = floorY - this.height; // Snap feet perfectly to the floor
            this.vy = 0;                   // Stop falling velocity
            this.isGrounded = true;        // Mark as standing safely
        }

        // F. Screen Boundary Constraints (Left/Right walls)
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
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
        event.preventDefault();
    }
    inputKeys[event.key] = true;
});

window.addEventListener("keyup", (event) => {
    inputKeys[event.key] = false;
});

// ---------------------------------------------------------
// 3. INITIALIZE GAME OBJECTS & ENVIRONMENT
// ---------------------------------------------------------
const player = new Player(100, 100);
const floorY = 400;

// Define our level platforms (X, Y, Width, Height)
// Notice Y is 310, which is safely within our 247.5 max jump apex!
const platforms = [
    { x: 300, y: 310, width: 200, height: 20 }
];

let lastTime = 0;

// ---------------------------------------------------------
// 4. THE CORE GAME LOOP
// ---------------------------------------------------------
function gameLoop(currentTime) {
    let deltaTime = (currentTime - lastTime) / 1000;
    if (isNaN(deltaTime)) deltaTime = 0;
    lastTime = currentTime;

    // A. UPDATE STATE
    player.update(deltaTime, inputKeys, canvas.width, floorY, platforms);

    // B. RENDER PHASE (Painter's Algorithm)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Layer 1: Background
    ctx.fillStyle = "#0f172a"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Layer 2: Environment (Floor + Platforms)
    ctx.fillStyle = "#334155"; 
    // Draw Floor
    ctx.fillRect(0, floorY, canvas.width, canvas.height - floorY);
    
    // Draw all platforms in our array
    platforms.forEach(plat => {
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
    });

    // Layer 3: Player
    player.draw(ctx);

    // C. REPEAT
    requestAnimationFrame(gameLoop);
}

// Kick off the engine heartbeat
requestAnimationFrame(gameLoop);