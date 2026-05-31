import React, { useState, useEffect } from 'react';
// @ts-ignore
import defaultLogo from '../assets/images/logo_sd_kronggen_clean_badge_circular_1780185064237.png';

interface Sdn4KronggenLogoProps {
  className?: string;
  size?: number | string;
}

export default function Sdn4KronggenLogo({ className = '', size = 512 }: Sdn4KronggenLogoProps) {
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('sdn4_custom_logo') : null;
  });

  useEffect(() => {
    const handleLogoChange = () => {
      const stored = localStorage.getItem('sdn4_custom_logo');
      setCustomLogoUrl(stored);
    };

    window.addEventListener('sdn4_custom_logo_changed', handleLogoChange);
    return () => {
      window.removeEventListener('sdn4_custom_logo_changed', handleLogoChange);
    };
  }, []);

  return (
    <img
      src={customLogoUrl || defaultLogo}
      alt="SD Negeri 4 Kronggen"
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
      referrerPolicy="no-referrer"
    />
  );
}
