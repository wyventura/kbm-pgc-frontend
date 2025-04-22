'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { customerService } from '@/services/customerService';
import { addressService } from '@/services/addressService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@/lib/utils/error-handler';
import { AddressCreateInput, AddressUpdateInput, Address } from '@/types';
import { Button } from '@/components/ui/button';
import { AddressForm } from '@/components/forms/address-form';
import Link from 'next/link';
import { ArrowLeft, Edit, Plus, Trash2, Mail, Phone, Calendar, UserCheck } from 'lucide-react';

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const customerId = Number(params.id);
  const [error, setError] = useState<string | null>(null);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const { data: customerData, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customerService.getById(customerId),
    enabled: !!customerId && !isNaN(customerId),
  });

  const { data: addressesData, isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['customerAddresses', customerId],
    queryFn: () => addressService.getAddressesByCustomer(customerId),
    enabled: !!customerId && !isNaN(customerId),
  });

  const createAddressMutation = useMutation({
    mutationFn: (data: AddressCreateInput) => addressService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerAddresses', customerId] });
      setIsAddressFormOpen(false);
      setSelectedAddress(null);
    },
    onError: (err) => {
      const errorResponse = handleApiError(err);
      setError(errorResponse.error.message);
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AddressUpdateInput }) => addressService.update(id, data),
    onSuccess: (data) => {
      console.log('Endereço atualizado com sucesso:', data);
      queryClient.invalidateQueries({ queryKey: ['customerAddresses', customerId] });
      setIsAddressFormOpen(false);
      setSelectedAddress(null);
      setError(null);
    },
    onError: (err) => {
      console.error('Erro ao atualizar endereço:', err);
      const errorResponse = handleApiError(err);
      setError(errorResponse.error.message);
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (addressId: number) => addressService.delete(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerAddresses', customerId] });
    },
    onError: (err) => {
      const errorResponse = handleApiError(err);
      setError(errorResponse.error.message);
    },
  });

  const handleDeleteCustomer = async () => {
    if (window.confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      try {
        await customerService.delete(customerId);
        router.push('/customers');
      } catch (err) {
        const errorResponse = handleApiError(err);
        setError(errorResponse.error.message);
      }
    }
  };

  const handleDeleteAddress = (addressId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este endereço?')) {
      deleteAddressMutation.mutate(addressId);
    }
  };

  const handleAddressSubmit = async (data: AddressCreateInput | AddressUpdateInput) => {
    if (selectedAddress) {
      updateAddressMutation.mutate({ id: selectedAddress.id, data: data as AddressUpdateInput });
    } else {
      createAddressMutation.mutate(data as AddressCreateInput);
    }
  };

  const customer = customerData?.data;
  const addresses = addressesData?.data || [];
  const isLoading = isLoadingCustomer || isLoadingAddresses;

  if (isLoading) {
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
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/customers">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-secondary-900">{customer.name}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={`/customers/${customerId}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Editar Cliente
              </Button>
            </Link>
            <Button variant="danger" onClick={handleDeleteCustomer}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir Cliente
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6 col-span-1">
            <h2 className="text-lg font-medium text-secondary-900 mb-4 pb-2 border-b">
              Informações do Cliente
            </h2>
            <dl className="space-y-4">
              <div className="flex items-start">
                <dt className="w-8">
                  <UserCheck className="h-5 w-5 text-secondary-500" />
                </dt>
                <dd>
                  <span className="block text-sm font-medium text-secondary-700">CPF</span>
                  <span className="block text-secondary-900">
                    {customer.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                  </span>
                </dd>
              </div>
              <div className="flex items-start">
                <dt className="w-8">
                  <Calendar className="h-5 w-5 text-secondary-500" />
                </dt>
                <dd>
                  <span className="block text-sm font-medium text-secondary-700">Data de Nascimento</span>
                  <span className="block text-secondary-900">
                    {customer.date_birth_formatted || new Date(customer.date_birth).toLocaleDateString('pt-BR')}
                  </span>
                </dd>
              </div>
              <div className="flex items-start">
                <dt className="w-8">
                  <Phone className="h-5 w-5 text-secondary-500" />
                </dt>
                <dd>
                  <span className="block text-sm font-medium text-secondary-700">Telefone</span>
                  <span className="block text-secondary-900">
                    {customer.phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
                  </span>
                </dd>
              </div>
              <div className="flex items-start">
                <dt className="w-8">
                  <Mail className="h-5 w-5 text-secondary-500" />
                </dt>
                <dd>
                  <span className="block text-sm font-medium text-secondary-700">RG</span>
                  <span className="block text-secondary-900">{customer.rg || '-'}</span>
                </dd>
              </div>
              <div className="pt-2 mt-2 border-t">
                <span className={`px-2 py-1 text-xs rounded-full ${customer.enable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {customer.enable ? 'Cliente Ativo' : 'Cliente Inativo'}
                </span>
              </div>
            </dl>
          </div>

          <div className="bg-white shadow rounded-lg p-6 col-span-2">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h2 className="text-lg font-medium text-secondary-900">Endereços</h2>
              <div className="flex items-center space-x-2">
                <Link href={`/customers/${customerId}/addresses`}>
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4 rotate-180" />
                    Ver Todos os Endereços
                  </Button>
                </Link>
                <Button
                  onClick={() => {
                    setIsAddressFormOpen(!isAddressFormOpen);
                    setSelectedAddress(null);
                  }}
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isAddressFormOpen ? 'Cancelar' : 'Adicionar Endereço'}
                </Button>
              </div>
            </div>

            {isAddressFormOpen && (
              <div className="mb-6 p-4 border rounded-md bg-secondary-50">
                <h3 className="font-medium mb-3 text-secondary-900">
                  {selectedAddress ? 'Editar Endereço' : 'Novo Endereço'}
                </h3>
                <AddressForm
                  address={selectedAddress || undefined}
                  customerId={customerId}
                  onSubmit={handleAddressSubmit}
                  isLoading={createAddressMutation.isPending || updateAddressMutation.isPending}
                />
              </div>
            )}

            {addresses.length > 0 ? (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="p-4 border rounded-md hover:bg-secondary-50">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-secondary-900">
                          {address.street}, {address.number}
                          {address.complement ? ` - ${address.complement}` : ''}
                          {address.address_line ? ` (${address.address_line})` : ''}
                        </p>
                        <p className="text-secondary-700">
                          {address.neighborhood}, {address.city} - {address.state}
                        </p>
                        <p className="text-sm text-secondary-500">
                          CEP: {address.zipcode.replace(/(\d{5})(\d{3})/, '$1-$2')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAddress(address);
                            setIsAddressFormOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAddress(address.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-secondary-500">
                <p>Este cliente não possui endereços cadastrados</p>
                {!isAddressFormOpen && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setIsAddressFormOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Endereço
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 