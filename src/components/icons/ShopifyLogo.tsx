import React from 'react';

interface ShopifyLogoProps {
  size?: number;
  className?: string;
}

export default function ShopifyLogo({ size = 24, className = '' }: ShopifyLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shopping bag shape */}
      <path
        d="M6 8h12l-1.5 9H7.5L6 8z"
        fill="currentColor"
      />
      {/* Bag handles */}
      <path
        d="M8 8c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      {/* White S letter */}
      <path
        d="M10.5 11.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5zm0 3c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5z"
        fill="white"
      />
    </svg>
  );
} 