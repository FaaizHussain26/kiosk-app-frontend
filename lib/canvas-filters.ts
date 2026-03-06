/**
 * Applies image filters directly to canvas pixel data.
 *
 * Safari/WebKit doesn't support ctx.filter on canvas, and its print engine
 * doesn't reliably render CSS filter either. This module manually manipulates
 * pixels via getImageData/putImageData so filters are baked into the image
 * and print correctly on every browser.
 */

type FilterType = "original" | "warm" | "cool" | "pastel" | "mono" | "sepia";

function clamp(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

function applyBrightness(data: Uint8ClampedArray, amount: number) {
  const factor = amount / 100;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] * factor);
    data[i + 1] = clamp(data[i + 1] * factor);
    data[i + 2] = clamp(data[i + 2] * factor);
  }
}

function applyContrast(data: Uint8ClampedArray, amount: number) {
  const factor = (259 * (amount + 255)) / (255 * (259 - amount));
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(factor * (data[i] - 128) + 128);
    data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128);
    data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128);
  }
}

function applySaturate(data: Uint8ClampedArray, amount: number) {
  const s = amount / 100;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    data[i] = clamp(gray + s * (r - gray));
    data[i + 1] = clamp(gray + s * (g - gray));
    data[i + 2] = clamp(gray + s * (b - gray));
  }
}

function applyGrayscale(data: Uint8ClampedArray, amount: number) {
  const a = amount / 100;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    data[i] = clamp(r + a * (gray - r));
    data[i + 1] = clamp(g + a * (gray - g));
    data[i + 2] = clamp(b + a * (gray - b));
  }
}

function applySepia(data: Uint8ClampedArray, amount: number) {
  const a = amount / 100;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    const tr = 0.393 * r + 0.769 * g + 0.189 * b;
    const tg = 0.349 * r + 0.686 * g + 0.168 * b;
    const tb = 0.272 * r + 0.534 * g + 0.131 * b;
    data[i] = clamp(r + a * (tr - r));
    data[i + 1] = clamp(g + a * (tg - g));
    data[i + 2] = clamp(b + a * (tb - b));
  }
}

function applyHueRotate(data: Uint8ClampedArray, degrees: number) {
  const rad = (degrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    data[i] = clamp(
      r * (0.213 + cos * 0.787 - sin * 0.213) +
        g * (0.715 - cos * 0.715 - sin * 0.715) +
        b * (0.072 - cos * 0.072 + sin * 0.928),
    );
    data[i + 1] = clamp(
      r * (0.213 - cos * 0.213 + sin * 0.143) +
        g * (0.715 + cos * 0.285 + sin * 0.14) +
        b * (0.072 - cos * 0.072 - sin * 0.283),
    );
    data[i + 2] = clamp(
      r * (0.213 - cos * 0.213 - sin * 0.787) +
        g * (0.715 - cos * 0.715 + sin * 0.715) +
        b * (0.072 + cos * 0.928 + sin * 0.072),
    );
  }
}

/**
 * Draws the source image onto the canvas and applies the specified filter
 * and brightness at the pixel level. Works on every browser including Safari.
 */
export function drawFilteredImage(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  filter: FilterType,
  brightness: number,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imageData.data;

  // Apply the named filter
  switch (filter) {
    case "warm":
      applySepia(d, 20);
      applySaturate(d, 140);
      applyHueRotate(d, -10);
      break;
    case "cool":
      applySaturate(d, 90);
      applyHueRotate(d, 15);
      applyBrightness(d, 105);
      break;
    case "pastel":
      applySaturate(d, 70);
      applyBrightness(d, 110);
      applyContrast(d, -25); // ~90% contrast
      break;
    case "mono":
      applyGrayscale(d, 100);
      break;
    case "sepia":
      applySepia(d, 80);
      break;
    case "original":
    default:
      break;
  }

  // Apply brightness (100 = no change)
  if (brightness !== 100) {
    applyBrightness(d, brightness);
  }

  ctx.putImageData(imageData, 0, 0);
}
