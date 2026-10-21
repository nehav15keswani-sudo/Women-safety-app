// Client-Side Video Capture & Offline Download Utility
// Uses HTML5 Canvas captureStream and MediaRecorder to generate offline video files (.webm)

import { renderDefenseFrame, AnimatedTechnique } from './animatedDefenseEngine';

export async function recordAndDownloadTechniqueVideo(
  technique: AnimatedTechnique,
  width: number = 640,
  height: number = 480,
  onProgress?: (progressPercent: number) => void
): Promise<void> {
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = width;
  offscreenCanvas.height = height;
  const ctx = offscreenCanvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Check if MediaRecorder is supported
  const isMediaRecorderSupported =
    typeof MediaRecorder !== 'undefined' &&
    typeof (offscreenCanvas as unknown as { captureStream?: (fps?: number) => MediaStream }).captureStream === 'function';

  if (!isMediaRecorderSupported) {
    // Fallback: Download Standalone Interactive Offline HTML5 Video Player
    downloadStandaloneHtmlPackage(technique);
    return;
  }

  const stream = (offscreenCanvas as unknown as { captureStream: (fps: number) => MediaStream }).captureStream(30);
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : MediaRecorder.isTypeSupported('video/webm')
    ? 'video/webm'
    : 'video/mp4';

  const recorder = new MediaRecorder(stream, { mimeType });
  const recordedChunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  const recordingPromise = new Promise<void>((resolve, reject) => {
    recorder.onstop = () => {
      try {
        const videoBlob = new Blob(recordedChunks, { type: mimeType });
        const downloadUrl = URL.createObjectURL(videoBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
        a.download = `Aegis_Defense_${technique.id}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
        resolve();
      } catch (err) {
        reject(err);
      }
    };
  });

  recorder.start();

  // Render 1 complete animation cycle over durationSec seconds (at 30 fps)
  const fps = 30;
  const totalFrames = Math.round(technique.durationSec * fps);
  let frame = 0;

  const intervalTime = 1000 / fps;

  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      frame++;
      const progress = (frame % totalFrames) / totalFrames;
      renderDefenseFrame(ctx, technique.id, progress, width, height, true);

      if (onProgress) {
        onProgress(Math.min(100, Math.round((frame / totalFrames) * 100)));
      }

      if (frame >= totalFrames) {
        clearInterval(timer);
        recorder.stop();
        recordingPromise.then(resolve).catch(reject);
      }
    }, intervalTime);
  });
}

// Download High-Resolution Visual Flashcard (PNG)
export function downloadTechniqueCardPng(
  technique: AnimatedTechnique,
  width: number = 800,
  height: number = 600
): void {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Render key impact frame (at 55% progress)
  renderDefenseFrame(ctx, technique.id, 0.55, width, height, true);

  // Add Card Header
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.fillRect(0, 0, width, 80);
  ctx.fillStyle = '#f43f5e';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(technique.title, 24, 38);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px sans-serif';
  ctx.fillText(`Target: ${technique.targetPoint} · Rule: ${technique.keyRule}`, 24, 62);

  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `Aegis_Card_${technique.id}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Standalone self-contained HTML offline runner
function downloadStandaloneHtmlPackage(technique: AnimatedTechnique) {
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Aegis - ${technique.title}</title>
  <style>
    body { background: #0f172a; color: white; font-family: sans-serif; text-align: center; margin: 0; padding: 20px; }
    h1 { color: #f43f5e; font-size: 20px; margin-bottom: 4px; }
    p { color: #94a3b8; font-size: 13px; max-width: 600px; margin: 0 auto 16px; }
    canvas { background: #020617; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); max-width: 100%; }
    .badge { background: #e11d48; color: white; padding: 4px 12px; border-radius: 999px; font-weight: bold; font-size: 11px; display: inline-block; }
  </style>
</head>
<body>
  <div class="badge">OFFLINE EMERGENCY ANIMATION</div>
  <h1>${technique.title}</h1>
  <p>${technique.keyRule}</p>
  <canvas id="c" width="600" height="400"></canvas>
  <script>
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');
    let p = 0;
    function loop() {
      p = (p + 0.005) % 1;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0,0,600,400);
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('${technique.techniqueName}', 20, 30);
      ctx.fillText('Target: ${technique.targetPoint}', 20, 60);
      ctx.beginPath();
      ctx.arc(300 + Math.sin(p * Math.PI * 2) * 40, 200, 30, 0, Math.PI * 2);
      ctx.fillStyle = '#e11d48';
      ctx.fill();
      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Aegis_Offline_${technique.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
