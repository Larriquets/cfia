import React, { useEffect, useState } from 'react';

const LS_KEY = 'cfia_likes_v1';

function readLiked() {
  try { return new Set(JSON.parse(localStorage.getItem(LS_KEY) || '[]')); }
  catch { return new Set(); }
}
function writeLiked(set) {
  try { localStorage.setItem(LS_KEY, JSON.stringify([...set])); } catch {}
}

function LikeButton({ slug, initialLikes = 0, variant = 'compact', onChange }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialLikes);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLiked(readLiked().has(slug));
  }, [slug]);

  useEffect(() => { setCount(initialLikes); }, [initialLikes, slug]);

  const toggle = async (e) => {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const nextLiked = !liked;
    const delta = nextLiked ? 1 : -1;
    setLiked(nextLiked);
    setCount((c) => Math.max(0, c + delta));

    const set = readLiked();
    if (nextLiked) set.add(slug); else set.delete(slug);
    writeLiked(set);

    try {
      const r = await fetch(`/api/stories/${slug}/like`, {
        method: nextLiked ? 'POST' : 'DELETE',
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setCount(data.likes);
      onChange?.(data.likes);
    } catch {
      setLiked(!nextLiked);
      setCount((c) => Math.max(0, c - delta));
      const s2 = readLiked();
      if (nextLiked) s2.delete(slug); else s2.add(slug);
      writeLiked(s2);
    } finally {
      setBusy(false);
    }
  };

  const base = variant === 'large' ? styles.large : styles.compact;
  const activeColor = liked ? '#e8b84a' : '#6b6860';
  const heart = liked ? '♥' : '♡';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={liked}
      style={{ ...base, color: activeColor, borderColor: liked ? '#e8b84a' : '#2a2a35' }}
    >
      <span style={styles.heart}>{heart}</span>
      <span style={styles.count}>{count}</span>
    </button>
  );
}

const styles = {
  compact: { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid #2a2a35', padding: '4px 8px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 120ms' },
  large: { display: 'inline-flex', alignItems: 'center', gap: 10, background: 'transparent', border: '1px solid #2a2a35', padding: '10px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: '0.12em', cursor: 'pointer', transition: 'all 120ms' },
  heart: { fontSize: '1.2em', lineHeight: 1 },
  count: { letterSpacing: '0.08em' },
};

window.LikeButton = LikeButton;
export default LikeButton;
