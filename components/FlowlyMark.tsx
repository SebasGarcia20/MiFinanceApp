interface FlowlyMarkProps {
  size?: number;
  className?: string;
}

export default function FlowlyMark({ size = 32, className = '' }: FlowlyMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" fill="currentColor"/>
      {/* Custom "F" derived from Inter but refined: thicker stem, shorter middle bar, intentional spacing */}
      <path 
        d="M8.5 6.5v11M8.5 6.5h6.5M8.5 10.5h4.5"
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
