import { useState, useEffect } from 'react';
import { uploadImages, getImageUrl, deleteImage } from '../api/images';
import { Btn } from './ui';

export default function ImageUploader({ eventId, images: initImages, isMobile }) {
  const [images, setImages] = useState(initImages || []);
  const [urls, setUrls] = useState({});
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    images.forEach(img => {
      if (!urls[img.id]) {
        getImageUrl(img.id).then(url => setUrls(u => ({ ...u, [img.id]: url }))).catch(() => {});
      }
    });
  }, [images]);

  const upload = async (files) => {
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append('file', f));
    const created = await uploadImages(eventId, fd);
    setImages(imgs => [...imgs, ...created]);
  };

  const remove = async (id) => {
    await deleteImage(id);
    setImages(imgs => imgs.filter(x => x.id !== id));
    setUrls(u => { const n = { ...u }; delete n[id]; return n; });
  };

  return (
    <div className="fu">
      <div
        style={{ border: `2px dashed ${dragging ? 'var(--amber)' : 'var(--border)'}`, borderRadius: 10, padding: isMobile ? 28 : 40, textAlign: 'center', marginBottom: 16, cursor: 'pointer', transition: 'border-color 150ms' }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files); }}
        onClick={() => document.getElementById('file-input').click()}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>↑</div>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Drop images or tap to upload</div>
        <div style={{ fontSize: 10, color: 'var(--muted)' }}>PNG, JPG · Stored in Cloudflare R2</div>
        <input id="file-input" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => upload(e.target.files)} />
      </div>
      {images.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 10 }}>
          {images.map(img => (
            <div key={img.id} style={{ aspectRatio: '4/3', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              {urls[img.id] ? (
                <img src={urls[img.id]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 9, color: 'var(--muted)' }}>Loading…</span>
              )}
              <button onClick={() => remove(img.id)} style={{ position: 'absolute', top: 5, right: 5, background: 'var(--danger)22', border: '1px solid var(--danger)44', color: 'var(--danger)', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: 10 }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
