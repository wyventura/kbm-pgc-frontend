import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

// Função para obter o token de autorização
const getAuthToken = (): string | null => {
  // Verificar se estamos no ambiente do servidor
  if (typeof window === 'undefined') {
    console.log('getAuthToken: Executando no servidor, não há token disponível');
    return null;
  }
  
  // Obter o token apenas do cookie
  try {
    const cookieToken = Cookies.get('token');
    if (cookieToken) {
      const trimmedToken = cookieToken.trim();
      console.log(`getAuthToken: Token encontrado no cookie: ${trimmedToken.substring(0, 10)}...`);
      return trimmedToken;
    }
  } catch (error) {
    console.error('getAuthToken: Erro ao obter token do cookie:', error);
  }
  
  console.log('getAuthToken: Nenhum token encontrado');
  return null;
};

// Determinar o baseURL apropriado baseado no ambiente
const determineBaseUrl = () => {
  // No lado do cliente, usar o proxy interno do Next.js
  if (typeof window !== 'undefined') {
    return '/api';
  }
  
  // No lado do servidor, usar a URL completa do .env
  return process.env.NEXT_PUBLIC_API_URL || 'https://api-kbmpgd.fwsistemas.com';
  
  // Código anterior comentado:
  // // Usar sempre a URL completa da API externa
  // const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-kbmpgd.fwsistemas.com';
  // console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  // return apiUrl;
};

// Usar a URL do proxy para evitar problemas de CORS
const API_URL = determineBaseUrl();
console.log('API URL configurada:', API_URL);

// Verificar token inicial (apenas no cliente)
let initialToken = null;
if (typeof window !== 'undefined') {
  initialToken = getAuthToken();
  console.log('Inicializando API com token:', initialToken ? `Bearer ${initialToken.trim()}` : 'Nenhum token disponível');
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Habilitar withCredentials para enviar cookies no proxy interno
  withCredentials: true,
});

