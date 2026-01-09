export const StatRow = ({ label, value, unit, highlight = false }: { label: string; value: string; unit?: string; highlight?: boolean }) => (
    <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <div className="flex items-center gap-2 font-mono">
        <span className={`text-lg ${highlight ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-crimson-neon font-bold" : "text-gray-200"}`}>
          {value}
        </span>
        {unit && <span className="text-xs text-gray-600 uppercase">{unit}</span>}
      </div>
    </div>
  );