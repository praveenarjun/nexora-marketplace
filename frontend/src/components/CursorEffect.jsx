import { useEffect, useRef } from 'react';

/**
 * Premium cursor: canvas-drawn sparkle trail + expanding ripple rings
 * Works on desktop only (hidden on mobile/touch devices)
 */
export default function CursorEffect() {
    const canvasRef = useRef(null);
    const rafRef = useRef(null);
    const mouseRef = useRef({ x: -500, y: -500, moving: false });
    const particlesRef = useRef([]);
    const ringsRef = useRef([]);
    const lastPos = useRef({ x: -500, y: -500 });
    const stopTimerRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Resize canvas to fill window
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // ── Helpers ──────────────────────────────────────────────────────────
        const randomBetween = (a, b) => a + Math.random() * (b - a);

        const spawnParticles = (x, y) => {
            const count = Math.floor(randomBetween(1, 4));
            for (let i = 0; i < count; i++) {
                const angle = randomBetween(0, Math.PI * 2);
                const speed = randomBetween(0.4, 1.8);
                const hue = randomBetween(220, 280); // indigo → violet
                particlesRef.current.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - randomBetween(0.2, 0.8), // slight upward drift
                    radius: randomBetween(1, 3),
                    life: 1,           // 1 → 0
                    decay: randomBetween(0.012, 0.03),
                    hue,
                    twinkle: Math.random() > 0.5,  // some sparkle
                    twinklePhase: Math.random() * Math.PI * 2,
                });
            }
        };

        const spawnRing = (x, y) => {
            ringsRef.current.push({
                x, y,
                radius: 6,
                maxRadius: randomBetween(28, 48),
                life: 1,
                decay: 0.03,
            });
        };

        // ── Mouse tracking ────────────────────────────────────────────────────
        const onMouseMove = (e) => {
            const x = e.clientX;
            const y = e.clientY;
            mouseRef.current = { x, y, moving: true };

            // Spawn sparkle trail along path
            const dx = x - lastPos.current.x;
            const dy = y - lastPos.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 4) {
                spawnParticles(x, y);
                if (Math.random() < 0.25) spawnRing(x, y);
                lastPos.current = { x, y };
            }

            // Mark as "not moving" after idle
            clearTimeout(stopTimerRef.current);
            stopTimerRef.current = setTimeout(() => {
                mouseRef.current.moving = false;
            }, 80);
        };

        // Spawn ripple on click
        const onClick = (e) => {
            for (let i = 0; i < 3; i++) {
                ringsRef.current.push({
                    x: e.clientX,
                    y: e.clientY,
                    radius: 4,
                    maxRadius: 60 + i * 20,
                    life: 1,
                    decay: 0.025 - i * 0.005,
                });
            }
            // Burst of particles on click
            for (let i = 0; i < 14; i++) spawnParticles(e.clientX, e.clientY);
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('click', onClick, { passive: true });

        // ── Smooth cursor dot (CSS-driven, not canvas) ─────────────────────
        // Done via the DOM div below

        // ── Animation loop ────────────────────────────────────────────────────
        let frame = 0;
        const animate = () => {
            frame++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const { x: mx, y: my, moving } = mouseRef.current;

            // ── Draw expanding rings ──
            ringsRef.current = ringsRef.current.filter(ring => {
                ring.life -= ring.decay;
                if (ring.life <= 0) return false;

                const progress = 1 - ring.life;
                ring.radius += (ring.maxRadius - ring.radius) * 0.12;

                ctx.beginPath();
                ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `hsla(240, 80%, 70%, ${ring.life * 0.55})`;
                ctx.lineWidth = ring.life * 1.5;
                ctx.stroke();
                return true;
            });

            // ── Draw sparkle particles ──
            particlesRef.current = particlesRef.current.filter(p => {
                p.life -= p.decay;
                if (p.life <= 0) return false;

                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.03; // slight gravity pull
                p.vx *= 0.98; // drag

                const alpha = p.life;
                const radius = p.radius * p.life;
                const twinkleFactor = p.twinkle
                    ? 0.6 + 0.4 * Math.sin(frame * 0.3 + p.twinklePhase)
                    : 1;

                // Outer glow
                const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 3);
                grd.addColorStop(0, `hsla(${p.hue}, 90%, 75%, ${alpha * twinkleFactor})`);
                grd.addColorStop(1, `hsla(${p.hue}, 80%, 60%, 0)`);

                ctx.beginPath();
                ctx.arc(p.x, p.y, radius * 3, 0, Math.PI * 2);
                ctx.fillStyle = grd;
                ctx.fill();

                // Bright core
                ctx.beginPath();
                ctx.arc(p.x, p.y, radius * 0.8, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue}, 100%, 90%, ${alpha * twinkleFactor})`;
                ctx.fill();

                return true;
            });

            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);

        // Hide OS cursor
        document.documentElement.style.cursor = 'none';

        return () => {
            cancelAnimationFrame(rafRef.current);
            clearTimeout(stopTimerRef.current);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('click', onClick);
            window.removeEventListener('resize', resize);
            document.documentElement.style.cursor = '';
        };
    }, []);

    return (
        <>
            {/* Canvas for sparkles + rings */}
            <canvas
                ref={canvasRef}
                style={{
                    position: 'fixed',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 99997,
                }}
            />

            {/* Smooth CSS cursor dot */}
            <style>{`
                .cursor-dot {
                    position: fixed;
                    top: 0; left: 0;
                    width: 10px; height: 10px;
                    border-radius: 50%;
                    background: #818cf8;
                    pointer-events: none;
                    z-index: 99999;
                    box-shadow:
                        0 0 8px #818cf8,
                        0 0 20px rgba(129,140,248,0.6),
                        0 0 40px rgba(99,102,241,0.3);
                    transform: translate(-5px, -5px);
                    transition: transform 0.05s linear, opacity 0.3s;
                    mix-blend-mode: screen;
                }
                .cursor-ring {
                    position: fixed;
                    top: 0; left: 0;
                    width: 32px; height: 32px;
                    border-radius: 50%;
                    border: 1.5px solid rgba(129,140,248,0.5);
                    pointer-events: none;
                    z-index: 99998;
                    transform: translate(-16px, -16px);
                    transition: transform 0.12s ease-out, opacity 0.3s;
                    box-shadow: 0 0 10px rgba(99,102,241,0.25);
                }
            `}</style>

            <div
                className="cursor-dot"
                style={{ willChange: 'transform' }}
                ref={el => {
                    if (!el) return;
                    const move = (e) => {
                        el.style.transform = `translate(${e.clientX - 5}px, ${e.clientY - 5}px)`;
                    };
                    window.addEventListener('mousemove', move, { passive: true });
                }}
            />
            <div
                className="cursor-ring"
                ref={el => {
                    if (!el) return;
                    const move = (e) => {
                        el.style.transform = `translate(${e.clientX - 16}px, ${e.clientY - 16}px)`;
                    };
                    window.addEventListener('mousemove', move, { passive: true });
                }}
            />
        </>
    );
}
