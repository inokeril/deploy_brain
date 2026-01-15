import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTelegram } from '@/contexts/TelegramContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Brain, Grid3x3, Trophy, Award, User, LogOut, Menu, X } from 'lucide-react';

const Header = () => {
  const { user, logout, isTelegram } = useAuth();
  const { 
    themeParams, 
    colorScheme, 
    showBackButton, 
    hideBackButton,
    hapticImpact 
  } = useTelegram();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Show Telegram back button on non-dashboard pages
  useEffect(() => {
    if (isTelegram && location.pathname !== '/dashboard') {
      showBackButton(() => {
        hapticImpact('light');
        navigate(-1);
      });
    } else if (isTelegram) {
      hideBackButton();
    }
    
    return () => {
      if (isTelegram) {
        hideBackButton();
      }
    };
  }, [location.pathname, isTelegram, showBackButton, hideBackButton, navigate, hapticImpact]);

  const handleLogout = async () => {
    if (isTelegram) {
      hapticImpact('medium');
    }
    await logout();
    if (!isTelegram) {
      navigate('/login');
    }
  };

  const handleNavClick = () => {
    if (isTelegram) {
      hapticImpact('light');
    }
    setMobileMenuOpen(false);
  };

  const navItems = [
    { path: '/dashboard', label: 'Упражнения', icon: Grid3x3 },
    { path: '/competitions', label: 'Соревнования', icon: Trophy },
    { path: '/leaderboard', label: 'Лидеры', icon: Award },
    { path: '/profile', label: 'Профиль', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  // Telegram theme styles
  const headerStyle = isTelegram ? {
    backgroundColor: themeParams?.header_bg_color || themeParams?.bg_color || '#ffffff',
    borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  } : {};

  const textStyle = isTelegram ? {
    color: themeParams?.text_color || '#000000',
  } : {};

  const hintStyle = isTelegram ? {
    color: themeParams?.hint_color || '#999999',
  } : {};

  const activeStyle = isTelegram ? {
    backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    color: themeParams?.accent_text_color || themeParams?.link_color || '#2481cc',
  } : {};

  return (
    <header 
      className={`border-b sticky top-0 z-50 ${!isTelegram ? 'bg-white border-gray-200' : ''}`}
      style={headerStyle}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-2"
            onClick={handleNavClick}
          >
            <div 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
              style={{ 
                background: isTelegram 
                  ? `linear-gradient(135deg, ${themeParams?.button_color || '#9333ea'}, ${themeParams?.link_color || '#3b82f6'})`
                  : 'linear-gradient(135deg, #9333ea, #3b82f6)'
              }}
            >
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span 
              className="text-lg sm:text-xl font-bold hidden sm:block"
              style={isTelegram ? {
                background: `linear-gradient(to right, ${themeParams?.accent_text_color || '#9333ea'}, ${themeParams?.link_color || '#3b82f6'})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              } : {
                background: 'linear-gradient(to right, #9333ea, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Brain Training
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    !isTelegram && (active
                      ? 'bg-purple-50 text-purple-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50')
                  }`}
                  style={isTelegram ? (active ? activeStyle : textStyle) : undefined}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop User Menu */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                      <AvatarImage src={user?.picture} alt={user?.name} />
                      <AvatarFallback 
                        className="text-white"
                        style={{ 
                          background: isTelegram 
                            ? `linear-gradient(135deg, ${themeParams?.button_color || '#9333ea'}, ${themeParams?.link_color || '#3b82f6'})`
                            : 'linear-gradient(135deg, #9333ea, #3b82f6)'
                        }}
                      >
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56"
                  style={isTelegram ? { 
                    backgroundColor: themeParams?.secondary_bg_color || themeParams?.bg_color,
                    color: themeParams?.text_color
                  } : undefined}
                >
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm" style={textStyle}>{user?.name}</p>
                      <p className="text-xs" style={hintStyle}>
                        {user?.telegram_username ? `@${user.telegram_username}` : user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { handleNavClick(); navigate('/profile'); }}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Профиль</span>
                  </DropdownMenuItem>
                  {!isTelegram && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Выйти</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg transition-colors"
              style={isTelegram ? { 
                color: themeParams?.text_color,
              } : undefined}
              onClick={() => {
                if (isTelegram) hapticImpact('light');
                setMobileMenuOpen(!mobileMenuOpen);
              }}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" style={textStyle} />
              ) : (
                <Menu className="w-6 h-6" style={textStyle} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden py-4 border-t"
            style={isTelegram ? { 
              borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            } : undefined}
          >
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      !isTelegram && (active
                        ? 'bg-purple-50 text-purple-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50')
                    }`}
                    style={isTelegram ? (active ? activeStyle : textStyle) : undefined}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div 
              className="mt-4 pt-4 border-t"
              style={isTelegram ? { 
                borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
              } : undefined}
            >
              <div className="flex items-center space-x-3 px-4 py-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.picture} alt={user?.name} />
                  <AvatarFallback 
                    className="text-white"
                    style={{ 
                      background: isTelegram 
                        ? `linear-gradient(135deg, ${themeParams?.button_color || '#9333ea'}, ${themeParams?.link_color || '#3b82f6'})`
                        : 'linear-gradient(135deg, #9333ea, #3b82f6)'
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="font-medium text-sm" style={textStyle}>{user?.name}</p>
                  <p className="text-xs" style={hintStyle}>
                    {user?.telegram_username ? `@${user.telegram_username}` : user?.email}
                  </p>
                </div>
              </div>
              {!isTelegram && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 mt-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Выйти</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
