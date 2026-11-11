import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Onde estão os serviços do backend (podem mudar-se com variáveis de ambiente)
const CONTAS = process.env.CONTAS_URL || 'http://localhost:8080';
const TRANSACCOES = process.env.TRANSACCOES_URL || 'http://localhost:8081';

// O navegador fala só com este servidor; ele reencaminha para os serviços.
// Assim não é preciso configurar CORS no backend.
const proxy = {
  '/contas-api': {
    target: CONTAS,
    changeOrigin: true,
    rewrite: (p) => p.replace(/^\/contas-api/, ''),
  },
  '/transaccoes-api': {
    target: TRANSACCOES,
    changeOrigin: true,
    rewrite: (p) => p.replace(/^\/transaccoes-api/, ''),
  },
};

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy },
  preview: { port: 5173, proxy },
});
