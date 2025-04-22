'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { addressService } from '@/services/addressService';
import { customerService } from '@/services/customerService';
import { Address } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Plus, Edit, Trash } from 'lucide-react';
import { handleApiError } from '@/lib/utils/error-handler';

export default function CustomerAddressesPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = Number(params.id);
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Buscar os dados do cliente e seus endereços
  useEffect(() => {
    const fetchData = async () => {
      if (!customerId || isNaN(customerId)) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Buscar dados do cliente
        const customerResponse = await customerService.getById(customerId);
        setCustomer(customerResponse.data);
        
        // Buscar endereços do cliente usando a rota /addresses/customer/:id
        const addressesResponse = await addressService.getAddressesByCustomer(customerId);
        console.log('Resposta dos endereços:', addressesResponse);
        
        // Objeto padrão da resposta é: {success: true, data: [...endereços]}
        // O array de data pode vir vazio
        if (addressesResponse && addressesResponse.success && addressesResponse.data) {
          setAddresses(Array.isArray(addressesResponse.data) ? addressesResponse.data : []);
          
          // Mostrar mensagem de sucesso se tiver endereços
          if (Array.isArray(addressesResponse.data) && addressesResponse.data.length > 0) {
            setSuccessMessage(`${addressesResponse.data.length} endereço(s) encontrado(s).`);
          } else {
            setSuccessMessage('Nenhum endereço encontrado para este cliente.');
          }
        } else {
          setAddresses([]);
          setSuccessMessage('Nenhum endereço encontrado para este cliente.');
        }
      } catch (err) {
        const errorResponse = handleApiError(err);
        setError(errorResponse.error.message);
        setAddresses([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [customerId]);
  
  // Função para excluir um endereço
  const handleDeleteAddress = async (addressId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este endereço?')) {
      try {
        await addressService.delete(addressId);
        // Atualizar a lista de endereços após excluir
        setAddresses(addresses.filter(address => address.id !== addressId));
        setSuccessMessage('Endereço excluído com sucesso!');
      } catch (err) {
        const errorResponse = handleApiError(err);
        setError(errorResponse.error.message);
      }
    }
  };
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-secondary-500">Carregando endereços...</p>
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
            <h1 className="text-2xl font-bold text-secondary-900">
              Endereços de {customer?.name || 'Cliente'}
            </h1>
          </div>
          <Link href={`/customers/${customerId}/addresses/new`}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Endereço
            </Button>
          </Link>
        </div>
        
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-6">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {addresses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Rua
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Bairro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Cidade/UF
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      CEP
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {addresses.map((address) => (
                    <tr key={address.id} className="hover:bg-secondary-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {address.street}
                        {address.address_line && <span className="text-secondary-500 ml-1">({address.address_line})</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {address.number} {address.complement && `(${address.complement})`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {address.neighborhood}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {address.city}/{address.state}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {address.zipcode.replace(/(\d{5})(\d{3})/, '$1-$2')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/customers/${customerId}/addresses/${address.id}`}>
                            <Button variant="ghost" size="sm">
                              <MapPin className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/customers/${customerId}/addresses/${address.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteAddress(address.id)}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-secondary-500">
              <MapPin className="mx-auto h-12 w-12 mb-3 opacity-20" />
              <p>Nenhum endereço encontrado</p>
              <div className="mt-4">
                <Link href={`/customers/${customerId}/addresses/new`}>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Endereço
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 