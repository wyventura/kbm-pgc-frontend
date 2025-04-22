import api, { simpleFetch } from './api';
import type { Login, AuthResponse, User, ApiResponse } from '@/types';
import Cookies from 'js-cookie';

export const authService = {
  login: async (credentials: Login): Promise<AuthResponse> => {
    try {
      console.log('authService.login: Iniciando login com', credentials.email);
      
      // Usar simpleFetch para acessar o proxy interno do Next.js
      const data = await simpleFetch('/auth/login', 'POST', credentials);
      console.log('authService.login: Resposta recebida do servidor:', data);
      
      if (data.success && data.data.token) {
        // Garantir que o token esteja formatado corretamente
        const token = data.data.token.trim();
        console.log(`authService.login: Token recebido: ${token.substring(0, 20)}...`);
        
        // Salvar o token apenas em cookies
        if (typeof window !== 'undefined') {
          console.log('authService.login: Salvando token nos cookies');
          
          // Salvar em cookies para autenticação
          Cookies.set('token', token, { 
            expires: 1,  // expira em 1 dia
            path: '/',
            sameSite: 'lax' 
          });
          
          // Salvar os dados do usuário em cookie também
          Cookies.set('user', JSON.stringify(data.data.user), { 
            expires: 1,
            path: '/',
            sameSite: 'lax'
          });
          
          // Verificar se o token foi salvo corretamente
          const cookieToken = Cookies.get('token');
          
          console.log('authService.login: Verificação de token salvo:');
          console.log(`- cookie: ${cookieToken ? 'OK' : 'FALHA'} (${cookieToken?.substring(0, 10)}...)`);
        }
      } else {
        console.log('authService.login: Resposta sem token ou com erro:', data);
      }
      
      return data;
    } catch (error: any) {
      // Em caso de erro, passamos o erro para o manipulador na camada de UI
      console.error('Erro no serviço de login:', error);
      throw error;
    }
  },
  
  logout: async (): Promise<void> => {
    // Remover o token apenas dos cookies
    if (typeof window !== 'undefined') {
      Cookies.remove('token');
      Cookies.remove('user');
    }
    
    // Redirecionar para a página de login
    window.location.href = '/auth/login';
  },
  
  getProfile: async (): Promise<ApiResponse<User>> => {
    try {
      // Usar simpleFetch para evitar requisições OPTIONS
      return await simpleFetch('/profile', 'GET');
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      throw error;
    }
  },
  
  getUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const userString = Cookies.get('user');
      if (userString) {
        try {
          return JSON.parse(userString);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  },
  
  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return !!Cookies.get('token');
    }
    return false;
  }
}; 