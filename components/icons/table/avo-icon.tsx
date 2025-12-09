import React from "react";

export const MyLogo = ({ size = 128, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 512 512"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Center Circle */}
    <circle cx="256" cy="256" r="70" fill="#C1272D" />

    {/* Top-Right Red Rounded Corner */}
    <path
      d="M512 150c0-82.8-67.2-150-150-150H300
         c-22.1 0-40 17.9-40 40s17.9 40 40 40h62
         c38.6 0 70 31.4 70 70v62c0 22.1 17.9 40 40 40s40-17.9 40-40V150z"
      fill="#C1272D"
    />

    {/* Bottom-Left Yellow Rounded Corner */}
    <path
      d="M0 362c0 82.8 67.2 150 150 150h62
         c22.1 0 40-17.9 40-40s-17.9-40-40-40h-62
         c-38.6 0-70-31.4-70-70v-62c0-22.1-17.9-40-40-40S0 210 0 232v130z"
      fill="#F4A21A"
    />
  </svg>
);
