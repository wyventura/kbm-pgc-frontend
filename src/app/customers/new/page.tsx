'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { CustomerForm } from '@/components/forms/customer-form';
import { customerService } from '@/services/customerService';
import { CustomerCreateInput, CustomerUpdateInput, CreateCustomerResponse } from '@/types';
import { useRouter } from 'next/navigation';
import { handleApiError } from '@/lib/utils/error-handler';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function NewCustomerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{message: string, id: number} | null>(null);
  const router = useRouter();

  const handleSubmit = async (data: CustomerCreateInput | CustomerUpdateInput) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Forçar o tipo para CustomerCreateInput
      const createData = data as CustomerCreateInput;
      const response = await customerService.create(createData);
      
      console.log('Resposta da API:', response);
      
      // Verificar se a resposta foi bem-sucedida
      if (response.success) {
        // Verificar o formato real da resposta
        let clienteId = 0;
        
        if (response.data && typeof response.data === 'object') {
          // Se temos um objeto na propriedade data
          if ('id' in response.data) {
            clienteId = response.data.id;
          }
        } else if (typeof response.data === 'number') {
          // Se data é diretamente o ID
          clienteId = response.data;
        }
        
        setSuccess({
          message: response.message || 'Cliente criado com sucesso!',
          id: clienteId
        });
        
        // Redirecionar para a página de clientes após 2 segundos
        setTimeout(() => {
          if (clienteId) {
            router.push(`/customers/${clienteId}`);
          } else {
            router.push('/customers');
          }
        }, 2000);
      } else {
        // Tratamento para quando a resposta não tem sucesso
        // @ts-ignore - ignorando o erro de tipo para manter a lógica original
        setError('Erro ao criar cliente: ' + (response.error?.message || 'Ocorreu um erro desconhecido'));
      }
    } catch (err: any) {
      const errorResponse = handleApiError(err);
      
      // Verificar o tipo de erro baseado no status HTTP
      if (err.status === 400) {
        // Erro de validação ou dados inválidos
        setError('Dados inválidos: ' + errorResponse.error.message);
      } else if (err.status === 500) {
        // Erro interno do servidor
        setError('Erro no servidor: Por favor, tente novamente mais tarde.');
      } else {
        // Outros erros
        setError(errorResponse.error.message || 'Erro ao criar cliente');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/customers">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-secondary-900">Adicionar Novo Cliente</h1>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-6 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">{success.message}</p>
              <p className="text-sm">Redirecionando para a página do cliente...</p>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <CustomerForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </DashboardLayout>
  );
} 