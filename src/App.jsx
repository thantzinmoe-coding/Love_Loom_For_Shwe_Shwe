import React, { useEffect, useRef, useState, useMemo } from 'react';
import './App.css';

const imageFiles = [
    'Shwe_Shwe_0.jpg', 'Shwe_Shwe_1.jpg', 'Shwe_Shwe_2.jpg', 'Shwe_Shwe_3.jpg',
    'Shwe_Shwe_4.jpg', 'Shwe_Shwe_5.jpg', 'Shwe_Shwe_6.jpg', 'Shwe_Shwe_7.jpg',
    'Shwe_Shwe_8.jpg', 'Shwe_Shwe_9.jpg', 'Shwe_Shwe_10.jpg', 'Shwe_Shwe_11.jpg',
    'Shwe_Shwe_12.jpg', 'Shwe_Shwe_13.jpg', 'Shwe_Shwe_14.jpg', 'Shwe_Shwe_15.jpg',
    'Shwe_Shwe_16.jpg', 'Shwe_Shwe_17.jpg', 'Shwe_Shwe_18.JPG', 'Shwe_Shwe_19.PNG',
    'Shwe_Shwe_20.PNG', 'Shwe_Shwe_21.jpg', 'Shwe_Shwe_22.jpg', 'Shwe_Shwe_23.jpg',
    'Shwe_Shwe_24.jpg', 'Shwe_Shwe_25.jpg', 'Shwe_Shwe_26.jpg', 'Shwe_Shwe_27.jpg'
];
const numImages = imageFiles.length;
const numTexts = 15;
const phrases = ["I love you bbe", "I love you", "🤍", "❤️", "💕", "forever yours", "my everything"];

