'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema } from '@/lib/validations/address';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Address, AddressCreateInput, AddressUpdateInput } from '@/types';

interface AddressFormProps {
  address?: Address;
  customerId: number;
  onSubmit: (data: AddressCreateInput) => Promise<void>;
  isLoading: boolean;
}

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export function AddressForm({ address, customerId, onSubmit, isLoading }: AddressFormProps) {
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AddressCreateInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      customer_id: customerId,
      zipcode: address?.zipcode || '',
      street: address?.street || '',
      number: address?.number || '',
      complement: address?.complement || '',
      neighborhood: address?.neighborhood || '',
      city: address?.city || '',
      state: address?.state || '',
    },
  });

  const zipcode = watch('zipcode');

  // Função para buscar endereço pelo CEP usando a API ViaCEP
  const fetchAddressByCep = async (cep: string) => {
    if (!cep || cep.length !== 8) {
      setCepError('CEP deve ter 8 dígitos');
      return;
    }

    setIsLoadingCep(true);
    setCepError(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data: ViaCepResponse = await response.json();

      if (data.erro) {
        setCepError('CEP não encontrado');
        return;
      }

      // Preencher os campos com os dados retornados
      setValue('street', data.logradouro);
      setValue('neighborhood', data.bairro);
      setValue('city', data.localidade);
      setValue('state', data.uf);
      
      // Se tiver complemento, preencher também
      if (data.complemento) {
        setValue('complement', data.complemento);
      }
      
      // Foco no campo de número após preencher o endereço
      document.getElementById('number')?.focus();
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setCepError('Erro ao buscar CEP. Tente novamente.');
    } finally {
      setIsLoadingCep(false);
    }
  };

  // Função para formatar o CEP enquanto o usuário digita
  const formatCep = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove não-números
    if (value.length > 8) value = value.substring(0, 8);
    e.target.value = value;
    setValue('zipcode', value);
  };

  // Verificar o CEP quando ele tiver 8 dígitos
  const handleCepBlur = () => {
    if (zipcode && zipcode.length === 8) {
      fetchAddressByCep(zipcode);
    }
  };

  const handleFormSubmit = (data: AddressCreateInput) => {
    // Mesmo em edição, enviaremos o objeto completo
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="zipcode" className="block text-sm font-medium text-secondary-700">
            CEP
          </label>
          <div className="relative">
            <Input
              id="zipcode"
              type="text"
              placeholder="00000000"
              maxLength={8}
              error={errors.zipcode?.message || (cepError || undefined)}
              {...register('zipcode')}
              onChange={formatCep}
              onBlur={handleCepBlur}
              disabled={isLoadingCep}
            />
            {isLoadingCep && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-5 w-5 border-2 border-secondary-500 rounded-full border-t-transparent"></div>
              </div>
            )}
          </div>
          {cepError && <p className="text-xs text-red-500 mt-1">{cepError}</p>}
          <p className="text-xs text-secondary-500">Digite apenas números</p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="street" className="block text-sm font-medium text-secondary-700">
            Rua
          </label>
          <Input
            id="street"
            type="text"
            placeholder="Nome da rua"
            error={errors.street?.message}
            {...register('street')}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="number" className="block text-sm font-medium text-secondary-700">
            Número
          </label>
          <Input
            id="number"
            type="text"
            placeholder="Número"
            error={errors.number?.message}
            {...register('number')}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="complement" className="block text-sm font-medium text-secondary-700">
            Complemento
          </label>
          <Input
            id="complement"
            type="text"
            placeholder="Apartamento, bloco, etc. (opcional)"
            error={errors.complement?.message}
            {...register('complement')}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="neighborhood" className="block text-sm font-medium text-secondary-700">
            Bairro
          </label>
          <Input
            id="neighborhood"
            type="text"
            placeholder="Bairro"
            error={errors.neighborhood?.message}
            {...register('neighborhood')}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="city" className="block text-sm font-medium text-secondary-700">
            Cidade
          </label>
          <Input
            id="city"
            type="text"
            placeholder="Cidade"
            error={errors.city?.message}
            {...register('city')}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="state" className="block text-sm font-medium text-secondary-700">
            Estado
          </label>
          <Input
            id="state"
            type="text"
            placeholder="UF"
            maxLength={2}
            error={errors.state?.message}
            {...register('state')}
          />
        </div>
      </div>

      <input type="hidden" {...register('customer_id')} value={customerId} />

      <div className="flex justify-end mt-6">
        <Button type="submit" isLoading={isLoading}>
          {address ? 'Atualizar Endereço' : 'Cadastrar Endereço'}
        </Button>
      </div>
    </form>
  );
} 