// Função para realizar requisições diretas evitando alguns casos de preflight OPTIONS
export const simpleFetch = async (url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any) => {
  const fullUrl = `${API_URL}${url}`;
  
  try {
    // Cabeçalhos simples para evitar preflight OPTIONS
    const headers: HeadersInit = {
      'Accept': 'application/json'
    };
    
    // Adicionar o token de autorização de forma simplificada
    const token = getAuthToken();
    if (token) {
      // Formato simples para autorização
      headers['Authorization'] = `Bearer ${token.trim()}`;
      console.log(`simpleFetch: Enviando token: ${headers['Authorization']}`);
    }
    
    // Adicionar Content-Type apenas para métodos que enviam dados
    if ((method === 'POST' || method === 'PUT') && data) {
      headers['Content-Type'] = 'application/json';
    }
    
    const options: RequestInit = {
      method,
      headers,
      // Incluir cookies nas requisições para o proxy interno
      credentials: 'include',
    };
    
    // Adicionar corpo para requisições POST, PUT
    if ((method === 'POST' || method === 'PUT') && data) {
      options.body = JSON.stringify(data);
    }
    
    // Fazer a requisição
    console.log(`simpleFetch: ${method} ${fullUrl}`);
    
    const response = await fetch(fullUrl, options);
    console.log(`simpleFetch: Resposta ${response.status}`);
    
    // Para erros 4xx e 5xx
    if (!response.ok) {
      console.error(`simpleFetch: Erro HTTP ${response.status}`);
      let errorData;
      
      try {
        // Tentar ler o corpo do erro
        errorData = await response.json();
        console.error('simpleFetch: Erro detalhado:', errorData);
      } catch (e) {
        // Se não conseguir ler como JSON, usar o status
        errorData = { 
          error: { 
            code: response.status,
            message: `Erro HTTP ${response.status}` 
          } 
        };
      }
      
      // Para o erro 401 (Não autorizado), redirecionar para a página de login
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          console.log('simpleFetch: Token inválido ou expirado');
          
          // Remover tokens inválidos
          try {
            Cookies.remove('token');
            Cookies.remove('user');
          } catch (e) {
            console.error('Erro ao remover tokens:', e);
          }
          
          // Redirecionar para a página de login
          window.location.href = '/auth/login';
        }
        
        throw {
          status: 401,
          response: { data: errorData },
          message: 'Não autorizado: Token inválido ou expirado'
        };
      }
      
      // Garantir que o erro esteja no formato padronizado
      if (!errorData.error) {
        errorData = {
          error: {
            code: response.status,
            message: errorData.message || `Erro na requisição: ${response.status}`
          }
        };
      }
      
      // Formatar o erro para ser consistente com o formato esperado
      throw {
        status: response.status,
        response: { data: errorData },
        message: errorData.error.message || `Erro na requisição: ${response.status}`
      };
    }
    
    // Verificar se há conteúdo
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      // Tentar processar a resposta JSON
      const jsonResponse = await response.json();
      console.log('simpleFetch: Resposta JSON recebida:', jsonResponse);
      
      // Garantir que as respostas de sucesso tenham o formato correto
      if (response.status >= 200 && response.status < 300) {
        // Se a resposta já estiver no formato esperado (success, message, etc), retornar diretamente
        if (jsonResponse.success !== undefined) {
          return jsonResponse;
        }
        
        // Para respostas 200/201 que não seguem o padrão, formatar no padrão esperado
        return {
          success: true,
          message: jsonResponse.message || 'Operação realizada com sucesso',
          data: jsonResponse.data || jsonResponse,
          id: jsonResponse.id
        };
      }
      
      return jsonResponse;
    } else {
      // Se não for JSON, retornar um objeto simples
      return { 
        success: true,
        message: 'Operação realizada com sucesso'
      };
    }
  } catch (error: any) {
    console.error('simpleFetch: Erro:', error);
    
    // Se já é um erro formatado, repassar
    if (error.status && error.response) {
      throw error;
    }
    
    // Erro não mapeado
    throw {
      status: 500,
      response: { 
        data: { 
          error: {
            code: 500,
            message: error.message || 'Erro desconhecido'
          }
        } 
      },
      message: error.message || 'Erro desconhecido ao processar requisição'
    };
  }
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Usar a função getAuthToken para obter o token
    const token = getAuthToken();
    if (token) {
      config.headers = config.headers || {};
      
      // Usar o mesmo formato simples que na função simpleFetch
      config.headers.Authorization = `Bearer ${token.trim()}`;
      console.log(`axios: Enviando token: ${config.headers.Authorization}`);
    }
    
    // Adicionar Content-Type apenas para métodos que enviam dados
    if (config.method && ['post', 'put'].includes(config.method.toLowerCase()) && config.data) {
      config.headers = config.headers || {};
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (!error.response || error.message.includes('Network Error') || error.code === 'ERR_NETWORK') {
      console.error('axios: Erro de rede:', error.message);
      return Promise.reject({
        status: 0,
        response: { 
          data: { 
            error: {
              code: 0,
              message: 'Erro de conexão com o servidor.'
            }
          } 
        },
        message: 'Erro de conexão com o servidor.'
      });
    }
    
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        console.log('axios: Token inválido ou expirado');
        // Remover tokens inválidos
        try {
          Cookies.remove('token');
          Cookies.remove('user');
        } catch (e) {
          console.error('Erro ao remover tokens:', e);
        }
        
        // Redirecionar para a página de login
        window.location.href = '/auth/login';
      }
    }
    
    // Garantir que o erro esteja no formato esperado
    if (error.response?.data) {
      const responseData = error.response.data as any;
      
      // Se o erro não estiver no formato esperado, formatar
      if (!responseData.error) {
        const formattedError = {
          status: error.response.status,
          response: {
            data: {
              error: {
                code: error.response.status,
                message: responseData.message || `Erro ${error.response.status}`
              }
            }
          },
          message: responseData.message || `Erro ${error.response.status}`
        };
        
        return Promise.reject(formattedError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 