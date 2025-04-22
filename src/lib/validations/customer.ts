import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  date_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (formato: YYYY-MM-DD)'),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos').max(11, 'CPF deve ter 11 dígitos'),
  rg: z.string()
       .regex(/^[0-9X.-]+$/, 'RG deve conter apenas números, X, pontos ou hífens')
       .min(5, 'RG deve ter pelo menos 5 caracteres')
       .max(15, 'RG deve ter no máximo 15 caracteres')
       .optional(),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos').max(11, 'Telefone deve ter no máximo 11 dígitos')
}); 