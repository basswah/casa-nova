import { supabase } from '@/lib/supabase';

const BUCKET = 'product-images';

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'png';
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false });

  if (uploadError) {
    throw new Error(`Image upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  if (!data.publicUrl) {
    throw new Error('Failed to get public URL for uploaded image');
  }

  return data.publicUrl;
}
