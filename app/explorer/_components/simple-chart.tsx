'use client';

export function SimpleChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-full">
      {data.map((value, i) => (
        <div
          key={i}
          className="flex-1 bg-blue-500 rounded-t transition-all hover:bg-blue-600"
          style={{ height: `${(value / max) * 100}%` }}
        />
      ))}
    </div>
  );
}

