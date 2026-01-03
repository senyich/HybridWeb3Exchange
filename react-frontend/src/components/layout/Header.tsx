// Header.tsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Bell, Wallet } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Торговля', href: '/trade', current: location.pathname === '/trade' },
  ];

  return (
    <header className="bg-gradient-to-r from-custom-dark-red via-purple-900 to-black border-b border-purple-900/30">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-neon to-crimson-electric rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-neon to-crimson-electric">
                CryptoHybrid
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  item.current
                    ? 'bg-purple-900/30 text-white shadow-neon-purple'
                    : 'text-gray-300 hover:text-white hover:bg-purple-900/20'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-300 hover:text-white hover:bg-purple-900/20 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            
            <div className="hidden md:flex items-center space-x-3">
              <Link
                to="/wallet"
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-900 to-crimson-dark px-4 py-2 rounded-lg hover:shadow-neon-purple transition-all duration-300"
              >
                <User className="w-5 h-5" />
                <span>Аккаунт</span>
              </Link>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-900/30">
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium ${
                    item.current
                      ? 'bg-purple-900/30 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-purple-900/20'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-purple-900/30">
                <Link
                  to="/profile"
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-900 to-crimson-dark px-4 py-3 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  <span>Аккаунт</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;