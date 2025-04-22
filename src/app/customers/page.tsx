'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { customerService } from '@/services/customerService';
import { Customer } from '@/types';
import Link from 'next/link';
import { Edit, Trash2, Plus, Search, Eye } from 'lucide-react';

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 10;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['customers', page, searchQuery],
    queryFn: () => customerService.getAll(page, limit),
  });

  const customers = data?.data?.items || [];
  const totalPages = data?.data?.pages || 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(search);
    setPage(1);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await customerService.delete(id);
        refetch();
        alert('Cliente excluído com sucesso!');
      } catch (error) {
        alert('Erro ao excluir cliente');
        console.error(error);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-secondary-900">Clientes</h1>
          <Link href="/customers/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="secondary">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </form>
          </div>

          {isLoading ? (
            <div className="py-8 text-center">
              <p className="text-secondary-500">Carregando...</p>
            </div>
          ) : customers.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="text-xs text-secondary-700 bg-secondary-50 uppercase">
                    <tr>
                      <th className="px-6 py-3 text-left">Nome</th>
                      <th className="px-6 py-3 text-left">CPF</th>
                      <th className="px-6 py-3 text-left">Nascimento</th>
                      <th className="px-6 py-3 text-left">Telefone</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200">
                    {customers.map((customer: Customer) => (
                      <tr key={customer.id} className="hover:bg-secondary-50">
                        <td className="px-6 py-4 whitespace-nowrap">{customer.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {customer.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {customer.date_birth_formatted || new Date(customer.date_birth).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {customer.phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${customer.enable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {customer.enable ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex space-x-2 justify-end">
                            <Link href={`/customers/${customer.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/customers/${customer.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(customer.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 flex justify-between items-center border-t">
                <div>
                  <p className="text-sm text-secondary-500">
                    Mostrando {customers.length} de {data?.data?.total || 0} resultados
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-3 py-1 text-sm">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-secondary-500">Nenhum cliente encontrado</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 