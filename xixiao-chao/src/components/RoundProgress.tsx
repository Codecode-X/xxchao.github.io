// ============================================================
// 轮次进度条
// ============================================================

interface RoundProgressProps {
  currentRound: number;
  totalRounds: number;
  labels: string[];
}

export function RoundProgress({ currentRound, totalRounds, labels }: RoundProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-500">
          第 {currentRound} / {totalRounds} 轮
        </span>
        <span className="text-sm font-medium text-indigo-600">
          {labels[currentRound - 1]}
        </span>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: totalRounds }, (_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors ${
              i < currentRound
                ? 'bg-indigo-500'
                : i === currentRound - 1
                ? 'bg-indigo-400 animate-pulse'
                : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}