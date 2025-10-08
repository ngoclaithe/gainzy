const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

function ensureConfig() {
  if (!CLOUD_NAME) throw new Error('Missing VITE_CLOUDINARY_CLOUD_NAME');
  if (!UPLOAD_PRESET) throw new Error('Missing VITE_CLOUDINARY_UPLOAD_PRESET (must be an unsigned preset)');
}

export async function uploadImage(file) {
  ensureConfig();
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);
  const res = await fetch(url, { method: 'POST', body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || data.message || 'Upload failed');
  return data.secure_url || data.url || '';
}

export async function uploadImages(files) {
  const arr = Array.from(files);
  const uploads = arr.map((f) => uploadImage(f));
  return Promise.all(uploads);
}
