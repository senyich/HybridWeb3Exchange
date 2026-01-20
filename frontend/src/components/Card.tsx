import React from "react";

export const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`relative overflow-hidden rounded-2xl bg-surface/80 backdrop-blur-2xl border border-white/5 transition-all duration-300 hover:border-purple-500/20 ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    <div className="relative z-10 p-6">{children}</div>
  </div>
);