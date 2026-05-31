import React, { useState, useEffect } from 'react';

interface DinasPendidikanLogoProps {
  className?: string;
  size?: number | string;
}

export default function DinasPendidikanLogo({ className = '', size = 120 }: DinasPendidikanLogoProps) {
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('sdn4_custom_dinas_logo') : null;
  });

  useEffect(() => {
    const handleLogoChange = () => {
      const stored = localStorage.getItem('sdn4_custom_dinas_logo');
      setCustomLogoUrl(stored);
    };

    window.addEventListener('sdn4_custom_dinas_logo_changed', handleLogoChange);
    return () => {
      window.removeEventListener('sdn4_custom_dinas_logo_changed', handleLogoChange);
    };
  }, []);

  if (customLogoUrl) {
    return (
      <img
        src={customLogoUrl}
        alt="Logo Kabupaten Grobogan"
        className={className}
        style={{ width: size, height: size, objectFit: 'contain' }}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Handcrafted premium high-fidelity SVG representation of the official emblem of KABUPATEN GROBOGAN
  return (
    <svg
      id="grobogan-logo-svg"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradients and Filters for the Grobogan Emblem */}
        <linearGradient id="groboganYellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        <linearGradient id="groboganRedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
        <linearGradient id="groboganGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
        <linearGradient id="groboganWaterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        {/* Text curve path for the top scroll banner */}
        <path
          id="groboganScrollPath"
          d="M120,68 C200,48 300,48 380,68"
          fill="none"
        />
      </defs>

      {/* 1. Shield Background Section */}
      {/* Golden-Yellow Spade Shield with rope border */}
      <path
        d="M250,55 C370,55 430,90 420,330 C410,430 310,460 250,470 C190,460 90,430 80,330 C70,90 130,55 250,55 Z"
        fill="url(#groboganYellowGrad)"
        stroke="#1e293b"
        strokeWidth="6.5"
        strokeLinejoin="round"
      />
      
      {/* Inner rope-like dotted/patterned line */}
      <path
        d="M250,65 C355,65 415,95 405,325 C395,415 305,445 250,455 C195,445 105,415 95,325 C85,95 145,65 250,65 Z"
        fill="none"
        stroke="#166534"
        strokeWidth="3.5"
        strokeDasharray="6 4"
        opacity="0.8"
      />

      {/* 2. Top Scroll: 'KABUPATEN GROBOGAN' */}
      <g transform="translate(0, -6)">
        {/* White scroll background */}
        <path
          d="M100,75 C100,75 110,50 140,54 C170,58 250,45 250,45 C250,45 330,58 360,54 C390,50 400,75 400,75 L380,82 C340,75 250,85 250,85 C250,85 160,75 120,82 Z"
          fill="#fafafa"
          stroke="#1e293b"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Side scrolls folds */}
        <path d="M100,75 L120,82 L120,74 Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2" />
        <path d="M400,75 L380,82 L380,74 Z" fill="#cbd5e1" stroke="#1e293b" strokeWidth="2" />

        {/* Text on scroll */}
        <text fontStyle="normal" fontSize="17.5" fontFamily="monospace, sans-serif" fontWeight="950" fill="#0f172a">
          <textPath href="#groboganScrollPath" startOffset="50%" textAnchor="middle">
            KABUPATEN GROBOGAN
          </textPath>
        </text>
      </g>

      {/* 3. Golden Star (Top Center) */}
      <path
        d="M250,88 L257,110 L279,110 L261,123 L268,145 L250,131 L232,145 L239,123 L221,110 L243,110 Z"
        fill="#facc15"
        stroke="#ca8a04"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* 4. Central Sacred Flame with Teak Leaf (Mrapen & Daun Jati) */}
      <g transform="translate(0, 10)">
        {/* Big Blazing Fire Background */}
        <path
          d="M250,285 C295,285 320,245 305,190 C300,170 280,145 250,118 C220,145 200,170 195,190 C180,245 205,285 250,285 Z"
          fill="url(#groboganRedGrad)"
          stroke="#7f1d1d"
          strokeWidth="3"
        />
        {/* Inner bright orange flame */}
        <path
          d="M250,278 C282,278 300,245 290,205 C286,190 271,170 250,145 C229,170 214,190 210,205 C200,245 218,278 250,278 Z"
          fill="#f97316"
        />
        {/* Yellow core flame */}
        <path
          d="M250,270 C270,270 282,248 275,218 C272,205 262,190 250,170 C238,190 228,205 225,218 C218,248 230,270 250,270 Z"
          fill="#facc15"
        />

        {/* Dynamic Detailed Green Teak Leaf in the center */}
        <path
          d="M250,158 C242,185 222,215 222,238 C222,258 235,272 250,272 C265,272 278,258 278,238 C278,215 258,185 250,158 Z"
          fill="url(#groboganGreenGrad)"
          stroke="#14532d"
          strokeWidth="2.5"
        />
        {/* Leaf veins */}
        <path d="M250,165 L250,272" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
        <path d="M250,195 Q240,190 236,188" stroke="#ffffff" strokeWidth="1.5" opacity="0.55" />
        <path d="M250,195 Q260,190 264,188" stroke="#ffffff" strokeWidth="1.5" opacity="0.55" />
        <path d="M250,215 Q236,210 230,205" stroke="#ffffff" strokeWidth="1.5" opacity="0.55" />
        <path d="M250,215 Q264,210 270,205" stroke="#ffffff" strokeWidth="1.5" opacity="0.55" />
        <path d="M250,235 Q234,230 226,225" stroke="#ffffff" strokeWidth="1.5" opacity="0.55" />
        <path d="M250,235 Q266,230 274,225" stroke="#ffffff" strokeWidth="1.5" opacity="0.55" />
        <path d="M250,253 Q236,248 228,243" stroke="#ffffff" strokeWidth="1.5" opacity="0.55" />
        <path d="M250,253 Q264,248 272,243" stroke="#ffffff" strokeWidth="1.5" opacity="0.55" />

        {/* Tree Trunk Base Motif */}
        <path d="M232,274 L268,274 L258,284 L242,284 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
        <path d="M225,282 L275,282 L270,288 L230,288 Z" fill="#475569" />
      </g>

      {/* 5. Flanking Red Lightning Bolts (Petir Selo) */}
      {/* Left Lightning */}
      <path
        d="M175,178 L145,215 L165,215 L140,255 L182,208 L162,208 Z"
        fill="#dc2626"
        stroke="#7f1d1d"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Right Lightning */}
      <path
        d="M325,178 L355,215 L335,215 L360,255 L318,208 L338,208 Z"
        fill="#dc2626"
        stroke="#7f1d1d"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* 6. Rice Stalk (Left) & Cotton/Corn/Cane (Right) Wreath */}
      {/* Left golden paddy */}
      <g opacity="0.95">
        <path d="M115,225 C100,270 105,330 145,365" stroke="#eab308" strokeWidth="3" fill="none" />
        {/* Grain seeds */}
        <g fill="#ca8a04">
          <circle cx="112" cy="235" r="4.5" />
          <circle cx="107" cy="250" r="4.5" />
          <circle cx="104" cy="265" r="4.5" />
          <circle cx="103" cy="280" r="4.5" />
          <circle cx="105" cy="295" r="4.5" />
          <circle cx="110" cy="310" r="4.5" />
          <circle cx="118" cy="325" r="4.5" />
          <circle cx="128" cy="338" r="4.5" />
          <circle cx="140" cy="349" r="4.5" />
          <circle cx="152" cy="358" r="4.5" />
        </g>
      </g>

      {/* Right cotton/corn leaf wreath */}
      <g opacity="0.95">
        <path d="M385,225 C400,270 395,330 355,365" stroke="#16a34a" strokeWidth="3" fill="none" />
        {/* Green/White leaves & blossoms */}
        <g fill="#15803d">
          <ellipse cx="387" cy="235" rx="4.5" ry="6" transform="rotate(-20, 387, 235)" />
          <ellipse cx="392" cy="250" rx="4.5" ry="6" transform="rotate(-15, 392, 250)" />
          <ellipse cx="395" cy="265" rx="4.5" ry="6" transform="rotate(-10, 395, 265)" />
          <ellipse cx="396" cy="280" rx="4.5" ry="6" transform="rotate(-5, 396, 280)" />
          <ellipse cx="394" cy="295" rx="4.5" ry="6" transform="rotate(5, 394, 295)" />
          <ellipse cx="389" cy="310" rx="4.5" ry="6" transform="rotate(10, 389, 310)" />
          <ellipse cx="381" cy="325" rx="4.5" ry="6" transform="rotate(20, 381, 325)" />
          <ellipse cx="371" cy="338" rx="4.5" ry="6" transform="rotate(30, 371, 338)" />
          <ellipse cx="359" cy="349" rx="4.5" ry="6" transform="rotate(40, 359, 349)" />
          <ellipse cx="347" cy="358" rx="4.5" ry="6" transform="rotate(50, 347, 358)" />
        </g>
      </g>

      {/* 7. Bottom Section: Rivers/Waves & Dark Foundation */}
      {/* Base border banner */}
      <path
        d="M140,365 C170,390 210,400 250,400 C290,400 330,390 360,365 C345,415 310,442 250,454 C190,442 155,415 140,365 Z"
        fill="#1e293b"
        stroke="#0f172a"
        strokeWidth="3.5"
      />

      {/* Water Waves (Grobogan Lusi river) in cyan-blue */}
      <path
        d="M148,375 C180,392 210,394 250,394 C290,394 320,392 352,375 C340,410 310,432 250,442 C190,432 160,410 148,375 Z"
        fill="url(#groboganWaterGrad)"
      />
      {/* Wave ripples */}
      <path d="M158,382 Q200,392 250,388 Q300,392 342,382" stroke="#ffffff" strokeWidth="2.5" opacity="0.8" />
      <path d="M172,398 Q210,408 250,404 Q290,408 328,398" stroke="#ffffff" strokeWidth="2" opacity="0.6" />

      {/* Black/dark purple floor of the waves */}
      <path
        d="M176,412 C200,425 225,430 250,430 C275,430 300,425 324,412 C312,428 290,438 250,442 C210,438 188,428 176,412 Z"
        fill="#311042"
      />
    </svg>
  );
}
