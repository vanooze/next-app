interface Props {
  size?: number;
  fill?: string;
  width?: number;
  height?: number;
}

export const UploadIcon = ({
  fill = "#000",
  size,
  width,
  height,
  ...props
}: Props) => {
  return (
    <svg
      width={size || width || 24}
      height={size || height || 24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <line
        x1="12"
        y1="16"
        x2="12"
        y2="3"
        stroke={fill}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="16 7 12 3 8 7"
        stroke={fill}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M20 16v4a1.08 1.08 0 0 1-1.14 1H5.14A1.08 1.08 0 0 1 4 20V16"
        stroke={fill}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};
