'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validations/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Lock, User } from 'lucide-react';
import Cookies from 'js-cookie';
import { authService } from '@/services/authService';

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError('');

    try {
      // Usando o serviço de autenticação que usa axios
      await authService.login({
        email: data.email,
        password: data.password
      });
      
      // Se não houver erro, redirecionar para dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Erro no login:', error);

      // Tratamento de erros de resposta do servidor
      if (error.response) {
        // Erro de resposta do servidor
        const status = error.response.status;
        
        // Baseado no status HTTP
        if (status === 400) {
          // Erro de validação ou requisição inválida
          const errorMessage = error.response.data?.error?.message || 
                         error.response.data?.message || 
                         'Dados de login inválidos. Verifique suas credenciais.';
          setError(errorMessage);
        } else if (status === 401 || status === 403) {
          // Não autorizado ou proibido
          setError('Credenciais inválidas. Por favor, verifique seu email e senha.');
        } else if (status >= 500) {
          // Erro do servidor
          setError('Erro no servidor. Por favor, tente novamente mais tarde.');
        } else {
          // Outros erros
          setError('Erro ao fazer login. Por favor, tente novamente.');
        }
      } else if (error.isNetworkError) {
        // Erro de rede (sem conexão com o servidor)
        setError('Não foi possível conectar ao servidor. Verifique sua conexão de internet.');
      } else {
        // Erro não categorizado
        setError('Erro ao fazer login. Por favor, tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary-700 mb-2">Portal de Clientes</h1>
            <p className="text-secondary-600">Faça login para acessar o sistema</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-secondary-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  error={errors.email?.message}
                  className="pl-10"
                  {...register('email')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-secondary-400" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="******"
                  error={errors.password?.message}
                  className="pl-10"
                  {...register('password')}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              isLoading={isLoading}
            >
              Entrar
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-secondary-500">
            <p>Dados para teste:</p>
            <p>Email: usuario@exemplo.com</p>
            <p>Senha: qualquer senha</p>
          </div>
        </div>
      </div>
    </div>
  );
} 