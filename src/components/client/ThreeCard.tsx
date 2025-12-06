"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

// Warm cream/slate color for text (30% whiter)
const CREAM_COLOR = "#efece4";
const CREAM_LIGHT = "#f5f3ed";
const CARD_BG = "#222222"; // Slightly darker grey

// Card texture creation with chevron pattern
function createCardTexture(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 645;
  const ctx = canvas.getContext("2d")!;

  // Dark grey background
  ctx.fillStyle = CARD_BG;
  ctx.fillRect(0, 0, 1024, 645);

  // Draw chevron/arrow pattern (like reference image)
  ctx.save();
  const chevronSize = 24;
  const spacing = 45;
  ctx.strokeStyle = "rgba(239, 236, 228, 0.05)";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 30; col++) {
      const x = col * spacing + (row % 2) * (spacing / 2);
      const y = row * spacing + 30;

      // Draw chevron (^)
      ctx.beginPath();
      ctx.moveTo(x - chevronSize / 2, y + chevronSize / 3);
      ctx.lineTo(x, y - chevronSize / 3);
      ctx.lineTo(x + chevronSize / 2, y + chevronSize / 3);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Top accent line - gradient
  const accentGrad = ctx.createLinearGradient(0, 0, 1024, 0);
  accentGrad.addColorStop(0, "#8b5cf6");
  accentGrad.addColorStop(0.5, "#a78bfa");
  accentGrad.addColorStop(1, "#06b6d4");
  ctx.fillStyle = accentGrad;
  ctx.fillRect(0, 0, 1024, 5);

  // Brand logo area (top right) - simple asterisk/star mark
  ctx.fillStyle = CREAM_LIGHT;
  ctx.font = "400 36px Outfit, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("✳", 950, 60);

  // Brand name - SENTIENCE (top left) - lighter weight
  ctx.font = "300 38px Outfit, sans-serif";
  ctx.fillStyle = CREAM_COLOR;
  ctx.textAlign = "left";
  ctx.fillText("SENTIENCE", 50, 65);

  // EMV Chip
  const chipX = 50;
  const chipY = 180;
  const chipW = 55;
  const chipH = 45;

  // Chip base - gold gradient
  const chipGrad = ctx.createLinearGradient(
    chipX,
    chipY,
    chipX + chipW,
    chipY + chipH
  );
  chipGrad.addColorStop(0, "#d4af37");
  chipGrad.addColorStop(0.3, "#f5e7a3");
  chipGrad.addColorStop(0.5, "#d4af37");
  chipGrad.addColorStop(0.7, "#f5e7a3");
  chipGrad.addColorStop(1, "#c9a227");

  ctx.beginPath();
  ctx.roundRect(chipX, chipY, chipW, chipH, 5);
  ctx.fillStyle = chipGrad;
  ctx.fill();

  // Chip details
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(chipX, chipY + chipH / 2);
  ctx.lineTo(chipX + chipW, chipY + chipH / 2);
  ctx.moveTo(chipX + chipW / 2, chipY);
  ctx.lineTo(chipX + chipW / 2, chipY + chipH);
  ctx.stroke();

  // Contactless symbol
  ctx.strokeStyle = "rgba(239, 236, 228, 0.6)";
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(140, chipY + chipH / 2, 8 + i * 8, -0.7, 0.7);
    ctx.stroke();
  }

  // Card Number
  ctx.font = '400 44px "JetBrains Mono", monospace';
  ctx.fillStyle = CREAM_COLOR;
  ctx.textAlign = "left";
  ctx.fillText("5842 3719 0024 8842", 50, 380);

  // Valid thru label
  ctx.font = "300 12px Outfit, sans-serif";
  ctx.fillStyle = "rgba(239, 236, 228, 0.5)";
  ctx.fillText("VALID THRU", 50, 450);

  // Expiry
  ctx.font = "400 22px Outfit, sans-serif";
  ctx.fillStyle = CREAM_COLOR;
  ctx.fillText("12/28", 50, 480);

  // Cardholder name
  ctx.font = "400 26px Outfit, sans-serif";
  ctx.fillStyle = CREAM_COLOR;
  ctx.fillText("ALEXANDER VAULT", 50, 560);

  // Network logo - two overlapping circles
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(920, 560, 28, 0, Math.PI * 2);
  ctx.fillStyle = "#eb001b";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(955, 560, 28, 0, Math.PI * 2);
  ctx.fillStyle = "#f79e1b";
  ctx.fill();
  ctx.globalAlpha = 1.0;

  return canvas;
}

function CardMesh() {
  const meshRef = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    // Wait for fonts to load before creating texture
    const createTextureAfterFonts = async () => {
      try {
        await document.fonts.ready;
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch {
        // Fallback if fonts API not available
      }

      const frontCanvas = createCardTexture();
      const frontTex = new THREE.CanvasTexture(frontCanvas);
      frontTex.needsUpdate = true;
      frontTex.minFilter = THREE.LinearFilter;
      frontTex.magFilter = THREE.LinearFilter;
      setTexture(frontTex);
    };

    createTextureAfterFonts();
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;

    // Slow rotation
    meshRef.current.rotation.x = Math.PI * 0.08;
    meshRef.current.rotation.y = Math.PI * 0.15 + time * 0.15;

    // Float
    meshRef.current.position.y = Math.sin(time * 0.5) * 0.04;
  });

  // Card dimensions - 10% larger
  const cardWidth = 3.707;
  const cardHeight = 2.332;

  if (!texture) {
    return null;
  }

  return (
    <group ref={meshRef}>
      {/* Front face */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[cardWidth, cardHeight]} />
        <meshStandardMaterial map={texture} metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Back face */}
      <mesh position={[0, 0, -0.001]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[cardWidth, cardHeight]} />
        <meshStandardMaterial map={texture} metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Subtle edge glow/rim */}
      <mesh>
        <planeGeometry args={[cardWidth + 0.02, cardHeight + 0.02]} />
        <meshBasicMaterial color="#333333" />
      </mesh>
    </group>
  );
}

export default function ThreeCard() {
  return (
    <div className="w-full h-[400px]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
        }}
      >
        {/* Ambient light */}
        <ambientLight intensity={1.5} />

        {/* Key light for subtle reflection */}
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        <directionalLight position={[-5, -5, 5]} intensity={0.3} />

        <CardMesh />

        {/* Shadow underneath */}
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.4}
          scale={6}
          blur={2.5}
          far={3}
        />
      </Canvas>
    </div>
  );
}
