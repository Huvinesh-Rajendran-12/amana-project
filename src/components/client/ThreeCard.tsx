"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";

// Warm cream/slate color for text (30% whiter)
const CREAM_COLOR = "#efece4";
const CARD_BG = "#1a1a1a"; // Dark background

// Draw arrow pattern helper
function drawArrowPattern(ctx: CanvasRenderingContext2D, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  const arrowSpacingX = 60;
  const arrowSpacingY = 45;
  const arrowSize = 12;

  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 20; col++) {
      const x = col * arrowSpacingX + (row % 2) * (arrowSpacingX / 2) + 20;
      const y = row * arrowSpacingY + 30;

      ctx.beginPath();
      ctx.moveTo(x - arrowSize, y - arrowSize);
      ctx.lineTo(x, y);
      ctx.lineTo(x - arrowSize, y + arrowSize);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// Draw EMV chip helper
function drawChip(ctx: CanvasRenderingContext2D) {
  const chipX = 50;
  const chipY = 180;
  const chipW = 55;
  const chipH = 45;

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

  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(chipX, chipY + chipH / 2);
  ctx.lineTo(chipX + chipW, chipY + chipH / 2);
  ctx.moveTo(chipX + chipW / 2, chipY);
  ctx.lineTo(chipX + chipW / 2, chipY + chipH);
  ctx.stroke();

  return { chipX, chipY, chipW, chipH };
}

// Islamic side card texture (gold theme, Malay name)
function createIslamicCardTexture(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 645;
  const ctx = canvas.getContext("2d")!;

  // Dark background
  ctx.fillStyle = CARD_BG;
  ctx.fillRect(0, 0, 1024, 645);

  // Arrow pattern - gold tinted
  drawArrowPattern(ctx, "rgba(212, 175, 55, 0.12)");

  // Top accent line - gold gradient
  const accentGrad = ctx.createLinearGradient(0, 0, 1024, 0);
  accentGrad.addColorStop(0, "#d4af37");
  accentGrad.addColorStop(0.5, "#f5e7a3");
  accentGrad.addColorStop(1, "#c9a227");
  ctx.fillStyle = accentGrad;
  ctx.fillRect(0, 0, 1024, 5);

  // Brand logo area (top right) - crescent moon
  ctx.fillStyle = "#d4af37";
  ctx.font = "400 32px Outfit, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("☪", 950, 60);

  // Brand name - BARAKAH
  ctx.font = "300 38px Outfit, sans-serif";
  ctx.fillStyle = CREAM_COLOR;
  ctx.textAlign = "left";
  ctx.fillText("AMANA", 50, 65);

  // Tagline
  ctx.font = "200 14px Outfit, sans-serif";
  ctx.fillStyle = "rgba(239, 236, 228, 0.5)";
  ctx.fillText("Shariah Compliant Banking", 50, 90);

  // EMV Chip
  const { chipY, chipH } = drawChip(ctx);

  // Contactless symbol - gold
  ctx.strokeStyle = "rgba(212, 175, 55, 0.6)";
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

  // Cardholder name - Malay name
  ctx.font = "400 26px Outfit, sans-serif";
  ctx.fillStyle = CREAM_COLOR;
  ctx.fillText("AHMAD IBRAHIM", 50, 560);


  // Mastercard logo - original red/orange
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(915, 560, 28, 0, Math.PI * 2);
  ctx.fillStyle = "#eb001b"; // Mastercard red
  ctx.fill();
  ctx.beginPath();
  ctx.arc(955, 560, 28, 0, Math.PI * 2);
  ctx.fillStyle = "#f79e1b"; // Mastercard orange/yellow
  ctx.fill();
  ctx.globalAlpha = 1.0;

  return canvas;
}

// Conventional side card texture (purple theme, Chinese name)
function createConventionalCardTexture(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 645;
  const ctx = canvas.getContext("2d")!;

  // Dark background
  ctx.fillStyle = CARD_BG;
  ctx.fillRect(0, 0, 1024, 645);

  // Arrow pattern - purple tinted
  drawArrowPattern(ctx, "rgba(139, 92, 246, 0.12)");

  // Top accent line - purple gradient
  const accentGrad = ctx.createLinearGradient(0, 0, 1024, 0);
  accentGrad.addColorStop(0, "#8b5cf6");
  accentGrad.addColorStop(0.5, "#a78bfa");
  accentGrad.addColorStop(1, "#7c3aed");
  ctx.fillStyle = accentGrad;
  ctx.fillRect(0, 0, 1024, 5);

  // Brand logo area (top right) - sparkle icon
  ctx.fillStyle = "#a78bfa";
  ctx.font = "400 32px Outfit, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("◆", 950, 60);

  // Brand name - AMANA
  ctx.font = "300 38px Outfit, sans-serif";
  ctx.fillStyle = CREAM_COLOR;
  ctx.textAlign = "left";
  ctx.fillText("AMANA", 50, 65);

  // Tagline
  ctx.font = "200 14px Outfit, sans-serif";
  ctx.fillStyle = "rgba(239, 236, 228, 0.5)";
  ctx.fillText("Smart Banking Solutions", 50, 90);

  // EMV Chip
  const { chipY, chipH } = drawChip(ctx);

  // Contactless symbol - purple
  ctx.strokeStyle = "rgba(139, 92, 246, 0.6)";
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

  // Cardholder name - Chinese name
  ctx.font = "400 26px Outfit, sans-serif";
  ctx.fillStyle = CREAM_COLOR;
  ctx.fillText("CHEN WEI MING", 50, 560);

  // Premium badge
  ctx.font = "300 14px Outfit, sans-serif";
  ctx.fillStyle = "rgba(139, 92, 246, 0.8)";
  ctx.textAlign = "center";
  ctx.fillText("✦ PREMIUM MEMBER", 512, 600);

  // Mastercard logo - original red/orange
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(915, 560, 28, 0, Math.PI * 2);
  ctx.fillStyle = "#eb001b"; // Mastercard red
  ctx.fill();
  ctx.beginPath();
  ctx.arc(955, 560, 28, 0, Math.PI * 2);
  ctx.fillStyle = "#f79e1b"; // Mastercard orange/yellow
  ctx.fill();
  ctx.globalAlpha = 1.0;

  return canvas;
}

function CardMesh() {
  const meshRef = useRef<THREE.Group>(null);
  const [frontTexture, setFrontTexture] = useState<THREE.CanvasTexture | null>(
    null
  );
  const [backTexture, setBackTexture] = useState<THREE.CanvasTexture | null>(
    null
  );

  useEffect(() => {
    // Wait for fonts to load before creating texture
    const createTextureAfterFonts = async () => {
      try {
        await document.fonts.ready;
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch {
        // Fallback if fonts API not available
      }

      // Front side - Islamic (Barakah)
      const islamicCanvas = createIslamicCardTexture();
      const islamicTex = new THREE.CanvasTexture(islamicCanvas);
      islamicTex.needsUpdate = true;
      islamicTex.minFilter = THREE.LinearFilter;
      islamicTex.magFilter = THREE.LinearFilter;
      setFrontTexture(islamicTex);

      // Back side - Conventional (Amana)
      const conventionalCanvas = createConventionalCardTexture();
      const conventionalTex = new THREE.CanvasTexture(conventionalCanvas);
      conventionalTex.needsUpdate = true;
      conventionalTex.minFilter = THREE.LinearFilter;
      conventionalTex.magFilter = THREE.LinearFilter;
      setBackTexture(conventionalTex);
    };

    createTextureAfterFonts();
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;

    // Slow rotation with 25 degree tilt
    meshRef.current.rotation.x = Math.PI * 0.04; // 25 degree tilt
    meshRef.current.rotation.y = Math.PI * 0.15 + time * 0.15;

    // Float
    meshRef.current.position.y = Math.sin(time * 0.5) * 0.04;
  });

  // Card dimensions - 20% larger than original
  const cardWidth = 4.078;
  const cardHeight = 2.565;

  if (!frontTexture || !backTexture) {
    return null;
  }

  return (
    <group ref={meshRef}>
      {/* Front face - Islamic (Barakah) */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[cardWidth, cardHeight]} />
        <meshStandardMaterial
          map={frontTexture}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Back face - Conventional (Amana) */}
      <mesh position={[0, 0, -0.001]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[cardWidth, cardHeight]} />
        <meshStandardMaterial
          map={backTexture}
          metalness={0.1}
          roughness={0.8}
        />
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
