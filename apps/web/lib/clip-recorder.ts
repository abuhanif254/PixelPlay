/**
 * Clutch Moment Screen Recorder & High-Score Watermark Clip Generator for Spielcade
 */

export interface SnapshotOptions {
  gameTitle: string;
  category?: string;
  score?: number;
  username?: string;
  level?: number;
  gameImageUrl?: string;
  canvasElement?: HTMLCanvasElement | null;
}

export async function generateTradingCardSnapshot(options: SnapshotOptions): Promise<string> {
  if (typeof window === 'undefined') return '';

  const width = 1200;
  const height = 675; // 16:9 ratio

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Dark Cyberpunk Backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0A0B1A');
  bgGrad.addColorStop(0.5, '#121430');
  bgGrad.addColorStop(1, '#060712');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Neon Ambient Glows
  const glow1 = ctx.createRadialGradient(200, 200, 20, 200, 200, 450);
  glow1.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
  glow1.addColorStop(1, 'rgba(99, 102, 241, 0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, width, height);

  const glow2 = ctx.createRadialGradient(1000, 500, 20, 1000, 500, 450);
  glow2.addColorStop(0, 'rgba(244, 63, 94, 0.2)');
  glow2.addColorStop(1, 'rgba(244, 63, 94, 0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, width, height);

  // 3. Draw Game Image or Canvas Frame
  let drawnImage = false;
  if (options.canvasElement) {
    try {
      ctx.drawImage(options.canvasElement, 60, 90, 1080, 450);
      drawnImage = true;
    } catch {
      // CORS tainted canvas fallback
    }
  }

  if (!drawnImage && options.gameImageUrl) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = options.gameImageUrl!;
      });
      // Draw centered image
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(60, 90, 1080, 450, 20);
      ctx.clip();
      ctx.drawImage(img, 60, 90, 1080, 450);
      ctx.restore();
      drawnImage = true;
    } catch {
      // Image load failed, use stylish geometric fallback
    }
  }

  if (!drawnImage) {
    // Stylized geometric visual
    const patternGrad = ctx.createLinearGradient(60, 90, 1140, 540);
    patternGrad.addColorStop(0, '#1B1E4B');
    patternGrad.addColorStop(1, '#0C0D20');
    ctx.fillStyle = patternGrad;
    ctx.beginPath();
    ctx.roundRect(60, 90, 1080, 450, 20);
    ctx.fill();

    ctx.fillStyle = '#6366F1';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎮 CLUTCH MOMENT', width / 2, 330);
  }

  // 4. Inner Card Vignette & Glass Shading
  const cardShade = ctx.createLinearGradient(0, 90, 0, 540);
  cardShade.addColorStop(0, 'rgba(0,0,0,0.2)');
  cardShade.addColorStop(0.7, 'rgba(0,0,0,0.5)');
  cardShade.addColorStop(1, 'rgba(5, 6, 15, 0.95)');
  ctx.fillStyle = cardShade;
  ctx.beginPath();
  ctx.roundRect(60, 90, 1080, 450, 20);
  ctx.fill();

  // 5. Holographic Border
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(60, 90, 1080, 450, 20);
  ctx.stroke();

  // 6. Header Branding (Top Bar)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('SPIELCADE', 60, 55);

  ctx.fillStyle = '#6366F1';
  ctx.fillText('★ CLUTCH HIGHLIGHT', 225, 55);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 1140, 55);

  // 7. Title & Category Overlay (Inside Card Bottom-Left)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 44px sans-serif';
  ctx.fillText(options.gameTitle, 90, 470);

  if (options.category) {
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(options.category.toUpperCase(), 90, 510);
  }

  // 8. High Score Pill Badge (Inside Card Bottom-Right)
  if (options.score !== undefined && options.score > 0) {
    const scoreText = `🏆 ${options.score.toLocaleString()} PTS`;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#F59E0B';
    ctx.font = '900 42px sans-serif';
    ctx.fillText(scoreText, 1110, 475);

    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('VERIFIED ARCADE RUN', 1110, 510);
  }

  // 9. Footer Player Credentials
  ctx.textAlign = 'left';
  ctx.fillStyle = '#E2E8F0';
  ctx.font = 'bold 20px sans-serif';
  const playerTag = options.username ? `@${options.username}` : 'Spielcade Champion';
  const lvlTag = options.level ? ` • Level ${options.level}` : '';
  ctx.fillText(`Player: ${playerTag}${lvlTag}`, 60, 620);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#818CF8';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('spielcade.com/play', 1140, 620);

  return canvas.toDataURL('image/png', 0.95);
}

export async function copyDataUrlToClipboard(dataUrl: string): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.clipboard) return false;
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  if (typeof window === 'undefined') return;
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
