interface Props {
  label: string;
  value: number;
  target: number;
  color: string;
  unit?: string;
}

export default function MacroBar({ label, value, target, color, unit = 'g' }: Props) {
  const pct = Math.min((value / target) * 100, 100);
  return (
    <div className="flex-1">
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium" style={{ color }}>{label}</span>
        <span className="text-gray-500">{Math.round(value)}/{target}{unit}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
