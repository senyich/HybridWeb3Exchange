import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Hexagon, LayoutDashboard, ArrowRightLeft } from 'lucide-react';
import { ConnectKitButton } from "connectkit";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Торговля', href: '/trade', icon: <ArrowRightLeft className="w-4 h-4" /> },
    { name: 'Кабинет', href: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center">
                <Hexagon className="h-10 w-10 text-purple-neon fill-purple-neon/10 stroke-[1.5] group-hover:stroke-crimson-neon transition-colors duration-500" />
                <div className="absolute inset-0 blur-lg bg-purple-neon/30 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-white uppercase leading-none">
                  Ru<span className="text-purple-neon">.</span>HEX
                </span>
                <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase group-hover:text-crimson-neon transition-colors">
                  Protocol
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      relative flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-300
                      ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'}
                    `}
                  >
                    {isActive && (
                      <span className="absolute inset-0 bg-white/5 border border-white/5 rounded-sm -skew-x-12" />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      {item.icon}
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="h-6 w-[1px] bg-white/10"></div>
            <ConnectKitButton.Custom>
              {({ isConnected, show, truncatedAddress, ensName }) => (
                <button
                  onClick={show}
                  className={`
                    group relative px-6 py-2.5 text-sm font-mono font-bold uppercase tracking-wide transition-all duration-300
                    border overflow-hidden
                    ${isConnected 
                      ? 'border-purple-500/30 bg-purple-500/5 text-purple-300 hover:border-purple-400' 
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-crimson-neon/50 hover:text-white'}
                  `}
                >
                   <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isConnected ? 'bg-purple-500/10' : 'bg-crimson-neon/10'}`} />
                  <span className="relative z-10">
                    {isConnected ? ensName ?? truncatedAddress : "Connect Wallet"}
                  </span>
                </button>
              )}
            </ConnectKitButton.Custom>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl absolute left-0 right-0 py-4 px-4 shadow-2xl space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 border border-white/5 bg-white/5 text-gray-300 hover:border-purple-500/30 hover:text-white transition-all"
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            <div className="pt-2 flex justify-center">
               <ConnectKitButton />
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;