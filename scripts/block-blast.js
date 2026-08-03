; (() => {
    /* --- GAME SETTINGS --- */
    const GAME_SCENE_NAME = 'menu'
    const MAX_LIVES = 5
    const BALL_SPEED = 300 // Pixels per second
    const MIN_BOUNCE_ANGLE = (15 * Math.PI) / 180 // Minimum angle for non-horizontal bounce
    const DIE_REFRESH = true

    /* --- BLOCK SETTINGS --- */
    const BLOCK_SIZE = 40
    const NUM_INITIAL_ROWS = 10
    const ROWS_TO_CLEAR_FOR_ADVANCE = 2 // Number of rows cleared before advancing more blocks

    /* --- SPECIAL BALL/EFFECTS SETTINGS --- */
    const BOMB_EXPLOSION_RADIUS = 100
    const EXPLODE_BLOCK_RADIUS = 80
    const MITOSIS_BALL_COUNT = 1 // Number of balls spawned by a mitosis block
    const PIERCING_BLOCK_LIMIT = 3 // Number of blocks a piercing ball can break
    const BLOCKING_PROJECTILE_LIMIT = 5 // Number of projectiles a blocking ball can break
    /* --- PARTICLE SETTINGS --- */
    const NUM_BLOCK_BREAK_PARTICLES_PER_AXIS = 3 // Total particles is this value squared
    const NUM_EXPLOSION_PARTICLES = 25
    const EXPLOSION_PARTICLE_SPEED = 400
    const EXPLOSION_PARTICLE_LIFETIME = 0.5 // Seconds

    /* --- PADDLE SETTINGS --- */
    const PADDLE_WIDTH = 12
    const PADDLE_HEIGHT_INITIAL = 120
    const PADDLE_SPEED = 420
    const INITIAL_DIAMOND_BONUS = 0
    const INITIAL_PINK_HEIGHT = 0
    const PINK_DEPLETION_RATE = 8 //The rate at which the pink paddle shrinks

    /* --- BALL/PROJECTILE PROPERTIES --- */
    const BALL_RADIUS = 10
    const BOMB_RADIUS = 12
    const PROJECTILE_RADIUS = 6
    const PROJECTILE_SPEED = 320
    const PROJECTILE_DAMAGE = 20
    const DIAMOND_RADIUS = 10
    const DIAMOND_SPEED = 320
    const DIAMOND_DAMAGE = 20 // Amount of additional paddle height given by diamonds
    const PINK_RADIUS = 8
    const PINK_SPEED = 240
    const BLOCKING_RADIUS_MAX = 24
    const BLOCKING_RADIUS_MIN = 8
    const BLOCKING_SPEED = 240

    /* --- COLORS --- */
    const COLORS = {
        BLACK: '#050505',
        WHITE: '#fff',
        WHITE_D: '#e6e6e6',
        GRAY: '#777',
        GRAY_L: '#ccc',
        RED: '#ff6666',
        BLUE: '#6666ff',
        BLUE_D: '#222288',
        BLUE_L: '#6464fa',
        GREEN: '#66ff66',
        GREEN_D: '#228822',
        ORANGE: '#ffcc66',
        DIAMOND: '#33ddff',
        PINK: '#ffb6c1',
        PINK_T: '#ffb6c180',
        PURPLE: '#cc66ff',
        PURPLE_D: '#552288'
    }
    const COLORS2 = {
        BLACK_T: 'rgba(0,0,0,0.6)',
        BLACK_T2: 'rgba(0,0,0,0.66)',
        ORANGE: `rgba(255, 204, 102, 1)`,
        BLUE: `rgba(100,100,250, 1)`,
        WHITE_T: 'rgba(230,230,230,0.1)',
    }

    const PROJECTILE_SPAWN_INTERVAL = Infinity // Seconds, currently disabled
    let projectileTimer = 0

    /* --- RANDOM GENERATION SETTINGS --- */
    const PERCENT_OF_BLOCKS_THAT_ARE_SPECIAL = 1 / 2.5
    const PROJECTILE_BLOCK_WEIGHT = 1
    const BOMB_BLOCK_WEIGHT = 1
    const PIERCING_BLOCK_WEIGHT = 1
    const MITOSIS_BLOCK_WEIGHT = 1
    const EXPLODE_BLOCK_WEIGHT = 1
    const DIAMOND_BLOCK_WEIGHT = 0.5 //the light blue blocks
    const PINK_BLOCK_WEIGHT = 0.08
    const BLOCKING_BLOCK_WEIGHT = 0.04
    const TOTAL_SPECIAL_WEIGHT =
        PROJECTILE_BLOCK_WEIGHT +
        BOMB_BLOCK_WEIGHT +
        PIERCING_BLOCK_WEIGHT +
        MITOSIS_BLOCK_WEIGHT +
        EXPLODE_BLOCK_WEIGHT + 
        DIAMOND_BLOCK_WEIGHT + 
        PINK_BLOCK_WEIGHT + 
        BLOCKING_BLOCK_WEIGHT

    /* --- BUTTON --- */
    function button(x, y, w, h, text, operation, hotKey){
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.text = text
        this.operation = operation
        this.isHovering = false
        this.key = hotKey

        this.update() = {
            // Check if the mouse is inside the button's boundaries
            this.isHovering =
                mousePosition.x >= this.x &&
                mousePosition.x <= this.x + this.w &&
                mousePosition.y >= this.y &&
                mousePosition.y <= this.y + this.h
            if(this.key !== undefined && keys[this.key]){
                this.isHovering = true
            }
        
            // Start the game if the button is clicked
            if (this.isHovering && isMouseClicked) {
                this.operation()
            }
            if(this.key !== undefined){
                hotKey(this.key, this.operation)
            }
        }
        this.display() = {
            // Button
            const btnColor = this.isHovering ? COLORS.WHITE : COLORS.WHITE_D
            drawRoundRect(
                this.x,
                this.y,
                this.w,
                this.h,
                10,
                btnColor,
            )

            // Button text
            ctx.fillStyle = COLORS.BLACK
            ctx.font = '28px system-ui, sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(
                this.text,
                this.x + this.w / 2,
                this.y + this.h / 2,
            )
        }
    }

    /* --- GAME STATE VARIABLES --- */
    // const menuButton = { x: 500, y: 350, w: 200, h: 60, isHovering: false }
    let menuButton = new button(500, 350, 200, 60, 'Start Game', reset, 32) //32 is the key code for space
    let resumeButton = new button(500 - 110, 350, 200, 60, 'Cancel', resume, 32)
    let resetButton = new button(500 + 110, 350, 200, 60, 'Restart', reset, 13) //13 is the key code for enter
    let currentScene = GAME_SCENE_NAME
    let livesLostCount = 0
    let currentScore = 0
    let isGameOver = false
    let blocksAreAdvancing = false
    let isPaused = false
    let blocks = []
    let balls = []
    let brokenBlockParticles = []
    let explosionParticles = []
    let floatyTexts = [] //aka flavor text

    /* --- GAME MANAGEMENT FUNCTIONS --- */
    function startGame() {
        currentScene = GAME_SCENE_NAME
        currentScore = 0
        isGameOver = false
        paddle.y = (VIRTUAL_HEIGHT - PADDLE_HEIGHT_INITIAL) / 2
        diamondPaddle.y = paddle.y
        pinkPaddle.y = 0
        pinkPaddle.h = INITIAL_PINK_HEIGHT
        
        generateBlocks()
        livesLostCount = 0
        balls = []
        serveInitialBall()
        isPaused = false
        document.getElementById('pauseBtn').textContent = 'Pause'
        paddle.h = PADDLE_HEIGHT_INITIAL
        diamondPaddle.h = paddle.h
        diamondPaddle.bonus = INITIAL_DIAMOND_BONUS
        projectileTimer = 0
    }
    function considerReset() {
        currentScene = 'maybeReset'
    }
    function reset(){
        startGame()
        currentScene = 'game'
    }
    function resume(){
        currentScene = 'game'
    }

    function die() { //Clear all balls and reset paddle and serving ball, but maintain blocks
        paddle.y = (VIRTUAL_HEIGHT - PADDLE_HEIGHT_INITIAL) / 2
        diamondPaddle.y = paddle.y
        diamondPaddle.bonus = INITIAL_DIAMOND_BONUS
        pinkPaddle.y = 0
        livesLostCount++;
        balls = []
        serveInitialBall()
        isPaused = false
        paddle.h = PADDLE_HEIGHT_INITIAL
        diamondPaddle.h = paddle.h
        pinkPaddle.h = INITIAL_PINK_HEIGHT
        
        ctx.font = '30px system-ui, sans-serif'
        let textWidth = ctx.measureText(`Lives: ${MAX_LIVES - livesLostCount}`).width
        //                             text, x, y, size, color, type, lifetime = 60, textAlign = 'right', direction = "down"
        floatyTexts.push(new floatyText("Lives -1", VIRTUAL_WIDTH * 0.2 + textWidth/2, 40, 30, '#ff0000', 'life', 90)) //flavor text to indicate that you lost a life
    }

    function togglePause() {
        isPaused = !isPaused
        document.getElementById('pauseBtn').textContent = isPaused
            ? 'Resume'
            : 'Pause'
        lastTime = performance.now()
    }

    function hotkey(key, effect){
        if(releasedKeys[key]){
            effect()
        }
    }

    // Function to generate angles that are not too horizontal
    function generateAngle(minAngle, direction) {
        let dir = Math.random() < 0.5 ? 1 : -1
        if (!isNaN(direction)) {
            dir = Math.min(Math.sign(direction), -1)
        } // Use Math.sign for clarity if needed
        const angle =
            dir * Math.PI +
            (Math.PI / 2 - minAngle - Math.random() * (Math.PI - minAngle * 2))
        return angle
    }

    // Linearly interpolates between two hexadecimal color strings
    function lerpHexColor(color1, color2, t) {
        const r1 = parseInt(color1.slice(1, 3), 16)
        const g1 = parseInt(color1.slice(3, 5), 16)
        const b1 = parseInt(color1.slice(5, 7), 16)
        const r2 = parseInt(color2.slice(1, 3), 16)
        const g2 = parseInt(color2.slice(3, 5), 16)
        const b2 = parseInt(color2.slice(5, 7), 16)
        const r = Math.round(r1 + (r2 - r1) * t)
        const g = Math.round(g1 + (g2 - g1) * t)
        const b = Math.round(b1 + (b2 - b1) * t)
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
    }

    /* --- ENVIRONMENT SETUP --- */
    const canvas = document.getElementById('block-blast-game')
    const ctx = canvas.getContext('2d')
    const VIRTUAL_WIDTH = 1200
    const VIRTUAL_HEIGHT = 600
    const MAX_WIDTH = 1000
    const MAX_HEIGHT = 1000

    let lastTime = performance.now() // Time since last frame for delta time calculation

    window.addEventListener('resize', resizeCanvas)
    function resizeCanvas() {
        // Find target canvas size from the available window and maximum size
        const targetWidth = Math.min(window.innerWidth - 40, MAX_WIDTH)
        const targetHeight = Math.min(window.innerHeight - 140, MAX_HEIGHT)
        const targetScale = Math.min(
            targetWidth / VIRTUAL_WIDTH,
            targetHeight / VIRTUAL_HEIGHT,
        )

        // Calculate the final display size
        const displayWidth = VIRTUAL_WIDTH * targetScale
        const displayHeight = VIRTUAL_HEIGHT * targetScale

        // Set the internal canvas to its virtual size
        canvas.width = VIRTUAL_WIDTH
        canvas.height = VIRTUAL_HEIGHT

        // Set the CSS canvas size for scaling
        canvas.style.width = displayWidth + 'px'
        canvas.style.height = displayHeight + 'px'
    }

    // Initialize game on load
    window.addEventListener('load', () => {
        resizeCanvas()
        startGame()
        lastTime = performance.now()
        requestAnimationFrame(gameLoop)
    })

    /* --- USER INPUT HANDLING --- */
    let mousePosition = { x: 0, y: 0 }
    let isMouseClicked = false

    function getVirtualMousePos(event) {
        const rect = canvas.getBoundingClientRect()
        // Calculate scale factors based on the *actual* display size
        const scaleX = VIRTUAL_WIDTH / rect.width
        const scaleY = VIRTUAL_HEIGHT / rect.height
        // Convert window coordinates to virtual coordinates
        const virtualX = (event.clientX - rect.left) * scaleX
        const virtualY = (event.clientY - rect.top) * scaleY
        return { x: virtualX, y: virtualY }
    }

    canvas.addEventListener('mousemove', (event) => {
        mousePosition = getVirtualMousePos(event)
    })
    canvas.addEventListener('click', (event) => {
        mousePosition = getVirtualMousePos(event)
        isMouseClicked = true
    })

    const keys = {}
    const releasedKeys = {}
    window.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true // Use toLowerCase for consistent key checking
    })
    window.addEventListener('keyup', (e) => {
        releasedKeys[e.key.toLowerCase()] = true //just gotta add a thing that sets everything to false at the end
        keys[e.key.toLowerCase()] = false
    })

    document.getElementById('pauseBtn').addEventListener('click', togglePause)
    document.getElementById('restartBtn').addEventListener('click', startGame)

    /* --- FLAVOR TEXT --- */
    //FLAVOR TEXT THAT I NAMED FLOATY TEXT BECAUSE IT FLOATS AWAY
    function floatyText(text, x, y, size, color, type, lifetime = 60, textAlign = 'right', direction = "down"){
        this.text = text
        this.x = x
        this.y = y
        this.size = size
        this.color = color
        this.type = type
        this.textAlign = textAlign
        this.direction = direction
        this.lifetime = lifetime
        //extra variables for stuff
        this.LIFETIME = lifetime;
        this.expired = false;

        //update position and check if too old
        this.update = function(dt){
            let speed = dt * 45
            switch(this.direction){
                case "up":
                    this.y-=speed
                    break
                case "down":
                    this.y+=speed
                    break
                case "right":
                    this.x+=speed
                    break
                case "left":
                    this.x-=speed
                    break
            }
            
            if(this.lifetime <= 0){//decrement lifetime and also check if I should go away~
                this.expired = true
            }
            this.lifetime-=speed
        }//end update

        this.display = function(){
            ctx.globalAlpha = Math.max(0, (this.lifetime/this.LIFETIME)) //Text fades out
            ctx.font = `${this.size}px system-ui, sans-serif`
            ctx.fillStyle = this.color
            ctx.textAlign = this.textAlign
            ctx.fillText(this.text, this.x, this.y)
            ctx.globalAlpha = 1//don't wanna make everything else transparent
        }// end display
    }
    function score(amount, color = COLORS.GRAY){
        if(amount === 0)
            return
        
        currentScore += amount
        
        // add flavor text for score increase
        ctx.font = '30px system-ui, sans-serif'
        let textWidth = ctx.measureText(`Score: ${currentScore}`).width

        //So if the previous score is the same source, make my number bigger and remove the previous one
        if(floatyTexts.length && floatyTexts[floatyTexts.length - 1].type === 'score' && floatyTexts[floatyTexts.length - 1].color === color){
            let x = Number(floatyTexts[floatyTexts.length - 1].text)
            amount += x
            floatyTexts.pop()
        }
        
        //                             text, x, y, size, color, type, lifetime = 60, textAlign = 'right', direction = "down"
        let text = ((amount >= 0) ? "+" : "") + `${amount}`
        floatyTexts.push(new floatyText(text, VIRTUAL_WIDTH * 0.4 + textWidth/2, 40, 30, color, 'score'))
    }

    /* --- GAME OBJECTS --- */

    // PADDLE
    let paddle = {
        x: 30,
        y: (VIRTUAL_HEIGHT - PADDLE_HEIGHT_INITIAL) / 2,
        w: PADDLE_WIDTH,
        h: PADDLE_HEIGHT_INITIAL,
        dy: 0, // Velocity in y-direction
    }
    // diamond paddle
    let diamondPaddle = {
        x: 30,
        y: (VIRTUAL_HEIGHT - PADDLE_HEIGHT_INITIAL) / 2,
        w: PADDLE_WIDTH,
        h: PADDLE_HEIGHT_INITIAL,
        bonus: INITIAL_DIAMOND_BONUS,
        dy: 0, // Velocity in y-direction
    }
    // pink paddle
    let pinkPaddle = {
        x: 30,
        y: 0,
        w: PADDLE_WIDTH,
        h: INITIAL_PINK_HEIGHT,
        dy: 0, // Velocity in y-direction
    }

    // Helper for Rect-Circle Collision Detection
    function rectCircleColliding(rect, circle) {
        const distX = Math.abs(circle.x - rect.x - rect.w / 2)
        const distY = Math.abs(circle.y - rect.y - rect.h / 2)

        if (distX > rect.w / 2 + circle.r) return false
        if (distY > rect.h / 2 + circle.r) return false

        if (distX <= rect.w / 2) return true
        if (distY <= rect.h / 2) return true

        const dx = distX - rect.w / 2
        const dy = distY - rect.h / 2
        return dx * dx + dy * dy <= circle.r * circle.r
    }
    function circleCircleColliding(circle1, circle2){
        const dist = Math.sqrt(Math.abs(Math.pow(circle1.x - circle2.x, 2) + Math.pow(circle1.y - circle2.y, 2)))
        const colDist = circle1.r + circle2.r
        return dist <= colDist
    }

    function hitBall(thePaddle, ball){
        // Calculate bounce angle based on relative hit position on the paddle
        const relativeY = (ball.y - (thePaddle.y + thePaddle.h / 2)) / (thePaddle.h / 2)
        const bounceAngle = relativeY * (Math.PI / 3) // Max angle of +/- 60 degrees

        // Set velocity and reset state
        ball.vx = Math.cos(bounceAngle) * ball.speed
        ball.vy = Math.sin(bounceAngle) * ball.speed
        ball.isDisabled = false
        ball.blocksHitCount = ball.type === 'piercing' ? 0 : Infinity // Reset block hit count
        ball.ballsHitCount = ball.type === 'blocking' ? 0 : Infinity // Reset ball hit count
        if(ball.type === 'blocking')
            ball.r = BLOCKING_RADIUS_MAX
        ball.x = thePaddle.x + thePaddle.w + ball.r + 0.1 // Reposition ball to prevent sticking
    }

    // Helper to draw a rounded rectangle
    function drawRoundRect(x, y, w, h, r, fillStyle) {
        ctx.fillStyle = fillStyle
        const radius = Math.min(r, w / 2, h / 2)
        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.arcTo(x + w, y, x + w, y + h, radius)
        ctx.arcTo(x + w, y + h, x, y + h, radius)
        ctx.arcTo(x, y + h, x, y, radius)
        ctx.arcTo(x, y, x + w, y, radius)
        ctx.closePath()
        ctx.fill()
    }
    //helper to draw regular polygon
    function drawRegularPoly(x, y, points, r, fillStyle, angle = 0){
        ctx.fillStyle = fillStyle
        ctx.beginPath();
        if(points < 3){ //if points are too few, give up and draw a circle
            ctx.arc(x, y, r, 0, Math.PI * 2)
            ctx.fill()
            return false
        }
        let i = 0
        ctx.moveTo(r * Math.cos(angle) + x, r * Math.sin(angle) + y)
        for(i = 1; i < points; i++){
            angle+= 2 * Math.PI / points
            ctx.lineTo(r * Math.cos(angle) + x, r * Math.sin(angle) + y)
        }
        ctx.fill()
        return true
    }

    // BLOCK DESTRUCTION PARTICLE
    function BlockBreakParticle(x, y, size, vx, vy, vr, color, lifetime) {
        this.x = x
        this.y = y
        this.size = size
        this.rotation = 0
        this.vx = vx
        this.vy = vy
        this.vr = vr // Rotational velocity
        this.color = color
        this.lifetime = lifetime
        this.age = 0

        this.update = function (dt) {
            this.x += this.vx * dt
            this.y += this.vy * dt
            this.rotation += this.vr * dt
            this.vr *= 0.985 // Friction
            this.vx *= 0.985
            this.vy *= 0.985

            this.age += dt
            this.size *= 1 - dt / this.lifetime // Shrink over time
        }

        this.display = function () {
            ctx.fillStyle = this.color
            ctx.save()
            ctx.translate(this.x, this.y)
            ctx.rotate(this.rotation)
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size)
            ctx.restore()
        }
    }

    // EXPLOSION PARTICLE
    function ExplosionParticle(x, y, radius, vx, vy, color, lifetime) {
        this.x = x
        this.y = y
        this.r = radius
        this.vx = vx
        this.vy = vy
        this.color = color // Expects an RGBA string with alpha=1
        this.lifetime = lifetime
        this.age = 0

        this.update = function (dt) {
            this.x += this.vx * dt
            this.y += this.vy * dt
            this.age += dt
            // Reduce size as it ages (more aggressive than block particles)
            this.r *= 1 - (0.75 * dt) / this.lifetime
        }

        this.display = function () {
            const alpha = 1 - this.age / this.lifetime
            // Dynamically adjust alpha in the RGBA color string
            ctx.fillStyle = this.color.replace(/,\s*1\)$/, `, ${alpha})`)
            ctx.beginPath()
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
            ctx.fill()
        }
    }

    // BLOCK OBJECT
    function Block(x, y, w, h) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.type = 'normal'
        this.isDestroyed = false

        // Determine if it's a special block
        if (Math.random() < PERCENT_OF_BLOCKS_THAT_ARE_SPECIAL) {
            const rand = Math.random() * TOTAL_SPECIAL_WEIGHT
            if (rand < PROJECTILE_BLOCK_WEIGHT) {
                this.type = 'projectile'
            } else if (rand < PROJECTILE_BLOCK_WEIGHT + BOMB_BLOCK_WEIGHT) {
                this.type = 'bomb'
            } else if (
                rand <
                PROJECTILE_BLOCK_WEIGHT + BOMB_BLOCK_WEIGHT + PIERCING_BLOCK_WEIGHT
            ) {
                this.type = 'piercing'
            } else if (
                rand <
                PROJECTILE_BLOCK_WEIGHT +
                BOMB_BLOCK_WEIGHT +
                PIERCING_BLOCK_WEIGHT +
                MITOSIS_BLOCK_WEIGHT
            ) {
                this.type = 'mitosis'
            } else if (
                rand <
                PROJECTILE_BLOCK_WEIGHT +
                BOMB_BLOCK_WEIGHT +
                PIERCING_BLOCK_WEIGHT +
                MITOSIS_BLOCK_WEIGHT + 
                DIAMOND_BLOCK_WEIGHT
            ){
                this.type = 'diamond'
            } else if (
                rand <
                PROJECTILE_BLOCK_WEIGHT +
                BOMB_BLOCK_WEIGHT +
                PIERCING_BLOCK_WEIGHT +
                MITOSIS_BLOCK_WEIGHT + 
                DIAMOND_BLOCK_WEIGHT + 
                PINK_BLOCK_WEIGHT
            ){
                this.type = 'pink'
            } else if (
                rand <
                PROJECTILE_BLOCK_WEIGHT +
                BOMB_BLOCK_WEIGHT +
                PIERCING_BLOCK_WEIGHT +
                MITOSIS_BLOCK_WEIGHT + 
                DIAMOND_BLOCK_WEIGHT + 
                PINK_BLOCK_WEIGHT + 
                BLOCKING_BLOCK_WEIGHT
            ){
                this.type = 'blocking'
            }else {
                this.type = 'explode'
            }
        }

        this.display = function () {
            switch (this.type) {
                case 'projectile':
                    ctx.fillStyle = COLORS.RED
                    break
                case 'bomb':
                    ctx.fillStyle = COLORS.BLUE
                    break
                case 'piercing':
                    ctx.fillStyle = COLORS.GREEN
                    break
                case 'mitosis':
                    ctx.fillStyle = COLORS.WHITE
                    break
                case 'explode':
                    ctx.fillStyle = COLORS.ORANGE
                    break
                case 'diamond':
                    ctx.fillStyle = COLORS.DIAMOND
                    break
                case 'pink':
                    ctx.fillStyle = COLORS.PINK
                    break
                case 'blocking':
                    ctx.fillStyle = COLORS.PURPLE
                    break
                default:
                    ctx.fillStyle = COLORS.GRAY
                    break
            }
            ctx.fillRect(this.x, this.y, this.w, this.h)
            ctx.strokeStyle = '#000'
            ctx.lineWidth = 5
            ctx.strokeRect(this.x, this.y, this.w, this.h)
        }

        // Handles block destruction and special effects activation
        this.activateEffect = function (hittingBall) {
            if (this.isDestroyed) return
            this.isDestroyed = true

            // Spawn block break particles
            const particleCount = NUM_BLOCK_BREAK_PARTICLES_PER_AXIS
            for (let x = 0; x < particleCount; x++) {
                for (let y = 0; y < particleCount; y++) {
                    const px = this.x + (x + 0.5) * (this.w / particleCount)
                    const py = this.y + (y + 0.5) * (this.h / particleCount)
                    const speed = 150 + Math.random() * 150
                    const angle = Math.random() * Math.PI * 2
                    const vx = speed * Math.cos(angle)
                    const vy = speed * Math.sin(angle)
                    const vr = (Math.random() - 0.5) * 10
                    const size = Math.min(this.w, this.h) / particleCount
                    let color = '#777'

                    switch (this.type) {
                        case 'projectile':
                            color = COLORS.RED
                            break
                        case 'bomb':
                            color = COLORS.BLUE
                            break
                        case 'piercing':
                            color = COLORS.GREEN
                            break
                        case 'mitosis':
                            // Mitosis particle color depends on the hitting ball type
                            if (hittingBall !== undefined) {
                                switch (hittingBall.type) {
                                    case 'bomb':
                                        color = COLORS.BLUE
                                        break
                                    case 'piercing':
                                        color = COLORS.GREEN
                                        break
                                    default:
                                        color = COLORS.WHITE
                                        break
                                }
                            } else {
                                color = COLORS.WHITE
                            }
                            break
                        case 'explode':
                            color = COLORS.ORANGE
                            break
                        case 'diamond':
                            color = COLORS.DIAMOND
                            break
                        case 'pink':
                            color = COLORS.PINK
                            break
                        case 'blocking':
                            color = COLORS.PURPLE
                            break
                    }
                    const particle = new BlockBreakParticle(
                        px,
                        py,
                        size,
                        vx,
                        vy,
                        vr,
                        color,
                        0.5,
                    )
                    brokenBlockParticles.push(particle)
                }
            }

            // Handle special block type activation
            switch (this.type) {
                case 'projectile':
                    // Spawn multiple projectiles aiming generally away from the paddle
                    for (let i = 0; i < 5; i++) {
                        const angle = generateAngle(MIN_BOUNCE_ANGLE) // Could be adjusted
                        const projectile = new Ball(
                            this.x + this.w / 2,
                            this.y + this.h / 2,
                            PROJECTILE_RADIUS,
                            'projectile',
                        )
                        projectile.vx = PROJECTILE_SPEED * Math.cos(angle)
                        projectile.vy = PROJECTILE_SPEED * Math.sin(angle)
                        balls.push(projectile)
                    }
                    break
                case 'bomb':
                    // Spawn a bomb ball that explodes on collision
                    const bombAngle = generateAngle((5 * Math.PI) / 8, -1)
                    const bomb = new Ball(
                        this.x + this.w / 2,
                        this.y + this.h / 2,
                        BOMB_RADIUS,
                        'bomb',
                        true,
                    )
                    bomb.vx = PROJECTILE_SPEED * Math.cos(bombAngle)
                    bomb.vy = PROJECTILE_SPEED * Math.sin(bombAngle)
                    balls.push(bomb)
                    break
                case 'piercing':
                    // Spawn a new piercing ball
                    const piercingAngle = generateAngle((5 * Math.PI) / 8, -1)
                    const piercingBall = new Ball(
                        this.x + this.w / 2,
                        this.y + this.h / 2,
                        BALL_RADIUS,
                        'piercing',
                        BALL_SPEED,
                        true,
                    )
                    piercingBall.vx = BALL_SPEED * Math.cos(piercingAngle)
                    piercingBall.vy = BALL_SPEED * Math.sin(piercingAngle)
                    balls.push(piercingBall)
                    break
                case 'mitosis':
                    // Duplicate the hitting ball's type and properties
                    if (hittingBall === undefined || hittingBall.type === 'projectile') {
                        break
                    } // Don't duplicate if no ball or if it's a projectile
                    for (let i = 0; i < MITOSIS_BALL_COUNT; i++) {
                        const mitosisAngle = generateAngle((5 * Math.PI) / 8, -1)
                        const mitosisBall = new Ball(
                            this.x + this.w / 2,
                            this.y + this.h / 2,
                            hittingBall.r,
                            hittingBall.type,
                            true,
                        )
                        mitosisBall.vx = BALL_SPEED * Math.cos(mitosisAngle)
                        mitosisBall.vy = BALL_SPEED * Math.sin(mitosisAngle)
                        balls.push(mitosisBall)
                    }
                    break
                case 'explode':
                    const blockCenterX = this.x + this.w / 2
                    const blockCenterY = this.y + this.h / 2

                    // Generate explosion particles
                    for (let i = 0; i < NUM_EXPLOSION_PARTICLES; i++) {
                        const angle = Math.random() * Math.PI * 2
                        const speed = EXPLOSION_PARTICLE_SPEED * (0.5 + Math.random() * 0.5)
                        const vx = speed * Math.cos(angle)
                        const vy = speed * Math.sin(angle)
                        const radius = 10 + Math.random() * 10
                        const particle = new ExplosionParticle(
                            blockCenterX + Math.cos(angle) * (this.w / 4),
                            blockCenterY + Math.sin(angle) * (this.h / 4),
                            radius,
                            vx,
                            vy,
                            COLORS2.ORANGE,
                            EXPLOSION_PARTICLE_LIFETIME,
                        )
                        explosionParticles.push(particle)
                    }

                    // Schedule nearby block destruction
                    let blocksToActivate = []
                    for (const block of blocks) {
                        const dx = block.x + block.w / 2 - blockCenterX
                        const dy = block.y + block.h / 2 - blockCenterY
                        const distance = Math.sqrt(dx * dx + dy * dy)

                        if (distance < EXPLODE_BLOCK_RADIUS && block !== this) {
                            // Exclude itself from array
                            blocksToActivate.push(block)
                        }
                    }
                    // Delay chain reaction to simulate explosion spread
                    setTimeout(() => {
                        let pointCount = 0
                        
                        for (const block of blocksToActivate) {
                            if (!block.isDestroyed) {
                                // Only activate if not already destroyed
                                block.activateEffect() // Recursive activation!
                                pointCount++
                            }
                        }
                        // add flavor text for score increase
                        let color = COLORS.ORANGE
                        score(pointCount, color)
                    }, 250)
                    break
                    
                case 'diamond':
                    // Spawn multiple diamonds aiming generally away from the paddle
                    for (let i = 0; i < 2; i++) {
                        const angle = generateAngle(MIN_BOUNCE_ANGLE) // Could be adjusted
                        const diamond = new Ball(
                            this.x + this.w / 2,
                            this.y + this.h / 2,
                            DIAMOND_RADIUS,
                            'diamond',
                            DIAMOND_SPEED,
                        )
                        diamond.vx = DIAMOND_SPEED * Math.cos(angle)
                        diamond.vy = DIAMOND_SPEED * Math.sin(angle)
                        balls.push(diamond)
                    }
                    break
                case 'pink':
                    // Spawn a pink ball aiming generally away from the paddle
                    const angle = generateAngle(MIN_BOUNCE_ANGLE) // Could be adjusted
                    const pink = new Ball(
                        this.x + this.w / 2,
                        this.y + this.h / 2,
                        PINK_RADIUS,
                        'pink',
                    )
                    pink.vx = PINK_SPEED * Math.cos(angle)
                    pink.vy = PINK_SPEED * Math.sin(angle)
                    balls.push(pink)
                    break
                case 'blocking':
                    // Spawn a new blocking ball
                    const blockingAngle = generateAngle((5 * Math.PI) / 8, -1)
                    const blockingBall = new Ball(
                        this.x + this.w / 2,
                        this.y + this.h / 2,
                        BLOCKING_RADIUS_MIN,
                        'blocking',
                        true,
                        BLOCKING_SPEED
                    )
                    blockingBall.vx = BLOCKING_SPEED * Math.cos(blockingAngle)
                    blockingBall.vy = BLOCKING_SPEED * Math.sin(blockingAngle)
                    balls.push(blockingBall)
                    break
            }
            // currentScore++
        }

        this.checkForCollisions = function (ball) { //the block-ball collision function
            // Check for collision
            if (!rectCircleColliding(this, ball)) {
                return false
            }

            ball.blocksHitCount++

            // Handle Piercing ball pass-through logic
            if (
                ball.type === 'piercing' &&
                ball.blocksHitCount <= PIERCING_BLOCK_LIMIT &&
                !ball.isDisabled
            ) {
                this.activateEffect(ball)
                
                // add flavor text for score increase
                let color = COLORS.GREEN
                score(1, color)
                
                return true
            }

            // Bounce calculation (standard block bounce)
            const overlapX =
                this.w / 2 + ball.r - Math.abs(ball.x - (this.x + this.w / 2))
            const overlapY =
                this.h / 2 + ball.r - Math.abs(ball.y - (this.y + this.h / 2))

            if (overlapX < overlapY) {
                ball.vx *= -1
                // Adjust position to prevent sticking
                ball.x +=
                    ball.x > this.x + this.w / 2 ? overlapX + 0.1 : -(overlapX + 0.1)
            } else {
                ball.vy *= -1
                // Adjust position to prevent sticking
                ball.y +=
                    ball.y > this.y + this.h / 2 ? overlapY + 0.1 : -(overlapY + 0.1)
            }

            // Normal and Bomb ball collision action
            if (ball.type !== 'projectile' && ball.type !== 'diamond' && ball.type !== 'pink' && !ball.isDisabled) {
                if (ball.type === 'bomb' && this.type !== 'mitosis') {
                    // Bomb explosion on impact
                    const bombCenterX = ball.x
                    const bombCenterY = ball.y

                    let pointCount = 0
                    for (const block of blocks) {
                        const dx = block.x + block.w / 2 - bombCenterX
                        const dy = block.y + block.h / 2 - bombCenterY
                        const distance = Math.sqrt(dx * dx + dy * dy)
                        if (distance < BOMB_EXPLOSION_RADIUS) {
                            block.activateEffect()
                            pointCount++
                        }
                    }
                    // add flavor text for score increase
                    let color = COLORS.BLUE_L
                    score(pointCount, color)
                    
                    ball.isDestroyed = true // Destroy the bomb ball

                    // Generate bomb explosion particles
                    for (let i = 0; i < NUM_EXPLOSION_PARTICLES; i++) {
                        const angle = Math.random() * Math.PI * 2
                        const speed = EXPLOSION_PARTICLE_SPEED * (0.5 + Math.random() * 0.5)
                        const vx = speed * Math.cos(angle)
                        const vy = speed * Math.sin(angle)
                        const radius = 10 + Math.random() * 10
                        const particle = new ExplosionParticle(
                            bombCenterX + Math.cos(angle) * BOMB_RADIUS,
                            bombCenterY + Math.sin(angle) * BOMB_RADIUS,
                            radius,
                            vx,
                            vy,
                            COLORS2.BLUE,
                            EXPLOSION_PARTICLE_LIFETIME,
                        )
                        explosionParticles.push(particle)
                    }
                } else { 
                    if (this.type === 'mitosis') {
                        ball.isDisabled = true;
                    }
                    this.activateEffect(ball)
                    // add flavor text for score increase
                    let color = COLORS.GRAY
                    
                    switch (ball.type) {
                        case 'bomb':
                            color = COLORS.BLUE_L
                            break
                        case 'piercing':
                            color = COLORS.GREEN
                            break
                        default:
                            color = COLORS.WHITE
                            break
                    }// projectiles, diamonds, and pinks shouldn't be breaking blocks anyways
                    score(1, color)
                }
            }

            return true
        }
    }

    function generateBlocks() {
        blocks = []
        const numBlocksInColumn = Math.floor(VIRTUAL_HEIGHT / BLOCK_SIZE)

        for (let row = 0; row < NUM_INITIAL_ROWS; row++) {
            for (let column = 0; column < numBlocksInColumn; column++) {
                const x = VIRTUAL_WIDTH - (NUM_INITIAL_ROWS - row) * BLOCK_SIZE
                const y = column * BLOCK_SIZE
                blocks.push(new Block(x, y, BLOCK_SIZE, BLOCK_SIZE))
            }
        }
    }

    // Call generateBlocks immediately to fill the initial block array
    generateBlocks()

    // BALL OBJECT
    function Ball(x, y, radius, type, speed = BALL_SPEED, isDisabled = false) {
        this.x = x
        this.y = y
        this.r = radius
        this.type = type || 'normal'
        this.isDisabled = isDisabled // Used to prevent immediate interaction after spawning
        this.blocksHitCount = Infinity
        this.ballsHitCount = Infinity
        this.isDestroyed = false // Corresponds to `dead` in original
        this.vx = 0
        this.vy = 0
        this.speed = speed
        this.spawnTime = performance.now() + Math.random() * 1000 // For bomb pulse timing

        this.update = function (dt) { //the ball updates function
            this.x += this.vx * dt
            this.y += this.vy * dt

            if(this.type === 'blocking'){
                if(this.isDisabled){
                    this.r = BLOCKING_RADIUS_MIN
                } else {
                    this.r = BLOCKING_RADIUS_MAX + (BLOCKING_RADIUS_MIN - BLOCKING_RADIUS_MAX) * Math.max(0, BLOCKING_PROJECTILE_LIMIT - this.ballsHitCount)
                }
            }

            // Wall collisions (top and bottom)
            if (this.y - this.r <= 0) {
                this.y = this.r
                this.vy *= -1
            } else if (this.y + this.r >= VIRTUAL_HEIGHT) {
                this.y = VIRTUAL_HEIGHT - this.r
                this.vy *= -1
            }

            // Right wall collision (for standard bounce)
            if (this.x + this.r >= VIRTUAL_WIDTH) {
                this.x = VIRTUAL_WIDTH - this.r
                this.vx *= -1
            }

            // Prevent horizontal bounce stall
            const angle = Math.atan2(this.vy, this.vx)
            const absAngle = Math.abs(angle)
            const minAngleThreshold = Math.PI / 2 - MIN_BOUNCE_ANGLE

            if (
                absAngle > minAngleThreshold &&
                absAngle < Math.PI - minAngleThreshold
            ) {
                // Angle is too horizontal, re-set to minimum non-horizontal angle
                const newAngle =
                    absAngle < Math.PI / 2
                        ? Math.sign(this.vy) * MIN_BOUNCE_ANGLE
                        : Math.PI - Math.sign(this.vy) * MIN_BOUNCE_ANGLE

                const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
                this.vx = currentSpeed * Math.cos(newAngle)
                this.vy = currentSpeed * Math.sin(newAngle)
            }
        }

        this.display = function () {//the ball display function
            ctx.beginPath()
            let turn = 0
            switch (this.type) {
                case 'projectile':
                    ctx.fillStyle = COLORS.RED
                    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
                    ctx.fill()
                    break
                case 'bomb':
                    if (this.isDisabled) {
                        ctx.fillStyle = COLORS.BLUE_D
                        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
                        ctx.fill()
                    } else {
                        // Pulsing effect for an active bomb ball
                        let pulse = Math.pow(
                            Math.sin((performance.now() - this.spawnTime) / 200),
                            2,
                        )
                        if (pulse > 0.8) {
                            pulse = 1
                        } else {
                            pulse = 0.8 + pulse * 0.2
                        }
                        ctx.fillStyle = lerpHexColor(COLORS.BLUE_D, COLORS.BLUE, pulse)
                        ctx.arc(this.x, this.y, this.r * pulse, 0, Math.PI * 2)
                        ctx.fill()
                    }
                    break
                case 'piercing':
                    // Piercing ball shrinks with each block hit
                    const sizeFactor =
                        0.5 +
                        0.5 *
                        (Math.max(PIERCING_BLOCK_LIMIT - this.blocksHitCount, 0) /
                            PIERCING_BLOCK_LIMIT)
                    ctx.fillStyle = lerpHexColor(COLORS.GREEN_D, COLORS.GREEN, sizeFactor)
                    ctx.arc(this.x, this.y, this.r * sizeFactor, 0, Math.PI * 2)
                    ctx.fill()
                    break
                case 'diamond':
                    turn = this.vx * (performance.now() - this.spawnTime) / 24000
                    
                    drawRegularPoly(this.x, this.y, 3, this.r, COLORS.DIAMOND, turn)
                    
                    break
                case 'pink':
                    ctx.fillStyle = COLORS.PINK
                    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
                    ctx.fill()
                    break
                case 'blocking':
                    turn = this.vx * (performance.now() - this.spawnTime) / 24000
                    
                    if(this.isDisabled){
                        ctx.fillStyle = COLORS.PURPLE_D
                        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
                        ctx.fill()
                    }else{
                        drawRegularPoly(this.x, this.y, 1 + Math.max(0, BLOCKING_PROJECTILE_LIMIT - this.ballsHitCount), this.r, COLORS.PURPLE, turn)
                    }
                    
                    break
                default: // 'normal' ball
                    ctx.fillStyle = COLORS.WHITE
                    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
                    ctx.fill()
                    break
            }
        }

        this.checkForCollisions = function(ball){// the ball-ball collision function
            if(this.isDisabled || !circleCircleColliding(this, ball)) {
                return false
            }
            if(!(this.type === 'blocking' && ball.type === 'projectile')) {
                return false
            } //this entire function is only meant for blocking-projectile interactions, but may need more in the future

            //assume now I'm a blocking ball, and the other is a projectile
            this.ballsHitCount++
            ball.isDestroyed = true //destroy the projectile

            if(this.ballsHitCount >= BLOCKING_PROJECTILE_LIMIT){
                this.isDisabled = true
            }
            
            return true
        }
    }

    function serveInitialBall() {
        const servedBall = new Ball(
            VIRTUAL_WIDTH / 2,
            VIRTUAL_HEIGHT / 2,
            BALL_RADIUS,
            'normal',
        )
        balls.push(servedBall)
        // Delay the launch slightly
        setTimeout(() => {
            const angle = generateAngle(Math.PI / 4, -1)
            servedBall.vx = BALL_SPEED * Math.cos(angle)
            servedBall.vy = BALL_SPEED * Math.sin(angle)
        }, 500)
    }

    /* --- GAME LOOP & UPDATES --- */
    function gameLoop(now) {
        // If paused, freeze dt so physics doesn’t jump on resume
        const dt = isPaused ? 0 : Math.min((now - lastTime) / 1000, 0.033)
        lastTime = now

        switch (currentScene) {
            case 'menu':
                updateMenu()
                drawMenu()
                break

            case 'game':
                if (!isPaused && !isGameOver) {
                    updateGame(dt)
                    hotkey('r', considerReset)
                }
                if (!isPaused) {
                    updateText(dt)
                }
                if(!isGameOver){
                    hotkey(32, togglePause)
                } else{
                    hotkey('r', reset)
                }
                drawGame()
                break
            case 'maybeReset':
                updateReset()
                drawReset()
                break
        }
        releasedKeys = {}
        isMouseClicked = false
        requestAnimationFrame(gameLoop)
    }

    function updateGame(dt) {
        // Projectile spawning
        projectileTimer += dt
        if (projectileTimer >= PROJECTILE_SPAWN_INTERVAL) {
            projectileTimer = 0
            const angle = generateAngle(MIN_BOUNCE_ANGLE)
            const projectile = new Ball(
                VIRTUAL_WIDTH / 2,
                VIRTUAL_HEIGHT / 2,
                PROJECTILE_RADIUS,
                'projectile',
            )
            projectile.vx = PROJECTILE_SPEED * Math.cos(angle)
            projectile.vy = PROJECTILE_SPEED * Math.sin(angle)
            balls.push(projectile)
        }

        // Paddle movement
        paddle.dy = 0
        if (keys['w'] || keys[38]) paddle.dy = -PADDLE_SPEED //38 is up key
        if (keys['s'] || keys[40]) paddle.dy = PADDLE_SPEED //40 is down key

        paddle.y += paddle.dy * dt
        // Clamp paddle position within vertical bounds
        paddle.y = Math.max(0, Math.min(VIRTUAL_HEIGHT - paddle.h, paddle.y))
        // Update diamond paddle
        diamondPaddle.y = paddle.y - diamondPaddle.bonus / 2.0
        // Update pink paddle
        if(pinkPaddle.h > 0) {
            pinkPaddle.h -= dt * PINK_DEPLETION_RATE
            let paul = VIRTUAL_HEIGHT - pinkPaddle.h
            pinkPaddle.y = paul - paddle.y * ((paul) / (VIRTUAL_HEIGHT - paddle.h))
        }
        

        // Update particles and remove expired ones
        for (let i = 0; i < brokenBlockParticles.length; i++) {
            const particle = brokenBlockParticles[i]
            particle.update(dt)
            if (particle.age >= particle.lifetime) {
                brokenBlockParticles.splice(i, 1)
                i--
            }
        }
        for (let i = 0; i < explosionParticles.length; i++) {
            const particle = explosionParticles[i]
            particle.update(dt)
            if (particle.age >= particle.lifetime) {
                explosionParticles.splice(i, 1)
                i--
            }
        }

        // Ball movement and collisions
        for (let i = balls.length - 1; i >= 0; i--) {
            // Iterate backward for safe removal
            const ball = balls[i]
            if (ball.isDestroyed || ball.x + ball.r < 0) {
                // Check for destruction or off-screen
                balls.splice(i, 1)
                continue
            }
            ball.update(dt)

            
            if(diamondPaddle.bonus > 0) {
                // Diamond Paddle collision
                if (rectCircleColliding(diamondPaddle, ball)) {
                    hitBall(diamondPaddle, ball)
    
                    if (ball.type === 'projectile') {
                        // Projectile hits diamondPaddle: diamondPaddle damage 
                        diamondPaddle.bonus -= PROJECTILE_DAMAGE
                        diamondPaddle.h = paddle.h + diamondPaddle.bonus
                        balls.splice(i, 1)
                        // if (paddle.h <= 0) {
                        //     if(DIE_REFRESH){
                        //         die()
                        //         i = 0;
                        //     }else{
                        //         livesLostCount++
                        //         paddle.h = PADDLE_HEIGHT_INITIAL
                        //         diamondPaddle.bonus = INITIAL_DIAMOND_BONUS
                        //         paddle.y = (VIRTUAL_HEIGHT - PADDLE_HEIGHT_INITIAL) / 2
                        //     }
                        // }
                        
                        score(-1, COLORS.RED)
                        continue // Skip block collision check for this destroyed projectile
                    }
                    if (ball.type === 'diamond') {
                        // Diamond hits paddle: paddle growth
                        diamondPaddle.bonus += DIAMOND_DAMAGE
                        diamondPaddle.h = paddle.h + diamondPaddle.bonus
                        balls.splice(i, 1)
                        score((Math.random() < 0.5) ? 1 : 2, COLORS.DIAMOND)
                        continue // Skip block collision check for this destroyed diamond
                    }
                    if (ball.type === 'pink') {
                        // Pink hits paddle: make pink bigger
                        //if diamond paddle is bigger than pink, make size of diamond, then add half of the extra, otherwise just add half of diamond paddle
                        pinkPaddle.h = (pinkPaddle.h <= diamondPaddle.h) ? diamondPaddle.h + pinkPaddle.h / 2 : pinkPaddle.h + diamondPaddle.h/2
                        // pinkPaddle.h += diamondPaddle.h
                        balls.splice(i, 1)
                        score(5, COLORS.PINK)
                        continue // Skip block collision check for this destroyed diamond
                    }
                }
            }
            // Paddle collision
            else if (rectCircleColliding(paddle, ball)) {
                hitBall(paddle, ball)

                if (ball.type === 'projectile') {
                    // Projectile hits paddle: paddle damage and self-destruction
                    paddle.h -= PROJECTILE_DAMAGE
                    diamondPaddle.h = 0
                    balls.splice(i, 1)
                    if (paddle.h <= 0) {
                            if(DIE_REFRESH){
                                die()
                                i = 0
                            }else{
                                livesLostCount++
                                paddle.h = PADDLE_HEIGHT_INITIAL
                                diamondPaddle.bonus = INITIAL_DIAMOND_BONUS
                                paddle.y = (VIRTUAL_HEIGHT - PADDLE_HEIGHT_INITIAL) / 2
                            }
                    }
                    score(-1, COLORS.RED)
                    continue // Skip block collision check for this destroyed projectile
                }
                if (ball.type === 'diamond') {
                    // Diamond hits paddle: paddle growth
                    diamondPaddle.bonus += DIAMOND_DAMAGE
                    diamondPaddle.h = paddle.h + diamondPaddle.bonus
                    balls.splice(i, 1)
                    score((Math.random() < 0.5) ? 1 : 2, COLORS.DIAMOND)
                    continue // Skip block collision check for this destroyed diamond
                }
                if (ball.type === 'pink') {
                    // Pink hits paddle: make pink bigger
                    //if paddle is bigger than pink, make size of paddle, then add half of the extra, otherwise just add half of paddle
                    pinkPaddle.h = (pinkPaddle.h <= paddle.h) ? paddle.h + pinkPaddle.h / 2 : pinkPaddle.h + paddle.h/2
                    // pinkPaddle.h += paddle.h
                    balls.splice(i, 1)
                    score(5, COLORS.PINK)
                    continue // Skip block collision check for this destroyed diamond
                }
            }
            if(pinkPaddle.h > 0) {
                // Pink Paddle collision
                if (rectCircleColliding(pinkPaddle, ball)) {
                    //pink paddle ignores certain balls
                    if(ball.type !== 'projectile') {
                        hitBall(pinkPaddle, ball)
                        
                        if (ball.type === 'pink') {
                            let greaterPaddle = Math.max(paddle.h, diamondPaddle.h)
                            // Pink hits paddle: make pink bigger
                            //if paddle is bigger than pink, make size of paddle, then add half of the extra, otherwise just add half of paddle
                            pinkPaddle.h = (pinkPaddle.h <= greaterPaddle) ? greaterPaddle + pinkPaddle.h / 2 : pinkPaddle.h + greaterPaddle/2
                            // pinkPaddle.h += Math.max(paddle.h, diamondPaddle.h)
                            balls.splice(i, 1)
                            score(5, COLORS.PINK)
                            continue // Skip block collision check for this destroyed diamond
                        }
                    }
                }
            }

            // Block collision
            for (let j = 0; j < blocks.length; j++) {
                if (blocks[j].isDestroyed) {
                    continue
                }
                if (blocks[j].checkForCollisions(ball)) {
                    break // Only check one collision per ball per frame for simplicity
                }
            }
            // Ball-ball collision
            for (let j = 0; j < balls.length; j++) {
                if (balls[j].isDestroyed) {
                    continue
                }
                if (balls[j].checkForCollisions(ball)) {
                    break // Only check one collision per ball per frame for simplicity
                }
            }
        }

        // Clean up destroyed blocks
        for (let i = blocks.length - 1; i >= 0; i--) {
            if (blocks[i].isDestroyed) {
                blocks.splice(i, 1)
            }
        }

        // Logic to check if new blocks should advance/spawn
        let shouldAdvance = true
        for (const block of blocks) {
            // Check if any block is to the left of the advance line
            if (
                block.x <
                VIRTUAL_WIDTH -
                BLOCK_SIZE * (NUM_INITIAL_ROWS - ROWS_TO_CLEAR_FOR_ADVANCE)
            ) {
                shouldAdvance = false
                break
            }
        }

        // Spawn new rows if cleared enough, or if all blocks are gone
        if ((shouldAdvance && !blocksAreAdvancing) || blocks.length === 0) {
            const numBlocksInColumn = Math.floor(VIRTUAL_HEIGHT / BLOCK_SIZE)
            for (let row = 0; row < NUM_INITIAL_ROWS + 1; row++) {
                for (let column = 0; column < numBlocksInColumn; column++) {
                    // Spawn new blocks far to the right
                    const x = VIRTUAL_WIDTH + (NUM_INITIAL_ROWS - row) * BLOCK_SIZE
                    const y = column * BLOCK_SIZE
                    blocks.push(new Block(x, y, BLOCK_SIZE, BLOCK_SIZE))
                }
            }
            blocksAreAdvancing = true
        }

        // Slowly slide the rows left
        let minBlockX = Infinity
        for (const block of blocks) {
            if (block.x < minBlockX) {
                minBlockX = block.x
            }
        }

        const targetX = VIRTUAL_WIDTH - BLOCK_SIZE * NUM_INITIAL_ROWS
        if (blocksAreAdvancing && minBlockX > targetX) {
            // Calculate a speed to move the blocks in
            const advanceSpeed = (BLOCK_SIZE / 10) * 60 // Equivalent to 6 blocks/sec
            for (const block of blocks) {
                block.x -= advanceSpeed * dt
            }
        } else if (blocksAreAdvancing) {
            // Blocks have finished sliding in
            blocksAreAdvancing = false
            // Snap blocks to the final grid position
            for (const block of blocks) {
                block.x = Math.round(block.x / BLOCK_SIZE) * BLOCK_SIZE
            }
            // Remove blocks that are too far right (outside the game area, likely old/redundant)
            for (let i = blocks.length - 1; i >= 0; i--) {
                if (blocks[i].x >= VIRTUAL_WIDTH) {
                    // Assuming VIRTUAL_WIDTH is the right edge of the playing area
                    blocks.splice(i, 1)
                }
            }
        }

        // Check for normal ball loss and game over
        let areAnyNormalBallsRemaining = balls.some(
            (ball) => ball.type === 'normal',
        )

        if (!areAnyNormalBallsRemaining) {
            if(DIE_REFRESH){
                die()
            }else{
                livesLostCount++
                serveInitialBall()
            }
        }

        if (livesLostCount >= MAX_LIVES) {
            isGameOver = true
        }

    }
    //stop when paused, not when game over
    function updateText(dt) {
        // Update flavor text and remove expired ones
        for (let i = 0; i < floatyTexts.length; i++) {
            const text = floatyTexts[i]
            text.update(dt)
            if (text.expired) {
                floatyTexts.splice(i, 1)
                i--
            }
        }
    }

    function updateMenu() {
        // Check if the mouse is inside the button's boundaries
        menuButton.update()
    }
    function updateReset() {
        resumeButton.update()
        resetButton.update()
    }

    /* --- DISPLAY FUNCTIONS --- */

    function drawGame() {
        // Reset canvas for the new frame
        ctx.clearRect(0, 0, canvas.width, canvas.height) // Use canvas.width/height for internal size
        ctx.save()

        // Background
        ctx.fillStyle = COLORS.BLACK
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT)

        // Center divider (Net) - Not strictly centered, but positioned
        ctx.fillStyle = COLORS2.WHITE_T
        const netWidth = 6
        const segmentHeight = 22
        const netX = (VIRTUAL_WIDTH - netWidth) / 2 + (BLOCK_SIZE * 8) / 2 // Adjusted position
        for (let y = 10; y < VIRTUAL_HEIGHT; y += segmentHeight * 1.6) {
            ctx.fillRect(netX, y, netWidth, segmentHeight)
        }

        // Blocks
        for (const block of blocks) {
            block.display()
        }
        // Pink Paddle
        if(pinkPaddle.h > 0)
            drawRoundRect(pinkPaddle.x, pinkPaddle.y, pinkPaddle.w, pinkPaddle.h, Math.min(6, pinkPaddle.h), COLORS.PINK_T)
        // Diamond Paddle
        if(diamondPaddle.bonus) //meant to appear under the main paddle
            drawRoundRect(diamondPaddle.x, diamondPaddle.y, diamondPaddle.w, diamondPaddle.h, 6, COLORS.DIAMOND)

        // Paddle
        drawRoundRect(paddle.x, paddle.y, paddle.w, paddle.h, 6, COLORS.WHITE_D)

        // Balls
        for (const ball of balls) {
            ball.display()
        }

        // Particles (must be drawn after everything else)
        for (const particle of brokenBlockParticles) {
            particle.display()
        }
        for (const particle of explosionParticles) {
            particle.display()
        }
        // Draw flavor text
        for (const text of floatyTexts) {
            text.display()
        }

        // Scoreboard - Lives
        ctx.fillStyle = COLORS.WHITE_D
        ctx.font = '30px system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(
            `Lives: ${MAX_LIVES - livesLostCount}`,
            VIRTUAL_WIDTH * 0.2,
            40,
        )

        // Scoreboard - Score
        ctx.fillText(`Score: ${currentScore}`, VIRTUAL_WIDTH * 0.4, 40)

        // Pause screen
        if (isPaused && !isGameOver) {
            ctx.fillStyle = COLORS2.BLACK_T
            ctx.fillRect(VIRTUAL_WIDTH / 2 - 250, VIRTUAL_HEIGHT / 2 - 48, 500, 96)
            ctx.fillStyle = COLORS.WHITE
            ctx.font = '20px system-ui, sans-serif'
            ctx.fillText(
                'Paused. Press Space or Pause to resume.',
                VIRTUAL_WIDTH / 2,
                VIRTUAL_HEIGHT / 2 + 6,
            )
        }

        // Game over screen
        if (isGameOver) {
            ctx.fillStyle = COLORS2.BLACK_T2
            ctx.fillRect(VIRTUAL_WIDTH / 2 - 320, VIRTUAL_HEIGHT / 2 - 100, 640, 200)
            
            ctx.fillStyle = COLORS.RED
            ctx.font = '72px serif'
            ctx.fillText(
                'YOU DIED',
                VIRTUAL_WIDTH / 2, 
                VIRTUAL_HEIGHT / 2 - 32,
            )
            
            ctx.fillStyle = COLORS.WHITE
            ctx.font = '36px system-ui, sans-serif'
            ctx.fillText(
                `You got a score of ${currentScore}!`,
                VIRTUAL_WIDTH / 2,
                VIRTUAL_HEIGHT / 2 + 19,
            )
            ctx.font = '18px system-ui, sans-serif'
            ctx.fillText(
                'Click Restart or press R to play again.',
                VIRTUAL_WIDTH / 2,
                VIRTUAL_HEIGHT / 2 + 55,
            )
        }

        ctx.restore()
    }

    function drawMenu() {
        // Background
        ctx.fillStyle = COLORS.BLACK
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT)

        // Title
        ctx.fillStyle = COLORS.WHITE_D
        ctx.font = '60px system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('[BLOCK][BLAST]', VIRTUAL_WIDTH / 2, 100)

        // Instructions
        ctx.font = '20px system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillStyle = COLORS.GRAY_L
        ctx.fillText('To Move Press: W (Up) and S (Down) or arrow keys', VIRTUAL_WIDTH / 2, 170)
        ctx.fillText(`Bounce the ball to break blocks!`, VIRTUAL_WIDTH / 2, 195)
        ctx.fillText(
            `Break as many blocks as possible to maximize score!`,
            VIRTUAL_WIDTH / 2,
            245,
        )
        ctx.fillText(
            'Avoid the red projectiles or your paddle will shrink!',
            VIRTUAL_WIDTH / 2,
            275,
        )
        ctx.textAlign = 'left'
        ctx.fillText('Last updated: June 23, 2026', 20, VIRTUAL_HEIGHT - 30)


        // Button
        menuButton.display()
    }

    function drawReset() {
        // Background
        ctx.fillStyle = COLORS.BLACK
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT)

        // Title
        ctx.fillStyle = COLORS.WHITE_D
        ctx.font = '60px system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Confirm Reset?', VIRTUAL_WIDTH / 2, 200)

        // Button
        resumeButton.display()
        resetButton.display()
    }

    function pauseGame() {
        isPaused = true
    }

    function resumeGame() {
        isPaused = false
    }
})()
