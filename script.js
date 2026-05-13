const scene = document.getElementById('scene');
const sparklesCanvas = document.getElementById('sparkles');
const ctx = sparklesCanvas.getContext('2d');

// All images in the images folder
const imageFiles = [
    'Shwe_Shwe_0.jpg', 'Shwe_Shwe_1.jpg', 'Shwe_Shwe_2.jpg', 'Shwe_Shwe_3.jpg',
    'Shwe_Shwe_4.jpg', 'Shwe_Shwe_5.jpg', 'Shwe_Shwe_6.jpg', 'Shwe_Shwe_7.jpg',
    'Shwe_Shwe_8.jpg', 'Shwe_Shwe_9.jpg', 'Shwe_Shwe_10.jpg', 'Shwe_Shwe_11.jpg',
    'Shwe_Shwe_12.jpg', 'Shwe_Shwe_13.jpg', 'Shwe_Shwe_14.jpg', 'Shwe_Shwe_15.jpg',
    'Shwe_Shwe_16.jpg', 'Shwe_Shwe_17.jpg', 'Shwe_Shwe_18.JPG', 'Shwe_Shwe_19.PNG',
    'Shwe_Shwe_20.PNG', 'Shwe_Shwe_21.jpg', 'Shwe_Shwe_22.jpg', 'Shwe_Shwe_23.jpg',
    'Shwe_Shwe_24.jpg', 'Shwe_Shwe_25.jpg', 'Shwe_Shwe_26.jpg', 'Shwe_Shwe_27.jpg'
];
const numImages = imageFiles.length; // 28 — one for every photo
const numTexts = 15; // Reduced further for better performance
const phrases = ["I love you bbe", "I love you", "🤍", "❤️", "💕", "forever yours", "my everything"];

const customCursor = document.getElementById('custom-cursor');

// Track mouse position (normalized -1 to 1)
let mouseX = 0;
let mouseY = 0;
let currentRotX = 0;
let currentRotY = 0;

// ===== CURSOR TRAIL — DOM pool (no create/remove) =====
const POOL_SIZE = 12;
const particlePool = [];
let poolIndex = 0;

function initParticlePool() {
    const colors = ['#ff9a9e', '#fad0c4', '#a18cd1', '#fbc2eb', '#f6d5f7', '#ffecd2'];
    for (let i = 0; i < POOL_SIZE; i++) {
        const p = document.createElement('div');
        p.classList.add('cursor-particle');
        p.style.background = colors[i % colors.length];
        p.style.opacity = '0';
        document.body.appendChild(p);
        particlePool.push(p);
    }
}
initParticlePool();

let particleThrottle = 0;
function spawnCursorParticle(x, y) {
    particleThrottle++;
    if (particleThrottle % 4 !== 0) return; // Only every 4th event

    const p = particlePool[poolIndex];
    poolIndex = (poolIndex + 1) % POOL_SIZE;

    // Reset animation by re-triggering reflow on the single element
    p.style.transition = 'none';
    p.style.opacity = '1';
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.transform = 'scale(1)';

    // Force reflow then animate out
    p.offsetWidth;
    p.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    p.style.opacity = '0';
    const dx = (Math.random() - 0.5) * 30;
    const dy = (Math.random() - 0.5) * 30;
    p.style.transform = `scale(0) translate(${dx}px, ${dy}px)`;
}

// ===== MOUSEMOVE =====
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

    if (customCursor) {
        customCursor.style.transform = `translate(${e.clientX - 9}px, ${e.clientY - 9}px)`;
    }

    spawnCursorParticle(e.clientX, e.clientY);
});

// ===== SPARKLE STAR FIELD (Canvas) =====
const STAR_COUNT = 60; // Reduced from 120
let stars = [];

function resizeCanvas() {
    sparklesCanvas.width = window.innerWidth;
    sparklesCanvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * sparklesCanvas.width,
            y: Math.random() * sparklesCanvas.height,
            radius: Math.random() * 1.5 + 0.5,
            alpha: Math.random(),
            speed: Math.random() * 0.015 + 0.003,
            direction: Math.random() > 0.5 ? 1 : -1
        });
    }
}
initStars();

// ===== SINGLE ANIMATION LOOP (merged parallax + stars) =====
function tick() {
    // --- Parallax ---
    currentRotY += (mouseX * 12 - currentRotY) * 0.06;
    currentRotX += (-mouseY * 8 - currentRotX) * 0.06;
    scene.style.transform = `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;

    // --- Stars ---
    ctx.clearRect(0, 0, sparklesCanvas.width, sparklesCanvas.height);
    for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.alpha += s.speed * s.direction;
        if (s.alpha >= 1) { s.alpha = 1; s.direction = -1; }
        if (s.alpha <= 0) { s.alpha = 0; s.direction = 1; }

        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = '#fff';
        // Use fillRect instead of arc for better performance (small squares look like stars anyway)
        ctx.fillRect(s.x - s.radius, s.y - s.radius, s.radius * 2, s.radius * 2);
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(tick);
}
tick();

// ===== FLOATING ITEMS CREATION =====
function createItem(type, index) {
    const el = document.createElement('div');
    el.classList.add('floating-item');

    if (type === 'image') {
        const img = document.createElement('img');
        img.src = `./images/${imageFiles[index % imageFiles.length]}`;
        img.classList.add('image-item');
        img.loading = 'lazy';
        img.decoding = 'async';
        el.appendChild(img);
    } else {
        const text = phrases[Math.floor(Math.random() * phrases.length)];
        el.innerText = text;
        if (text === "❤️" || text === "💕" || text === "🤍") {
            el.classList.add('heart-item');
        } else {
            el.classList.add('text-item');
        }
    }

    const startX = (Math.random() - 0.5) * 150 + 'vw';
    const startY = (Math.random() - 0.5) * 150 + 'vh';
    const endX = (Math.random() - 0.5) * 150 + 'vw';
    const endY = (Math.random() - 0.5) * 150 + 'vh';
    const rotation = (Math.random() - 0.5) * 30;
    const duration = 10 + Math.random() * 10;
    const delay = Math.random() * -20;

    el.style.setProperty('--startX', startX);
    el.style.setProperty('--startY', startY);
    el.style.setProperty('--endX', endX);
    el.style.setProperty('--endY', endY);
    el.style.setProperty('--rot', rotation + 'deg');
    el.style.animationDuration = `${duration}s`;
    el.style.animationDelay = `${delay}s`;

    fragment.appendChild(el);
}

// Build items using a document fragment (single DOM write)
const fragment = document.createDocumentFragment();

for (let i = 0; i < numImages; i++) {
    createItem('image', i);
}
for (let i = 0; i < numTexts; i++) {
    createItem('text', i);
}

// Append all items at once to the scene
scene.appendChild(fragment);

// ===== TOUCH SUPPORT =====
document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    mouseX = (touch.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (touch.clientY / window.innerHeight - 0.5) * 2;
    if (customCursor) {
        customCursor.style.transform = `translate(${touch.clientX - 9}px, ${touch.clientY - 9}px)`;
    }
}, { passive: true });