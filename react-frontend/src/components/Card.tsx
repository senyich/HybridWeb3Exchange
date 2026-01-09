
export const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`relative overflow-hidden bg-glass-gradient border border-white/5 backdrop-blur-sm p-6 transition-all hover:border-purple-500/20 ${className}`}>
      {children}
    </div>
  );