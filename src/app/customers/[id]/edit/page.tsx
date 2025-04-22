'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { CustomerForm } from '@/components/forms/customer-form';
import { customerService } from '@/services/customerService';
import { CustomerUpdateInput } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { handleApiError } from '@/lib/utils/error-handler';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = Number(params.id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: customerData, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customerService.getById(customerId),
    enabled: !!customerId && !isNaN(customerId),
  });

  const customer = customerData?.data;

  const handleSubmit = async (data: CustomerUpdateInput) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await customerService.update(customerId, data);
      // Exibir mensagem de sucesso
      setSuccessMessage(response.message || "Cliente atualizado com sucesso!");
      
      // Aguardar 1.5 segundos antes de redirecionar para a página de detalhes
      setTimeout(() => {
        router.push(`/customers/${customerId}`);
      }, 1500);
    } catch (err) {
      const errorResponse = handleApiError(err);
      setError(errorResponse.error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingCustomer) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-secondary-500">Carregando dados do cliente...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            Cliente não encontrado.
          </div>
          <Link href="/customers">
            <Button variant="primary">Voltar para lista de clientes</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/customers/${customerId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para detalhes
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-secondary-900">Editar Cliente</h1>
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-6 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <CustomerForm 
            customer={customer} 
            onSubmit={handleSubmit} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </DashboardLayout>
  );
} 