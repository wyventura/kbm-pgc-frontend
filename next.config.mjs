/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  /* config options here */
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

export default nextConfig; 