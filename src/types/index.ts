// Customer types
export interface Customer {
  id: number;
  name: string;
  date_birth: string;
  cpf: string;
  rg: string;
  phone: string;
  enable: boolean;
  user_id: number;
  date_birth_formatted?: string;
}

export interface CustomerCreateInput {
  name: string;
  date_birth: string;
  cpf: string;
  rg: string;
  phone: string;
}

export interface CustomerUpdateInput {
  name?: string;
  date_birth?: string;
  cpf?: string;
  rg?: string;
  phone?: string;
}

// Resposta de criação de cliente
export interface CreateCustomerResponse {
  success: boolean;
  message: string;
  id?: string;
  error?: {
    message: string;
  };
}

// Address types
export interface Address {
  id: number;
  customer_id: number;
  zipcode: string;
  street: string;
  number: string;
  address_line?: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface AddressCreateInput {
  customer_id: number;
  zipcode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface AddressUpdateInput {
  zipcode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

// User and Authentication types
export interface User {
  id: number;
  name: string;
  email: string;
  enable: boolean;
}

export interface Login {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ErrorResponse {
  success: boolean;
  error: {
    code: number;
    message: string;
    errors?: Record<string, string[]>;
  };
} 