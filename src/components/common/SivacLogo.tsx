import React from 'react';

interface SivacLogoProps {
  className?: string;
  size?: number | string;
}

export const SivacLogo: React.FC<SivacLogoProps> = ({ className = '', size = 32 }) => {
  return (
    <img 
      src="/logo_sivac.png" 
      alt="SIVAC Logo" 
      className={className}
      style={{ width: size, height: 'auto', objectFit: 'contain' }}
    />
  );
};

export default SivacLogo;
