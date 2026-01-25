'use client';

interface PieChartProps {
  data: Array<{
    categoryId: string;
    name: string;
    color: string | null;
    total: number;
    percent: number;
  }>;
  size?: number;
}

export default function PieChart({ data, size = 200 }: PieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="text-center text-accent-500 text-sm">
          No data
        </div>
      </div>
    );
  }

  const radius = size / 2 - 10;
  const center = size / 2;
  let currentAngle = -90; // Start from top

  // Calculate total for normalization
  const total = data.reduce((sum, item) => sum + item.percent, 0);

  const segments = data.map((item, index) => {
    const angle = (item.percent / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    // Convert angles to radians
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    // Calculate path for pie slice
    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    currentAngle = endAngle;

    const color = item.color || '#6B7280';

    return (
      <path
        key={item.categoryId}
        d={pathData}
        fill={color}
        stroke="white"
        strokeWidth="2"
        className="transition-opacity hover:opacity-80 cursor-pointer"
        style={{ opacity: 0.9 }}
      />
    );
  });

  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments}
      </svg>
    </div>
  );
}
