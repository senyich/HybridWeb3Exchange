import { Github } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-purple-900/30 bg-black/40 backdrop-blur-md mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-crimson-400">
              Ru.HEX
            </span>
            <span className="text-xs text-purple-light/40 font-mono">
              HYBRID EXCHANGE
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a href="https://github.com/senyich" className="text-gray-500 hover:text-purple-neon transition-colors"><Github className="w-5 h-5" /></a>            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-900/20 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-purple-900/20 flex flex-col md:flex-row justify-between text-xs text-gray-600 font-mono">
          <p>© 2024 Diploma Project. Sepolia Testnet.</p>
        </div>
      </div>
    </footer>
  );
};