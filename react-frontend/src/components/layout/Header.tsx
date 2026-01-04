import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Wallet, LayoutDashboard, ArrowRightLeft } from 'lucide-react';
import { ConnectKitButton } from "connectkit";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Торговля', href: '/trade', icon: <ArrowRightLeft className="w-4 h-4" /> },
    { name: 'Кабинет', href: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-500/20 bg-black/60 backdrop-blur-xl supports-[backdrop-filter]:bg-black/40">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-deep to-crimson-deep shadow-neon-purple transition-transform group-hover:scale-110">
                <Wallet className="h-6 w-6 text-white" />
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20"></div>
              </div>
              <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-neon via-fuchsia-500 to-crimson-neon group-hover:animate-pulse-glow">
                Ru.HEX
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300
                      ${isActive 
                        ? 'bg-purple-500/10 text-purple-neon shadow-[0_0_15px_rgba(168,85,247,0.3)] border border-purple-500/30' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'}
                    `}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="h-8 w-[1px] bg-gradient-to-b from-transparent via-purple-500/30 to-transparent"></div>
            <ConnectKitButton.Custom>
              {({ isConnected, show, truncatedAddress, ensName }) => (
                <button
                  onClick={show}
                  className={`
                    px-6 py-2.5 rounded-xl font-bold transition-all duration-300 border
                    ${isConnected 
                      ? 'bg-purple-900/20 border-purple-500/50 text-purple-electric hover:shadow-neon-purple' 
                      : 'bg-gradient-to-r from-purple-deep to-crimson-deep border-transparent text-white hover:scale-105 shadow-neon-red'}
                  `}
                >
                  {isConnected ? ensName ?? truncatedAddress : "Connect Wallet"}
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
          <div className="md:hidden border-t border-purple-500/20 py-4 space-y-2 bg-black/90 backdrop-blur-xl absolute left-0 right-0 px-4 shadow-2xl">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:bg-purple-500/20 hover:text-purple-neon transition-colors"
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            <div className="pt-4 flex justify-center">
               <ConnectKitButton />
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;