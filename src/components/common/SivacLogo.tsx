import React from 'react';

interface SivacLogoProps {
  className?: string;
  size?: number | string;
}

export const SivacLogo: React.FC<SivacLogoProps> = ({ className = '', size = 32 }) => {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="SIVAC Logo"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14B8A6" />
          <stop offset="1" stopColor="#0F766E" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="10" fill="url(#logo-grad)" />
      <path fillRule="evenodd" clipRule="evenodd" d="M16 8C16.8284 8 17.5 8.67157 17.5 9.5V14.5H22.5C23.3284 14.5 24 15.1716 24 16C24 16.8284 23.3284 17.5 22.5 17.5H17.5V22.5C17.5 23.3284 16.8284 24 16 24C15.1716 24 14.5 23.3284 14.5 22.5V17.5H9.5C8.67157 17.5 8 16.8284 8 16C8 15.1716 8.67157 14.5 9.5 14.5H14.5V9.5C14.5 8.67157 15.1716 8 16 8Z" fill="white" />
    </svg>
  );
};

export default SivacLogo;
