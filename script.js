/**
 * RECRUIT AI - Core Interactive Scripts
 * Implementing Grid, Gooey, Balloons, and UI logic in Vanilla JS
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Infinite Interactive Grid (Canvas) ---
    const gridCanvas = document.getElementById('gridCanvas');
    if (gridCanvas) {
        const ctx = gridCanvas.getContext('2d');
        let width, height;
        let mouseX = 0, mouseY = 0;
        let targetMouseX = 0, targetMouseY = 0;
        let offsetX = 0, offsetY = 0;
        const speed = 0.5;
        const gridSize = 40;

        const resizeGrid = () => {
            width = gridCanvas.parentElement.clientWidth;
            height = gridCanvas.parentElement.clientHeight;
            gridCanvas.width = width;
            gridCanvas.height = height;
        };
        window.addEventListener('resize', resizeGrid);
        resizeGrid();

        gridCanvas.parentElement.addEventListener('mousemove', (e) => {
            const rect = gridCanvas.getBoundingClientRect();
            targetMouseX = e.clientX - rect.left;
            targetMouseY = e.clientY - rect.top;
        });

        const drawGrid = () => {
            ctx.clearRect(0, 0, width, height);
            
            // Interaction smoothing
            mouseX += (targetMouseX - mouseX) * 0.1;
            mouseY += (targetMouseY - mouseY) * 0.1;
            
            // Auto scroll
            offsetX = (offsetX + speed) % gridSize;
            offsetY = (offsetY + speed) % gridSize;

            // Draw grid pattern
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.lineWidth = 1;

            for (let x = offsetX - gridSize; x < width + gridSize; x += gridSize) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
            }
            for (let y = offsetY - gridSize; y < height + gridSize; y += gridSize) {
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
            }
            ctx.stroke();

            // Masking effect (radial gradient centered on mouse)
            if (mouseX !== 0 && mouseY !== 0) {
                const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 300);
                gradient.addColorStop(0, 'rgba(0, 136, 255, 0.3)');
                gradient.addColorStop(1, 'rgba(255,255,255,0)');
                
                ctx.globalCompositeOperation = 'source-atop';
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
                ctx.globalCompositeOperation = 'source-over';
            }

            requestAnimationFrame(drawGrid);
        };
        drawGrid();
    }

    // --- 2. Gooey Text Morphing ---
    const texts = ["interviews", "live-coding", "talent assessment"];
    const morphTime = 1;
    const cooldownTime = 1.5;
    const text1 = document.getElementById('morphText1');
    const text2 = document.getElementById('morphText2');
    
    if (text1 && text2) {
        let textIndex = texts.length - 1;
        let time = new Date();
        let morph = 0;
        let cooldown = cooldownTime;

        text1.textContent = texts[texts.length - 1];
        text2.textContent = texts[0];

        const setMorph = (fraction) => {
            text2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
            text2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
            fraction = 1 - fraction;
            text1.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
            text1.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
        };

        const doCooldown = () => {
            morph = 0;
            text2.style.filter = "";
            text2.style.opacity = "100%";
            text1.style.filter = "";
            text1.style.opacity = "0%";
        };

        const doMorph = () => {
            morph -= cooldown;
            cooldown = 0;
            let fraction = morph / morphTime;
            if (fraction > 1) {
                cooldown = cooldownTime;
                fraction = 1;
            }
            setMorph(fraction);
        };

        const animateMorph = () => {
            requestAnimationFrame(animateMorph);
            const newTime = new Date();
            const shouldIncrementIndex = cooldown > 0;
            const dt = (newTime.getTime() - time.getTime()) / 1000;
            time = newTime;
            cooldown -= dt;

            if (cooldown <= 0) {
                if (shouldIncrementIndex) {
                    textIndex = (textIndex + 1) % texts.length;
                    text1.textContent = texts[textIndex % texts.length];
                    text2.textContent = texts[(textIndex + 1) % texts.length];
                }
                doMorph();
            } else {
                doCooldown();
            }
        };
        animateMorph();
    }

    // --- 3. Scroll Reveal & Navbar & Scroll Features ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    const revealElements = document.querySelectorAll('[data-reveal]');
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    revealElements.forEach(el => revealObs.observe(el));

    // Scroll-linked Features Logic
    const featuresWrap = document.getElementById('features');
    const scrollWordContainer = document.querySelector('.glass-word-container');
    const scrollWord = document.getElementById('scrollWord');
    const scrollDesc = document.getElementById('scrollDesc');

    if (featuresWrap && scrollWord && scrollDesc) {
        const featureData = [
            { word: "automated", desc: "Save hundreds of hours by automating your technical screening tasks." },
            { word: "cheat-proof", desc: "Real-time AI monitoring prevents cheating and generative tool usage." },
            { word: "bias-free", desc: "Standardized objective assessment completely free of human bias." },
            { word: "effortless", desc: "Integrate instantly with your ATS and existing hiring workflows." }
        ];

        let currentIndex = 0;

        window.addEventListener('scroll', () => {
            const rect = featuresWrap.getBoundingClientRect();
            // Calculate progress 0 to 1 as we scroll past the wrapper (height: 400vh)
            const scrollRange = rect.height - window.innerHeight;
            let progress = -rect.top / scrollRange;
            progress = Math.max(0, Math.min(progress, 0.99));

            const totalItems = featureData.length;
            const newIndex = Math.floor(progress * totalItems);

            if (newIndex !== currentIndex) {
                currentIndex = newIndex;
                
                // Animate out
                scrollWordContainer.classList.add(progress > 0.5 ? 'flip-out' : 'flip-in');
                scrollDesc.style.opacity = 0;
                scrollDesc.style.transform = 'translateY(10px)';
                
                setTimeout(() => {
                    scrollWord.textContent = featureData[currentIndex].word;
                    scrollDesc.textContent = featureData[currentIndex].desc;
                    
                    // Animate in
                    scrollWordContainer.classList.remove('flip-out', 'flip-in');
                    scrollDesc.style.opacity = 1;
                    scrollDesc.style.transform = 'translateY(0)';
                }, 150);
            }
        });
    }

    // --- 4. Number Counters ---
    const metricNums = document.querySelectorAll('.metric-num');
    const metricObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-target'));
                const suffix = el.getAttribute('data-suffix');
                let count = 0;
                const duration = 2000;
                const start = performance.now();

                const update = (now) => {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
                    
                    count = Math.floor(eased * target);
                    el.textContent = count + suffix;

                    if (progress < 1) requestAnimationFrame(update);
                    else el.textContent = target + suffix;
                };
                requestAnimationFrame(update);
                metricObs.unobserve(el);
            }
        });
    });
    metricNums.forEach(el => metricObs.observe(el));

    // --- 5. Custom Balloons Animation ---
    const launchBalloons = () => {
        const canvas = document.getElementById('balloonsCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const balloons = [];
        const colors = ['#00d4ff', '#7b2ff7', '#c471ed', '#f64f59', '#00e676'];

        for (let i = 0; i < 40; i++) {
            balloons.push({
                x: Math.random() * canvas.width,
                y: canvas.height + Math.random() * 200 + 50,
                radius: Math.random() * 20 + 20,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedY: Math.random() * 3 + 2,
                speedX: (Math.random() - 0.5) * 2,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: Math.random() * 0.05 + 0.02
            });
        }

        let animationId;
        const drawBalloons = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let active = false;

            balloons.forEach(b => {
                if (b.y + b.radius > -100) {
                    active = true;
                    b.y -= b.speedY;
                    b.x += b.speedX + Math.sin(b.wobble) * 1.5;
                    b.wobble += b.wobbleSpeed;

                    // Balloon body
                    ctx.beginPath();
                    ctx.ellipse(b.x, b.y, b.radius * 0.9, b.radius * 1.1, 0, 0, Math.PI * 2);
                    ctx.fillStyle = b.color;
                    ctx.globalAlpha = 0.85;
                    ctx.fill();
                    
                    // Balloon shine
                    ctx.beginPath();
                    ctx.ellipse(b.x - b.radius*0.3, b.y - b.radius*0.4, b.radius*0.2, b.radius*0.4, Math.PI/4, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,255,255,0.4)';
                    ctx.fill();

                    // String
                    ctx.beginPath();
                    ctx.moveTo(b.x, b.y + b.radius * 1.1);
                    ctx.lineTo(b.x + Math.sin(b.wobble) * 10, b.y + b.radius * 1.1 + 40);
                    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });

            if (active) {
                animationId = requestAnimationFrame(drawBalloons);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        };
        drawBalloons();
    };

    // --- 6. Form Submit ---
    const form = document.getElementById('ctaForm');
    const formSuccess = document.getElementById('ctaSuccess');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const btn = document.getElementById('submitBtn');
            const btnText = btn.querySelector('.btn-submit-text');
            const btnLoader = btn.querySelector('.btn-submit-loader');

            // Basic Validation Check
            const inputs = form.querySelectorAll('input[required]');
            let valid = true;
            inputs.forEach(i => {
                if (!i.value.trim()) {
                    valid = false;
                    i.style.borderColor = 'var(--accent-pink)';
                } else {
                    i.style.borderColor = 'var(--glass-border)';
                }
            });

            if (!valid) return;

            btn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'block';

            // Simulate API request
            setTimeout(() => {
                form.style.display = 'none';
                formSuccess.style.display = 'block';
                formSuccess.classList.add('active');
                launchBalloons();
            }, 1000);
        });

        form.querySelectorAll('input').forEach(i => {
            i.addEventListener('input', () => i.style.borderColor = 'var(--glass-border)');
        });
    }
});
