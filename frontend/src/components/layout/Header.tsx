import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Hexagon, LayoutDashboard, ArrowRightLeft, Github, ExternalLink } from 'lucide-react';
import { ConnectKitButton } from "connectkit";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const navigation = [
    { name: 'Торговля', href: '/swap', icon: <ArrowRightLeft className="w-5 h-5" /> },
    { name: 'Кабинет', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl transition-all duration-300 ${isMenuOpen ? 'border-transparent bg-transparent' : ''}`}>
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">

            <div className="flex items-center gap-10 z-50">
              <Link 
                to="/" 
                className="flex items-center gap-3 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="relative flex items-center justify-center">
                  <Hexagon className="h-9 w-9 sm:h-10 sm:w-10 text-purple-neon fill-purple-neon/10 stroke-[1.5] group-hover:stroke-crimson-neon transition-colors duration-500" />
                  <div className="absolute inset-0 blur-lg bg-purple-neon/30 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg sm:text-xl font-black tracking-tighter text-white uppercase leading-none">
                    Ru<span className="text-purple-neon">.</span>HEX
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
                      border overflow-hidden clip-path-polygon
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
              className="md:hidden z-50 p-2 text-gray-300 hover:text-white transition-colors relative"
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                 {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </div>
            </button>
          </div>
        </nav>
      </header>

      <div 
        className={`
          fixed inset-0 z-40 bg-background/95 backdrop-blur-2xl md:hidden transition-all duration-500 ease-in-out
          flex flex-col
          ${isMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-8'}
        `}
      >
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-purple-neon/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 bg-crimson-neon/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex-1 flex flex-col justify-center px-8 pt-20 pb-10 space-y-8">
          <div className="flex flex-col gap-6">
            {navigation.map((item, index) => {
               const isActive = location.pathname === item.href;
               return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  style={{ transitionDelay: `${index * 100}ms` }}
                  className={`
                    flex items-center gap-4 text-2xl font-black uppercase tracking-tighter transition-all duration-300 transform
                    ${isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}
                    ${isActive ? 'text-white translate-x-2' : 'text-gray-500 hover:text-white hover:translate-x-2'}
                  `}
                >
                  <span className={`p-2 rounded-lg border ${isActive ? 'border-purple-neon/50 bg-purple-neon/10 text-purple-neon' : 'border-white/5 bg-white/5'}`}>
                    {item.icon}
                  </span>
                  {item.name}
                  {isActive && <div className="w-2 h-2 rounded-full bg-purple-neon shadow-[0_0_10px_#B026FF]" />}
                </Link>
              )
            })}
          </div>

          <div className="w-full h-[1px] bg-white/10" />

          <div 
             className={`flex flex-col gap-6 transition-all duration-500 delay-300 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <div className="flex items-center justify-between text-xs font-mono text-gray-500 uppercase tracking-widest">
              <span>Wallet Connection</span>
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Sepolia
              </span>
            </div>

            <ConnectKitButton.Custom>
              {({ isConnected, show, truncatedAddress, ensName }) => (
                <button
                  onClick={() => {
                    show?.();
                    if(!isConnected) setIsMenuOpen(false);
                  }}
                  className={`
                    w-full py-4 px-6 relative overflow-hidden group
                    border border-white/10 bg-white/5 active:scale-[0.98] transition-all duration-200
                  `}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-purple-neon/20 to-crimson-neon/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <span className="relative z-10 font-mono font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2">
                    {isConnected ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        {ensName ?? truncatedAddress}
                      </>
                    ) : (
                      <>
                        Connect Wallet
                        <ArrowRightLeft className="w-4 h-4 opacity-50" />
                      </>
                    )}
                  </span>
                </button>
              )}
            </ConnectKitButton.Custom>

            <div className="flex gap-4 justify-center mt-4">
               <a href="https://github.com/senyich" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
               </a>
               <a href="#" className="text-gray-500 hover:text-white transition-colors">
                  <ExternalLink className="w-5 h-5" />
               </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;