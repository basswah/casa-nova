import { supabase } from '@/lib/supabase';

const BUCKET = 'product-images';
const MAX_DIMENSION = 1200;
const QUALITY = 0.8;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function compressImage(file: File): Promise<{ blob: Blob; ext: string; mime: string }> {
  const img = await loadImage(file);

  let { width, height } = img;
  const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height, 1);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(img, 0, 0, width, height);

  // Try WebP first
  const webpBlob = await canvasToBlob(canvas, 'image/webp', QUALITY);
  if (webpBlob && webpBlob.type === 'image/webp') {
    return { blob: webpBlob, ext: 'webp', mime: 'image/webp' };
  }

  // Fallback to JPEG
  const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', QUALITY);
  if (jpegBlob) {
    return { blob: jpegBlob, ext: 'jpg', mime: 'image/jpeg' };
  }

  throw new Error('Image compression failed');
}

export async function uploadProductImage(file: File): Promise<string> {
  const { blob, ext, mime } = await compressImage(file);
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, {
      upsert: false,
      contentType: mime,
    });

  if (uploadError) {
    throw new Error(`Image upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  if (!data.publicUrl) {
    throw new Error('Failed to get public URL for uploaded image');
  }

  return data.publicUrl;
}
