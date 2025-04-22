# Portal de Clientes KBM

![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-blue)

Um portal de gerenciamento de clientes moderno e responsivo, construído com as tecnologias mais recentes para proporcionar uma experiência fluida tanto para o desenvolvedor quanto para o usuário final.

## 📋 Requisitos

- Node.js 18.x ou superior
- npm 9.x ou superior
- Um servidor para implantação (recomendamos Nginx)

## 🚀 Instalação

### Para desenvolvimento local

1. Clone o repositório:
   ```bash
   git clone https://github.com/sua-empresa/kbm-portal-de-clientes-frontend.git
   cd kbm-portal-de-clientes-frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   # Crie um arquivo .env.local baseado no exemplo
   cp .env.example .env.local
   
   # Edite o arquivo .env.local com suas configurações
   # NEXT_PUBLIC_API_URL=https://seu-backend-api.com
   ```

4. Inicie o ambiente de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Acesse a aplicação em [http://localhost:3000](http://localhost:3000)

## 🔨 Build e Implantação

### Gerando um build para produção

1. Crie o build otimizado:
   ```bash
   npm run build
   ```

2. Teste o build localmente:
   ```bash
   npm run start
   ```

### Implantar com Nginx

1. Transfira os arquivos da aplicação para o servidor:
   ```bash
   # Exemplo usando rsync
   rsync -avz --exclude 'node_modules' --exclude '.git' ./ usuario@seu-servidor:/caminho/para/aplicacao/
   ```

2. No servidor, instale as dependências e gere o build:
   ```bash
   cd /caminho/para/aplicacao
   npm install --production
   npm run build
   ```

3. Configure o Nginx como proxy reverso (exemplo de configuração):
   ```nginx
   server {
       listen 80;
       server_name seu-dominio.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # Para API externa
       location /api/ {
           proxy_pass https://api-kbmpgd.fwsistemas.com/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. Use PM2 para gerenciar o processo Node.js:
   ```bash
   # Instalar PM2 globalmente
   npm install -g pm2
   
   # Iniciar a aplicação com PM2
   pm2 start npm --name "portal-de-clientes" -- start
   
   # Configurar para iniciar automaticamente no boot
   pm2 startup
   pm2 save
   ```

5. Reinicie o Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

## 🧩 Estrutura do Projeto

```
kbm-portal-de-clientes-frontend/
├── .next/               # Build compilado (gerado após npm run build)
├── node_modules/        # Dependências do projeto
├── public/              # Arquivos estáticos
├── src/                 # Código-fonte da aplicação
│   ├── app/             # Componentes de página (App Router)
│   ├── components/      # Componentes reutilizáveis
│   ├── lib/             # Utilitários e funções auxiliares
│   ├── services/        # Serviços para comunicação com a API
│   └── types/           # Definições de tipos TypeScript
├── .env.local           # Variáveis de ambiente (local)
├── .eslintrc.json       # Configuração do ESLint
├── next.config.js       # Configuração do Next.js
├── package.json         # Dependências e scripts
└── tailwind.config.js   # Configuração do Tailwind CSS
```

## 📦 Principais Dependências

- **Next.js 15.3.1**: Framework React com renderização híbrida
- **React 19.0.0**: Biblioteca de UI para construção de interfaces
- **TypeScript 5.x**: Superset tipado do JavaScript
- **TailwindCSS 4.x**: Framework CSS utilitário
- **React Query**: Gerenciamento de estado assíncrono e cache
- **React Hook Form**: Gerenciamento avançado de formulários
- **Zod**: Validação de esquemas para TypeScript

## ⚙️ Configurações Importantes

### API e Proxying

A aplicação utiliza um servidor backend externo. As chamadas de API estão configuradas no `next.config.js` através de rewrites:

```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://api-kbmpgd.fwsistemas.com'}/:path*`,
    },
  ];
}
```

### Autenticação

A autenticação é gerenciada via tokens JWT armazenados em cookies e localStorage. O fluxo de autenticação está implementado em `/src/services/authService.ts`.

## 🔄 Processo de Desenvolvimento

1. Para iniciar uma nova feature:
   ```bash
   git checkout -b feature/nome-da-feature
   ```

2. Desenvolva com hot-reload:
   ```bash
   npm run dev
   ```

3. Execute o linting antes de commitar:
   ```bash
   npm run lint
   ```

## 📝 Notas Adicionais

- A aplicação usa o App Router do Next.js, o que permite a criação de layouts compartilhados e carregamento de componentes de forma eficiente.
- As operações CRUD são gerenciadas através dos serviços correspondentes em `/src/services/`.
- Para personalizar os estilos, edite o arquivo `tailwind.config.js`.
- **Integração com ViaCEP**: O formulário de endereços utiliza a API do ViaCEP para preenchimento automático dos campos de endereço a partir do CEP informado.

### Removendo o botão de feedback do Next.js

O botão flutuante do Next.js que aparece no canto inferior direito é apenas para ambientes de desenvolvimento. Para removê-lo:

1. Em ambientes de produção, ele não aparecerá após o build.

2. Para desenvolvimento, você pode adicionar o seguinte CSS ao seu arquivo global:
   ```css
   /* Em src/app/globals.css ou equivalente */
   #__next-feedback-gradient, #__next-build-watcher {
     display: none !important;
   }
   ```

3. Alternativamente, você pode desabilitar completamente o recurso no `next.config.js`:
   ```javascript
   module.exports = {
     devIndicators: {
       buildActivity: false,
       buildActivityPosition: 'bottom-right',
     },
     // ... outras configurações
   };
   ```

## 📋 Resolução de Problemas

### Erro "ENOSPC: no space left on device"

Este erro ocorre durante o build quando não há espaço suficiente no disco ou inode:

```bash
# Verifique o espaço em disco disponível
df -h

# Verifique o uso de inodes
df -i

# Limpe o cache do npm
npm cache clean --force
```

### Problemas com hot-reload

Se o hot-reload não estiver funcionando corretamente:

```bash
# Reinicie o servidor de desenvolvimento com turbo desativado
npm run dev -- --no-turbo
```

## 📞 Suporte

Para questões técnicas, contate nosso time de desenvolvimento em [dev@kbm.com.br](mailto:dev@kbm.com.br).
