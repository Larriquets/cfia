import React, { useState, useMemo } from 'react';

function Illustration({ kind = 'orbit', seed = 0, size = 200, data = null }) {
  // Simple seeded pseudo-random
  const rnd = (n) => {
    let x = Math.sin(seed + n) * 10000;
    return x - Math.floor(x);
  };
  const fg = '#f5f3ee';
  const amber = '#e8b84a';
  const bg = '#0a0a0f';

  if (kind === 'generative' && data && Array.isArray(data.shapes)) {
    return <GenerativeIllus data={data} size={size} fg={fg} amber={amber} bg={bg} />;
  }

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

function GenerativeIllus({ data, size, fg, amber, bg }) {
  const S = size;
  const px = (v) => Math.round(v * S);
  const color = (c) => (c === 'amber' ? amber : c === 'bg' ? bg : fg);
  const sw = (v) => (typeof v === 'number' ? v : 1);

  return (
    <svg viewBox={`0 0 ${S} ${S}`} width={S} height={S} style={{ display: 'block', background: bg }}>
      <rect x="2" y="2" width={S - 4} height={S - 4} fill="none" stroke={fg} strokeWidth="1" />
      {data.shapes.slice(0, 40).map((s, i) => {
        const stroke = color(s.stroke || 'fg');
        const fill = s.fill ? color(s.fill) : 'none';
        const strokeWidth = sw(s.strokeWidth);
        if (s.type === 'line') {
          return <line key={i} x1={px(s.x1)} y1={px(s.y1)} x2={px(s.x2)} y2={px(s.y2)} stroke={stroke} strokeWidth={strokeWidth} />;
        }
        if (s.type === 'circle') {
          return <circle key={i} cx={px(s.cx)} cy={px(s.cy)} r={px(s.r)} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
        }
        if (s.type === 'rect') {
          return <rect key={i} x={px(s.x)} y={px(s.y)} width={px(s.w)} height={px(s.h)} fill={fill} stroke={fill === 'none' ? stroke : 'none'} strokeWidth={strokeWidth} />;
        }
        if (s.type === 'polyline' && Array.isArray(s.points)) {
          const pts = s.points.map((p) => `${px(p[0])},${px(p[1])}`).join(' ');
          return <polyline key={i} points={pts} fill="none" stroke={stroke} strokeWidth={strokeWidth} />;
        }
        if (s.type === 'polygon' && Array.isArray(s.points)) {
          const pts = s.points.map((p) => `${px(p[0])},${px(p[1])}`).join(' ');
          return <polygon key={i} points={pts} fill={fill} stroke={fill === 'none' ? stroke : 'none'} strokeWidth={strokeWidth} />;
        }
        return null;
      })}
    </svg>
  );
}

window.Illustration = Illustration;
