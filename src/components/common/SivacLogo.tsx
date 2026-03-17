import React from 'react';

interface SivacLogoProps {
  className?: string;
  size?: number | string;
}

export const SivacLogo: React.FC<SivacLogoProps> = ({ className = '', size = '100%' }) => {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="SIVAC Logo"
    >
      <defs>
        <linearGradient id="gradient-sivac-main" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14B8A6" /> {/* teal-500 */}
          <stop offset="1" stopColor="#0891B2" /> {/* cyan-600 */}
        </linearGradient>
        <linearGradient id="gradient-sivac-dark" x1="100" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F766E" /> {/* teal-700 */}
          <stop offset="1" stopColor="#164E63" /> {/* cyan-900 */}
        </linearGradient>
        {/* Drop shadow for inner cross */}
        <filter id="shadow-sivac-cross" x="25" y="25" width="50" height="50" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
        </filter>
      </defs>
      
      {/* Background shape: Modern Hexagon/Shield Hybrid */}
      <path 
        d="M50 4L88 26V74L50 96L12 74V26L50 4Z" 
        fill="url(#gradient-sivac-main)" 
      />
      
      {/* Subtle isometric shading */}
      <path 
        d="M50 4L88 26V74L50 50V4Z" 
        fill="url(#gradient-sivac-dark)" 
        opacity="0.3" 
      />
      <path 
        d="M50 96L12 74V26L50 50V96Z" 
        fill="#ffffff" 
        opacity="0.15" 
      />
      
      {/* Central White Cross */}
      <path 
        d="M62 43H57V38C57 36.34 55.66 35 54 35H46C44.34 35 43 36.34 43 38V43H38C36.34 43 35 44.34 35 46V54C35 55.66 36.34 57 38 57H43V62C43 63.66 44.34 65 46 65H54C55.66 65 57 63.66 57 62V57H62C63.66 57 65 55.66 65 54V46C65 44.34 63.66 43 62 43Z" 
        fill="white" 
        filter="url(#shadow-sivac-cross)"
      />
      
      {/* Inner Central Dot for Tech/Connection feel */}
      <circle cx="50" cy="50" r="3.5" fill="url(#gradient-sivac-main)" />
    </svg>
  );
};

export default SivacLogo;
