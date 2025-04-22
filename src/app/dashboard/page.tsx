'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Users, Home, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { customerService } from '@/services/customerService';

export default function DashboardPage() {
  const { data: customersData } = useQuery({
    queryKey: ['customers-summary'],
    queryFn: () => customerService.getAll(1, 5),
  });

  const customers = customersData?.data?.items || [];
  const totalCustomers = customersData?.data?.total || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-secondary-900">Bem-vindo ao Portal Administrativo</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard 
            title="Total de Clientes" 
            value={totalCustomers.toString()}
            icon={Users}
            iconColor="text-blue-500"
            bgColor="bg-blue-50"
          />
          <DashboardCard 
            title="Clientes Ativos" 
            value={(customers.filter(c => c.enable)).length.toString()}
            icon={Users}
            iconColor="text-green-500"
            bgColor="bg-green-50"
          />
          <DashboardCard 
            title="Endereços Cadastrados" 
            value="--"
            icon={Home}
            iconColor="text-primary-500"
            bgColor="bg-primary-50"
          />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-secondary-900">Clientes Recentes</h2>
          </div>
          
          {customers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-xs text-secondary-700 bg-secondary-50 uppercase">
                  <tr>
                    <th className="px-6 py-3 text-left">Nome</th>
                    <th className="px-6 py-3 text-left">CPF</th>
                    <th className="px-6 py-3 text-left">Nascimento</th>
                    <th className="px-6 py-3 text-left">Telefone</th>
                    <th className="px-6 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-200">
                  {customers.map((customer) => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-secondary-500">
              <FileText className="mx-auto h-12 w-12 mb-3 opacity-20" />
              <p>Nenhum cliente encontrado</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
}

function DashboardCard({ title, value, icon: Icon, iconColor, bgColor }: DashboardCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${bgColor} mr-4`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-secondary-500">{title}</p>
          <p className="text-2xl font-bold text-secondary-900">{value}</p>
        </div>
      </div>
    </div>
  );
} 