import React, { useEffect, useState } from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import { authService } from '@/services/authService';
import type { User as UserType } from '@/types';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

export function Header() {
  const [user, setUser] = useState<UserType | null>(null);
  const pathname = usePathname();
  
  useEffect(() => {
    // Buscar informações do usuário do localStorage
    const userData = authService.getUser();
    if (userData) {
      setUser(userData);
    }
  }, []);
  
  const handleLogout = async () => {
    await authService.logout();
  };
  
  const pageTitle = getPageTitle(pathname);
  
  return (
    <header className="h-16 border-b border-secondary-200 bg-white flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-medium text-secondary-900">{pageTitle}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-secondary-500 hover:text-secondary-700 transition-colors rounded-full hover:bg-secondary-100">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium text-secondary-700">
            {user?.name || 'Usuário'}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="flex items-center ml-2 text-secondary-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}

function getPageTitle(pathname: string): string {
  if (pathname === '/dashboard') return 'Dashboard';
  if (pathname === '/customers') return 'Clientes';
  if (pathname.startsWith('/customers/new')) return 'Novo Cliente';
  if (pathname.match(/^\/customers\/\d+$/)) return 'Detalhes do Cliente';
  if (pathname.startsWith('/customers/') && pathname.includes('/addresses')) return 'Endereços do Cliente';
  
  return 'Portal de Clientes';
} 