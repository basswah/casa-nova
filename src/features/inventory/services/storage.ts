import { supabase } from '@/lib/supabase';

const BUCKET = 'product-images';
const MAX_DIMENSION = 1200;
const WEBP_QUALITY = 0.8;

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

async function compressImage(file: File): Promise<Blob> {
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

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          // WebP fallback to JPEG
          canvas.toBlob(
            (jpegBlob) => {
              if (jpegBlob) resolve(jpegBlob);
              else reject(new Error('Image compression failed'));
            },
            'image/jpeg',
            WEBP_QUALITY,
          );
          return;
        }
        resolve(blob);
      },
      'image/webp',
      WEBP_QUALITY,
    );
  });
}

export async function uploadProductImage(file: File): Promise<string> {
  const compressed = await compressImage(file);
  const path = `${crypto.randomUUID()}.webp`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, compressed, {
      upsert: false,
      contentType: 'image/webp',
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