function App() {
    const sceneRef = useRef(null);
    const canvasRef = useRef(null);
    const cursorRef = useRef(null);

    // Generate static random values for floating items so they don't jump on re-renders
    const items = useMemo(() => {
        const genItem = (type, index) => {
            const startX = (Math.random() - 0.5) * 150 + 'vw';
            const startY = (Math.random() - 0.5) * 150 + 'vh';
            const endX = (Math.random() - 0.5) * 150 + 'vw';
            const endY = (Math.random() - 0.5) * 150 + 'vh';
            const rotation = (Math.random() - 0.5) * 30;
            const duration = 10 + Math.random() * 10;
            const delay = Math.random() * -20;
            
            const style = {
                '--startX': startX,
                '--startY': startY,
                '--endX': endX,
                '--endY': endY,
                '--rot': rotation + 'deg',
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`
            };

            if (type === 'image') {
                return (
                    <div key={`img-${index}`} className="floating-item" style={style}>
                        <img 
                            src={`/images/${imageFiles[index % imageFiles.length]}`} 
                            className="image-item" 
                            loading="lazy" 
                            decoding="async" 
                            alt="" 
                        />
                    </div>
                );
            } else {
                const text = phrases[Math.floor(Math.random() * phrases.length)];
                const isHeart = text === "❤️" || text === "💕" || text === "🤍";
                return (
                    <div key={`txt-${index}`} className="floating-item" style={style}>
                        <span className={isHeart ? "heart-item" : "text-item"}>{text}</span>
                    </div>
                );
            }
        };

        const elements = [];
        for (let i = 0; i < numImages; i++) elements.push(genItem('image', i));
        for (let i = 0; i < numTexts; i++) elements.push(genItem('text', i));
        return elements;
    }, []);

    useEffect(() => {
        // Particles DOM pool setup
        const POOL_SIZE = 12;
        const particlePool = [];
        let poolIndex = 0;
        const colors = ['#ff9a9e', '#fad0c4', '#a18cd1', '#fbc2eb', '#f6d5f7', '#ffecd2'];
        
        for (let i = 0; i < POOL_SIZE; i++) {
            const p = document.createElement('div');
            p.classList.add('cursor-particle');
            p.style.background = colors[i % colors.length];
            p.style.opacity = '0';
            document.body.appendChild(p);
            particlePool.push(p);
        }

        let particleThrottle = 0;
        const spawnCursorParticle = (x, y) => {
            particleThrottle++;
            if (particleThrottle % 4 !== 0) return;
            const p = particlePool[poolIndex];
            poolIndex = (poolIndex + 1) % POOL_SIZE;
            p.style.transition = 'none';
            p.style.opacity = '1';
            p.style.left = x + 'px';
            p.style.top = y + 'px';
            p.style.transform = 'scale(1)';
            p.offsetWidth; // Force reflow
            p.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            p.style.opacity = '0';
            const dx = (Math.random() - 0.5) * 30;
            const dy = (Math.random() - 0.5) * 30;
            p.style.transform = `scale(0) translate(${dx}px, ${dy}px)`;
        };

        // State trackers
        let mouseX = 0;
        let mouseY = 0;
        let currentRotX = 0;
        let currentRotY = 0;
        let animationFrameId;

        // Stars setup
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const STAR_COUNT = 60;
        let stars = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            stars = [];
            for (let i = 0; i < STAR_COUNT; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 1.5 + 0.5,
                    alpha: Math.random(),
                    speed: Math.random() * 0.015 + 0.003,
                    direction: Math.random() > 0.5 ? 1 : -1
                });
            }
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Unified animation loop
        const tick = () => {
            // Parallax Scene
            currentRotY += (mouseX * 12 - currentRotY) * 0.06;
            currentRotX += (-mouseY * 8 - currentRotX) * 0.06;
            if (sceneRef.current) {
                sceneRef.current.style.transform = `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
            }

            // Canvas Stars
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                s.alpha += s.speed * s.direction;
                if (s.alpha >= 1) { s.alpha = 1; s.direction = -1; }
                if (s.alpha <= 0) { s.alpha = 0; s.direction = 1; }

                ctx.globalAlpha = s.alpha;
                ctx.fillStyle = '#fff';
                ctx.fillRect(s.x - s.radius, s.y - s.radius, s.radius * 2, s.radius * 2);
            }
            ctx.globalAlpha = 1;

            animationFrameId = requestAnimationFrame(tick);
        };
        tick();

        // Input listeners (Mouse/Touch)
        const updateMouse = (clientX, clientY) => {
            mouseX = (clientX / window.innerWidth - 0.5) * 2;
            mouseY = (clientY / window.innerHeight - 0.5) * 2;
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate(${clientX - 9}px, ${clientY - 9}px)`;
            }
            spawnCursorParticle(clientX, clientY);
        };

        const handleMouseMove = (e) => updateMouse(e.clientX, e.clientY);
        const handleTouchMove = (e) => {
            const t = e.touches[0];
            updateMouse(t.clientX, t.clientY);
        };

        // Gyroscope listener for mobile parallax
        const handleDeviceOrientation = (e) => {
            if (!e.gamma || !e.beta) return;
            // gamma is the left-to-right tilt in degrees, where right is positive
            // beta is the front-to-back tilt in degrees, where front is positive
            const maxTilt = 30; // Max tilt angle to care about
            
            let tiltX = e.gamma;
            let tiltY = e.beta;
            
            // Constrain tilt
            if (tiltX > maxTilt) tiltX = maxTilt;
            if (tiltX < -maxTilt) tiltX = -maxTilt;
            // Adjust beta so that holding phone at 45deg is "neutral"
            tiltY = tiltY - 45; 
            if (tiltY > maxTilt) tiltY = maxTilt;
            if (tiltY < -maxTilt) tiltY = -maxTilt;

            // Map to -1 to 1 range
            mouseX = tiltX / maxTilt;
            mouseY = tiltY / maxTilt;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('deviceorientation', handleDeviceOrientation);

        // Cleanup
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('deviceorientation', handleDeviceOrientation);
            particlePool.forEach(p => p.remove());
        };
    }, []);

    return (
        <>
            <canvas id="sparkles" ref={canvasRef}></canvas>

            <div id="scene" ref={sceneRef}>
                <div id="center-message">
                    <span className="msg-line">I Love You</span>
                    <span className="msg-sub">— forever & always —</span>
                </div>
                {items}
            </div>

            <div id="vignette"></div>
            <div id="custom-cursor" ref={cursorRef}></div>
        </>
    );
}

export default App;
