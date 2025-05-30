interface ChevronUpProps {
  class?: string;
  width?: number;
  height?: number;
}

export default function ChevronUp({ width = 24, height = 24, ...props }: ChevronUpProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}
