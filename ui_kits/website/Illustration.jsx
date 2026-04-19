import React, { useState, useMemo } from 'react';

function Illustration({ kind = 'orbit', seed = 0, size = 200 }) {
  // Simple seeded pseudo-random
  const rnd = (n) => {
    let x = Math.sin(seed + n) * 10000;
    return x - Math.floor(x);
  };
  const fg = '#f5f3ee';
  const amber = '#e8b84a';
  const bg = '#0a0a0f';

  if (kind === 'orbit') {
    const cx = size / 2;
    const r = size * 0.28;
    const satAng = rnd(1) * Math.PI * 2;
    const satX = cx + Math.cos(satAng) * r;
    const satY = cx + Math.sin(satAng) * r;
    return (
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ display: 'block', background: bg }}>
        <rect x="2" y="2" width={size - 4} height={size - 4} fill="none" stroke={fg} strokeWidth="1" />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={fg} strokeWidth="0.5" />
        <circle cx={cx} cy={cx} r={size * 0.08} fill={bg} stroke={fg} strokeWidth="1.5" />
        <rect x={satX - 5} y={satY - 5} width="10" height="10" fill={amber} />
      </svg>
    );
  }
  if (kind === 'target') {
    const cx = size / 2;
    return (
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ display: 'block', background: bg }}>
        <rect x="2" y="2" width={size - 4} height={size - 4} fill="none" stroke={fg} strokeWidth="1" />
        {[0.38, 0.26, 0.14].map((f, i) => (
          <rect key={i} x={cx - size * f} y={cx - size * f} width={size * f * 2} height={size * f * 2} fill="none" stroke={fg} strokeWidth="0.8" />
        ))}
        <rect x={cx - 6} y={cx - 6} width="12" height="12" fill={amber} />
      </svg>
    );
  }
  if (kind === 'horizon') {
    const cx = size / 2;
    return (
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ display: 'block', background: bg }}>
        <rect x="2" y="2" width={size - 4} height={size - 4} fill="none" stroke={fg} strokeWidth="1" />
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={i} x1={10 + i * (size - 20) / 9} y1={size - 10} x2={cx} y2={cx} stroke={fg} strokeWidth="0.5" />
        ))}
        <line x1="0" y1={cx} x2={size} y2={cx} stroke={fg} strokeWidth="1.5" />
        <rect x={cx - 14} y={cx - 28} width="28" height="28" fill={amber} />
      </svg>
    );
  }
  // signal
  const bars = 14;
  const heights = Array.from({ length: bars }, (_, i) => 0.2 + rnd(i + 10) * 0.8);
  const accentIdx = Math.floor(rnd(99) * bars);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ display: 'block', background: bg }}>
      <rect x="2" y="2" width={size - 4} height={size - 4} fill="none" stroke={fg} strokeWidth="1" />
      {heights.map((h, i) => {
        const bw = (size - 40) / bars;
        const bh = h * size * 0.6;
        return (
          <rect key={i}
                x={20 + i * bw + 2}
                y={size / 2 + size * 0.18 - bh}
                width={bw - 4}
                height={bh}
                fill={i === accentIdx ? amber : fg} />
        );
      })}
      <line x1="10" y1={size - 20} x2={size - 10} y2={size - 20} stroke={fg} strokeWidth="1" />
    </svg>
  );
}

window.Illustration = Illustration;
