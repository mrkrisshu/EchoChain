'use client';

import { useEffect, useRef } from 'react';

interface HeroProps {
  title: string;
  description: string;
  links: { name: string; href: string }[];
}

export function VoidHero({ title, description, links }: HeroProps) {
  const cubeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationId: number;
    let rotation = { x: -25, y: -35 };

    const animate = () => {
      rotation.y += 0.15;
      if (cubeRef.current) {
        cubeRef.current.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;
      }
      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Mouse parallax
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      rotation.x = -25 + y;
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationId);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="void-hero">
      {/* Navigation */}
      <nav className="void-nav">
        {links.map((link) => (
          <a key={link.name} href={link.href} className="void-nav-link">
            {link.name}
          </a>
        ))}
      </nav>

      {/* 3D Cube Scene */}
      <div className="void-scene">
        <div className="void-cube" ref={cubeRef}>
          {/* Front face */}
          <div className="cube-face front">
            <div className="face-cutout"></div>
          </div>
          {/* Back face */}
          <div className="cube-face back">
            <div className="face-cutout"></div>
          </div>
          {/* Left face */}
          <div className="cube-face left">
            <div className="face-cutout"></div>
          </div>
          {/* Right face */}
          <div className="cube-face right">
            <div className="face-cutout"></div>
          </div>
          {/* Top face */}
          <div className="cube-face top">
            <div className="face-cutout"></div>
          </div>
          {/* Bottom face */}
          <div className="cube-face bottom">
            <div className="face-cutout"></div>
          </div>

          {/* Inner glow */}
          <div className="inner-glow"></div>
        </div>

        {/* Ambient glow behind cube */}
        <div className="ambient-glow"></div>
      </div>

      {/* Content at bottom */}
      <div className="void-content">
        <h1 className="void-title">{title}</h1>
        <p className="void-description">{description}</p>
      </div>

      <style jsx>{`
        .void-hero {
          position: relative;
          width: 100%;
          height: 100vh;
          background: linear-gradient(180deg, #0d0d12 0%, #0a0a0f 50%, #080810 100%);
          overflow: hidden;
        }

        .void-nav {
          position: absolute;
          top: 32px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 48px;
          z-index: 100;
        }

        .void-nav-link {
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 2px;
          text-decoration: none;
          text-transform: uppercase;
          transition: color 0.3s ease;
        }

        .void-nav-link:hover {
          color: white;
        }

        .void-scene {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -55%);
          width: 250px;
          height: 250px;
          perspective: 800px;
        }

        .void-cube {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transform: rotateX(-25deg) rotateY(-35deg);
        }

        .cube-face {
          position: absolute;
          width: 200px;
          height: 200px;
          left: 25px;
          top: 25px;
          background: linear-gradient(145deg, #1a1a22 0%, #12121a 50%, #0a0a10 100%);
          border: 1px solid rgba(60, 60, 80, 0.3);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }

        .cube-face.front { transform: translateZ(100px); }
        .cube-face.back { transform: rotateY(180deg) translateZ(100px); }
        .cube-face.left { transform: rotateY(-90deg) translateZ(100px); }
        .cube-face.right { transform: rotateY(90deg) translateZ(100px); }
        .cube-face.top { transform: rotateX(90deg) translateZ(100px); }
        .cube-face.bottom { transform: rotateX(-90deg) translateZ(100px); }

        /* Eye-shaped glowing cutout */
        .face-cutout {
          width: 100px;
          height: 50px;
          background: radial-gradient(ellipse at center, 
            rgba(255, 255, 255, 1) 0%,
            rgba(255, 255, 255, 0.9) 30%,
            rgba(230, 230, 255, 0.7) 60%,
            rgba(200, 200, 230, 0.3) 80%,
            transparent 100%
          );
          border-radius: 50%;
          box-shadow: 
            0 0 30px 15px rgba(255, 255, 255, 0.6),
            0 0 60px 30px rgba(255, 255, 255, 0.3),
            0 0 100px 50px rgba(200, 200, 255, 0.15),
            inset 0 0 20px rgba(255, 255, 255, 0.5);
          animation: pulse-cutout 3s ease-in-out infinite;
        }

        @keyframes pulse-cutout {
          0%, 100% { 
            opacity: 0.9;
            box-shadow: 
              0 0 30px 15px rgba(255, 255, 255, 0.6),
              0 0 60px 30px rgba(255, 255, 255, 0.3),
              0 0 100px 50px rgba(200, 200, 255, 0.15);
          }
          50% { 
            opacity: 1;
            box-shadow: 
              0 0 40px 20px rgba(255, 255, 255, 0.7),
              0 0 80px 40px rgba(255, 255, 255, 0.4),
              0 0 120px 60px rgba(200, 200, 255, 0.2);
          }
        }

        /* Inner glow source */
        .inner-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, 
            rgba(255, 255, 255, 0.8) 0%,
            rgba(255, 255, 255, 0.4) 40%,
            transparent 70%
          );
          border-radius: 50%;
          filter: blur(10px);
        }

        /* Ambient glow behind cube */
        .ambient-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, 
            rgba(255, 255, 255, 0.08) 0%,
            rgba(200, 200, 255, 0.04) 40%,
            transparent 70%
          );
          pointer-events: none;
          z-index: -1;
        }

        /* Content */
        .void-content {
          position: absolute;
          bottom: 10%;
          left: 0;
          right: 0;
          padding: 0 48px;
          max-width: 500px;
        }

        .void-title {
          font-size: 26px;
          font-weight: 300;
          color: white;
          margin-bottom: 16px;
          letter-spacing: -0.5px;
        }

        .void-description {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.45);
          line-height: 1.8;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
        }

        @media (max-width: 768px) {
          .void-nav {
            gap: 24px;
          }
          
          .void-nav-link {
            font-size: 10px;
          }

          .void-scene {
            width: 180px;
            height: 180px;
          }

          .cube-face {
            width: 140px;
            height: 140px;
            left: 20px;
            top: 20px;
          }

          .cube-face.front { transform: translateZ(70px); }
          .cube-face.back { transform: rotateY(180deg) translateZ(70px); }
          .cube-face.left { transform: rotateY(-90deg) translateZ(70px); }
          .cube-face.right { transform: rotateY(90deg) translateZ(70px); }
          .cube-face.top { transform: rotateX(90deg) translateZ(70px); }
          .cube-face.bottom { transform: rotateX(-90deg) translateZ(70px); }

          .face-cutout {
            width: 70px;
            height: 35px;
          }

          .void-content {
            padding: 0 24px;
          }

          .void-title {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}
