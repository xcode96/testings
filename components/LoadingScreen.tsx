import React, { useRef, useEffect } from 'react';

const LoadingScreen: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const fontSize = 16;
        const columns = canvas.width / fontSize;
        const drops: number[] = [];

        for (let x = 0; x < columns; x++) {
            drops[x] = 1;
        }

        const chars = "192.168.0.1 10.0.0.1 172.16.0.1 255.255.255.0 TCP UDP HTTP FTP SSH 21 22 23 80 443 8080 SYN ACK FIN RST PSH URG".split(" ");

        const draw = () => {
            ctx.fillStyle = 'rgba(10, 25, 47, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#00ff41';
            ctx.font = `${fontSize}px Fira Code, monospace`;
            
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                
                drops[i]++;
            }
        };
        
        const animate = () => {
            draw();
            animationFrameId = window.requestAnimationFrame(animate);
        }
        
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.cancelAnimationFrame(animationFrameId);
        }

    }, []);

    return (
        <div className="relative h-screen w-full overflow-hidden bg-slate-900">
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0"></canvas>
        </div>
    );
};

export default LoadingScreen;