"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";

// Warm cream/slate color for text (30% whiter)
const CREAM_COLOR = "#efece4";
const CREAM_LIGHT = "#f5f3ed";
const CARD_BG = "#1a1a1a"; // Darker background for Islamic aesthetic

// Card texture creation with Islamic geometric pattern
function createCardTexture(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 645;
  const ctx = canvas.getContext("2d")!;

  // Dark background
  ctx.fillStyle = CARD_BG;
  ctx.fillRect(0, 0, 1024, 645);

  // Draw Islamic geometric pattern (8-pointed stars / octagonal pattern)
  ctx.save();
  ctx.strokeStyle = "rgba(16, 185, 129, 0.08)"; // Emerald green - Islamic color
  ctx.lineWidth = 1.5;

  const patternSize = 50;
  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 25; col++) {
      const x = col * patternSize + (row % 2) * (patternSize / 2);
      const y = row * patternSize + 20;

      // Draw 8-pointed star pattern
      ctx.beginPath();
      const points = 8;
      const outerRadius = 18;
      const innerRadius = 9;

      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const px = x + radius * Math.cos(angle);
        const py = y + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.restore();

  // Top accent line - emerald gradient (Islamic green)
  const accentGrad = ctx.createLinearGradient(0, 0, 1024, 0);
  accentGrad.addColorStop(0, "#10b981");
  accentGrad.addColorStop(0.5, "#34d399");
  accentGrad.addColorStop(1, "#06b6d4");
  ctx.fillStyle = accentGrad;
  ctx.fillRect(0, 0, 1024, 5);

  // Brand logo area (top right) - crescent moon and star
  ctx.fillStyle = CREAM_LIGHT;
  ctx.font = "400 32px Outfit, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("☪", 950, 60);

  // Brand name - BARAKAH (top left)
  ctx.font = "300 38px Outfit, sans-serif";
  ctx.fillStyle = CREAM_COLOR;
  ctx.textAlign = "left";
  ctx.fillText("BARAKAH", 50, 65);

  // Tagline below brand
  ctx.font = "200 14px Outfit, sans-serif";
  ctx.fillStyle = "rgba(239, 236, 228, 0.5)";
  ctx.fillText("Shariah Compliant Banking", 50, 90);

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
  ctx.strokeStyle = "rgba(16, 185, 129, 0.6)"; // Emerald color
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

  // Cardholder name - Islamic name
  ctx.font = "400 26px Outfit, sans-serif";
  ctx.fillStyle = CREAM_COLOR;
  ctx.fillText("AHMAD IBRAHIM", 50, 560);

  // Halal indicator badge (bottom middle)
  ctx.font = "300 14px Outfit, sans-serif";
  ctx.fillStyle = "rgba(16, 185, 129, 0.8)";
  ctx.textAlign = "center";
  ctx.fillText("✓ HALAL CERTIFIED", 512, 600);

  // Network logo - two overlapping circles
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(920, 560, 28, 0, Math.PI * 2);
  ctx.fillStyle = "#10b981";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(955, 560, 28, 0, Math.PI * 2);
  ctx.fillStyle = "#06b6d4";
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
