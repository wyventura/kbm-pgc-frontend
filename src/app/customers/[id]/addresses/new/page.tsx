'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AddressForm } from '@/components/forms/address-form';
import { addressService } from '@/services/addressService';
import { customerService } from '@/services/customerService';
import { AddressCreateInput } from '@/types';
import { handleApiError } from '@/lib/utils/error-handler';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function NewAddressPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = Number(params.id);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Buscar dados do cliente
  const { data: customerData, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customerService.getById(customerId),
    enabled: !!customerId && !isNaN(customerId),
  });

  const customer = customerData?.data;

  const handleSubmit = async (data: AddressCreateInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await addressService.create(data);
      setSuccessMessage(response.message || "Endereço criado com sucesso!");
      
      // Exibir o ID do endereço criado
      console.log(`Endereço criado com ID: ${response.id}`);
      
      // Aguardar 1.5 segundos antes de redirecionar
      setTimeout(() => {
        router.push(`/customers/${customerId}/addresses`);
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
            <Link href={`/customers/${customerId}/addresses`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para endereços
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-secondary-900">
              Novo Endereço para {customer.name}
            </h1>
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
          <AddressForm 
            customerId={customerId} 
            onSubmit={handleSubmit} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </DashboardLayout>
  );
} 