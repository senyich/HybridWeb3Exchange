import { Github } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-white/5 bg-black/40 backdrop-blur-md mt-auto">
      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex flex-col gap-1">
            <span className="text-lg font-black tracking-tighter text-white uppercase">
              Ru.HEX
            </span>
            <span className="text-[10px] text-purple-neon/60 font-mono tracking-[0.2em] uppercase">
              Decentralized Hybrid Exchange
            </span>
          </div>

          <div className="flex items-center gap-8">
            <a 
              href="https://github.com/senyich" 
              target="_blank" 
              rel="noreferrer" 
              className="group flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4 group-hover:text-purple-neon transition-colors" />
              <span>SOURCE</span>
            </a>
            
            <div className="flex items-center gap-3 px-3 py-1.5 rounded bg-white/5 border border-white/5">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </div>
              <span className="text-[10px] font-mono text-green-400 uppercase tracking-wider">
                Sepolia Active
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-600 font-mono uppercase tracking-wider">
          <p>© 2026 Diplom Project. v.1.0.0-alpha</p>
        </div>
      </div>
    </footer>
  );
};