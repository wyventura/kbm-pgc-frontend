import { AxiosError } from 'axios';
import { ErrorResponse } from '@/types';

export function handleApiError(error: unknown): ErrorResponse {
  // Se for um erro do Axios com dados de resposta
  if (error instanceof AxiosError && error.response?.data) {
    const responseData = error.response.data as any;
    
    // Se já estiver no formato esperado
    if (responseData.error) {
      return responseData as ErrorResponse;
    }
    
    // Formatar no formato esperado
    return {
      success: false,
      error: {
        code: error.response.status,
        message: responseData.message || error.message || 'Ocorreu um erro inesperado'
      }
    };
  }
  
  // Se for um erro customizado do simpleFetch
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const customError = error as any;
    if (customError.response?.data) {
      // Se já estiver no formato esperado
      if (customError.response.data.error) {
        return customError.response.data as ErrorResponse;
      }
      
      // Formatar no formato esperado
      return {
        success: false,
        error: {
          code: customError.status || 500,
          message: customError.message || 'Ocorreu um erro inesperado'
        }
      };
    }
  }
  
  // Erro genérico
  return {
    success: false,
    error: {
      code: 500,
      message: error instanceof Error 
        ? error.message 
        : 'Ocorreu um erro inesperado'
    }
  };
} 