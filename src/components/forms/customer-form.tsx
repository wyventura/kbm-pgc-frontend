'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema } from '@/lib/validations/customer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Customer, CustomerCreateInput, CustomerUpdateInput } from '@/types';

// Tipo local que corresponde exatamente ao schema Zod
interface CustomerFormData {
  name: string;
  date_birth: string;
  cpf: string;
  phone: string;
  rg?: string; // Opcional, como definido no schema Zod
}

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CustomerCreateInput | CustomerUpdateInput) => Promise<void>;
  isLoading: boolean;
}

export function CustomerForm({ customer, onSubmit, isLoading }: CustomerFormProps) {
  // Estado para controlar os campos com máscaras visíveis ao usuário
  const [maskedInputs, setMaskedInputs] = useState({
    cpf: customer?.cpf ? formatCpfDisplay(customer.cpf) : '',
    phone: customer?.phone ? formatPhoneDisplay(customer.phone) : '',
    date_birth: customer?.date_birth ? formatDateDisplay(customer.date_birth) : '',
    rg: customer?.rg || '',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name || '',
      date_birth: customer?.date_birth || '',
      cpf: customer?.cpf || '',
      rg: customer?.rg || '',
      phone: customer?.phone || '',
    },
  });

  // Funções para formatar como o usuário vê os campos
  function formatCpfDisplay(cpf: string): string {
    if (!cpf) return '';
    const digits = cpf.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.substring(0, 3)}.${digits.substring(3)}`;
    if (digits.length <= 9) return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6)}`;
    return `${digits.substring(0, 3)}.${digits.substring(3, 6)}.${digits.substring(6, 9)}-${digits.substring(9, 11)}`;
  }

  function formatPhoneDisplay(phone: string): string {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
  }

  function formatDateDisplay(date: string): string {
    if (!date) return '';
    // Se já estiver no formato YYYY-MM-DD, converte para DD/MM/YYYY
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    }
    return date;
  }

  function formatRgDisplay(rg: string): string {
    if (!rg) return '';
    // Permitir números, X, pontos e hífens
    return rg.replace(/[^0-9X.-]/g, '');
  }

  // Funções para lidar com as mudanças nos campos mascarados
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formattedCpf = formatCpfDisplay(value);
    
    // Atualiza a máscara visual
    setMaskedInputs(prev => ({ ...prev, cpf: formattedCpf }));
    
    // Atualiza o valor real (sem formatação) para o formulário, mantendo como string
    setValue('cpf', value.substring(0, 11));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formattedPhone = formatPhoneDisplay(value);
    
    // Atualiza a máscara visual
    setMaskedInputs(prev => ({ ...prev, phone: formattedPhone }));
    
    // Atualiza o valor real (sem formatação) para o formulário, mantendo como string
    setValue('phone', value.substring(0, 11));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d\/]/g, '');
    
    // Converte formato DD/MM/YYYY para YYYY-MM-DD para o formulário
    const parts = value.split('/');
    let formattedDate = value;
    let dateForForm = '';
    
    if (parts.length === 3 && parts[2].length === 4) {
      // DD/MM/YYYY -> YYYY-MM-DD
      dateForForm = `${parts[2]}-${parts[1]}-${parts[0]}`;
    } else {
      // Adiciona as barras automaticamente
      if (value.length > 2 && !value.includes('/')) {
        value = `${value.substring(0, 2)}/${value.substring(2)}`;
      }
      if (value.length > 5 && value.indexOf('/', 3) === -1) {
        value = `${value.substring(0, 5)}/${value.substring(5)}`;
      }
      formattedDate = value;
    }
    
    // Atualiza a máscara visual
    setMaskedInputs(prev => ({ ...prev, date_birth: formattedDate }));
    
    // Se a data estiver completa, atualiza o formulário
    if (dateForForm && dateForForm.match(/^\d{4}-\d{2}-\d{2}$/)) {
      setValue('date_birth', dateForForm);
    }
  };

  const handleRgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitir números, X, pontos e hífens
    const value = e.target.value.replace(/[^0-9X.-]/g, '');
    
    // Atualiza a máscara visual
    setMaskedInputs(prev => ({ ...prev, rg: value }));
    
    // Atualiza o valor para o formulário
    setValue('rg', value);
  };

  // Função para processar o envio do formulário
  const processSubmit = (data: CustomerFormData) => {
    // Formatar a data de nascimento se estiver no formato brasileiro
    if (maskedInputs.date_birth && maskedInputs.date_birth.includes('/')) {
      const [day, month, year] = maskedInputs.date_birth.split('/');
      data.date_birth = `${year}-${month}-${day}`;
    }
    
    // Certificar-se de que CPF e telefone estão como strings sem formatação
    if (maskedInputs.cpf) {
      data.cpf = maskedInputs.cpf.replace(/\D/g, '');
    }
    
    if (maskedInputs.phone) {
      data.phone = maskedInputs.phone.replace(/\D/g, '');
    }
    
    // Garantir que o RG esteja formatado corretamente
    if (maskedInputs.rg) {
      data.rg = maskedInputs.rg;
    }
    
    console.log('Enviando dados do formulário:', data);
    
    // Converter para CustomerCreateInput
    const formattedData: CustomerCreateInput = {
      name: data.name,
      date_birth: data.date_birth,
      cpf: data.cpf,
      phone: data.phone,
      rg: data.rg || '', // Garantir que rg sempre tenha um valor, mesmo que vazio
    };
    
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-secondary-700">
            Nome Completo*
          </label>
          <Input
            id="name"
            type="text"
            placeholder="Nome completo do cliente"
            error={errors.name?.message}
            {...register('name')}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="date_birth" className="block text-sm font-medium text-secondary-700">
            Data de Nascimento*
          </label>
          <Input
            id="date_birth"
            type="text"
            placeholder="DD/MM/YYYY"
            value={maskedInputs.date_birth}
            onChange={handleDateChange}
            error={errors.date_birth?.message}
          />
          {errors.date_birth && (
            <p className="text-xs text-red-500 mt-1">{errors.date_birth.message}</p>
          )}
          <p className="text-xs text-secondary-500">Formato: DD/MM/YYYY</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="cpf" className="block text-sm font-medium text-secondary-700">
            CPF*
          </label>
          <Input
            id="cpf"
            type="text"
            placeholder="000.000.000-00"
            value={maskedInputs.cpf}
            onChange={handleCpfChange}
            error={errors.cpf?.message}
          />
          {errors.cpf && (
            <p className="text-xs text-red-500 mt-1">{errors.cpf.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="rg" className="block text-sm font-medium text-secondary-700">
            RG
          </label>
          <Input
            id="rg"
            type="text"
            placeholder="Documento de identidade"
            value={maskedInputs.rg}
            onChange={handleRgChange}
            error={errors.rg?.message}
          />
          {errors.rg && (
            <p className="text-xs text-red-500 mt-1">{errors.rg.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-secondary-700">
            Telefone*
          </label>
          <Input
            id="phone"
            type="text"
            placeholder="(00) 00000-0000"
            value={maskedInputs.phone}
            onChange={handlePhoneChange}
            error={errors.phone?.message}
          />
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button type="submit" isLoading={isLoading}>
          {customer ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
        </Button>
      </div>
    </form>
  );
} 