import api, { simpleFetch } from './api';
import type { 
  Address, 
  AddressCreateInput, 
  AddressUpdateInput, 
  ApiResponse, 
  PaginatedResponse 
} from '@/types';

// Interface para resposta de criação de endereço
interface CreateAddressResponse {
  success: boolean;
  message: string;
  id: string;
}

// Interface para resposta de atualização de endereço
interface UpdateAddressResponse {
  success: boolean;
  message: string;
  id: string;
}

export const addressService = {
  getAllByCustomerId: async (customerId: number, page = 1, limit = 10): Promise<PaginatedResponse<Address>> => {
    const response = await api.get(`/customers/${customerId}/addresses?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  getAddressesByCustomer: async (customerId: number): Promise<ApiResponse<Address[]>> => {
    try {
      // Obter os dados usando a rota correta /addresses/customer/:id
      const response = await simpleFetch(`/addresses/customer/${customerId}`, 'GET');
      console.log('Resposta da API addresses/customer:', response);
      
      // A resposta deve seguir o formato padrão {success: true, data: [...]}
      // onde data pode ser um array vazio
      return response;
    } catch (error: any) {
      console.error(`Erro ao buscar endereços do cliente ${customerId}:`, error);
      throw error;
    }
  },
  
  getById: async (id: number): Promise<ApiResponse<Address>> => {
    try {
      return await simpleFetch(`/addresses/${id}`, 'GET');
    } catch (error: any) {
      console.error(`Erro ao buscar endereço ${id}:`, error);
      throw error;
    }
  },
  
  create: async (data: AddressCreateInput): Promise<CreateAddressResponse> => {
    try {
      return await simpleFetch('/addresses', 'POST', data);
    } catch (error: any) {
      console.error('Erro ao criar endereço:', error);
      throw error;
    }
  },
  
  update: async (id: number, data: AddressUpdateInput): Promise<UpdateAddressResponse> => {
    try {
      // Utilizar a rota correta /addresses/{id}
      console.log('Enviando update para endereço:', id, data);
      return await simpleFetch(`/addresses/${id}`, 'PUT', data);
    } catch (error: any) {
      console.error(`Erro ao atualizar endereço ${id}:`, error);
      throw error;
    }
  },
  
  delete: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  }
}; 