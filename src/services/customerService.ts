import { simpleFetch } from './api';
import type { 
  Customer, 
  CustomerCreateInput, 
  CustomerUpdateInput, 
  ApiResponse, 
  PaginatedResponse 
} from '@/types';

// Interface para a resposta de criação de cliente
export interface CreateCustomerResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
  } | number;  // Pode ser um objeto com id ou o id diretamente
}

export const customerService = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<Customer>> => {
    try {
      return await simpleFetch(`/customers?page=${page}&limit=${limit}`, 'GET');
    } catch (error: any) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  },
  
  getById: async (id: number): Promise<ApiResponse<Customer>> => {
    try {
      return await simpleFetch(`/customers/${id}`, 'GET');
    } catch (error: any) {
      console.error(`Erro ao buscar cliente ${id}:`, error);
      throw error;
    }
  },
  
  create: async (data: CustomerCreateInput): Promise<CreateCustomerResponse> => {
    try {
      // Garantir que todos os campos são enviados como string
      const customerData = {
        ...data,
        cpf: String(data.cpf),
        phone: String(data.phone),
        rg: data.rg ? String(data.rg) : undefined,  // RG é opcional
      };
      
      console.log('Dados enviados para criação de cliente:', customerData);
      
      const response = await simpleFetch('/customers', 'POST', customerData);
      console.log('Resposta bruta da API (criação):', response);
      
      // Verificar a estrutura da resposta
      if (response && typeof response === 'object') {
        if (!response.success && response.status === 201) {
          // Adaptação para o caso de resposta com status HTTP 201 mas sem campo success
          return {
            success: true,
            message: 'Cliente criado com sucesso',
            data: response.data || response.id || 0
          } as CreateCustomerResponse;
        }
      }
      
      return response as CreateCustomerResponse;
    } catch (error: any) {
      console.error('Erro ao criar cliente:', error);
      
      // Capturar o status HTTP e outros detalhes do erro
      const statusCode = error.status || 500;
      
      // Log detalhado para depuração
      console.error(`Status HTTP: ${statusCode}`, error.response?.data);
      
      // Repassar o erro com o status para tratamento no componente
      throw {
        ...error,
        status: statusCode
      };
    }
  },
  
  update: async (id: number, data: CustomerUpdateInput): Promise<ApiResponse<Customer>> => {
    try {
      // Garantir que todos os campos são enviados como string
      const customerData = {
        ...data,
        cpf: data.cpf ? String(data.cpf) : undefined,
        phone: data.phone ? String(data.phone) : undefined,
        rg: data.rg ? String(data.rg) : undefined,  // RG é opcional
      };
      
      console.log(`Dados enviados para atualização do cliente ${id}:`, customerData);
      
      return await simpleFetch(`/customers/${id}`, 'PUT', customerData);
    } catch (error: any) {
      console.error(`Erro ao atualizar cliente ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    try {
      return await simpleFetch(`/customers/${id}`, 'DELETE');
    } catch (error: any) {
      console.error(`Erro ao remover cliente ${id}:`, error);
      throw error;
    }
  }
}; 