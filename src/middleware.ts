import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Esta função é executada no lado do servidor, não tem acesso ao localStorage
// Vamos verificar a existência de cookies ou de um cabeçalho específico
export async function middleware(req: NextRequest) {
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
  const isRootPage = req.nextUrl.pathname === '/';

  // Sempre redireciona a raiz para a página de login
  if (isRootPage) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Verifica se tem o token no cookie ou header (simulando uma detecção de autenticação)
  // Na prática, esta verificação deve ser feita na API
  const token = req.cookies.get('token')?.value || 
                req.headers.get('Authorization')?.replace('Bearer ', '');

  if (isAuthPage) {
    // Se estiver em uma página de autenticação e tiver o token, redireciona para o dashboard
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // Se tentar acessar uma página protegida sem o token, redireciona para o login
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/customers/:path*',
    '/profile/:path*',
    '/auth/:path*'
  ],
}; 