/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  eslint: {
    // Desabilitar a verificação do ESLint durante o build
    ignoreDuringBuilds: true,
  },
  // Não usar export para permitir páginas dinâmicas
  images: {
    unoptimized: true,
  },
  // Desabilitar indicadores de desenvolvimento (botão flutuante)
  devIndicators: {
    buildActivity: false,
  },
  // As rotas de API precisam ser configuradas no nginx
  async rewrites() {
    return [
      {
        // Redirecionar todas as chamadas para /api/* para o servidor backend
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://api-kbmpgd.fwsistemas.com'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig; 