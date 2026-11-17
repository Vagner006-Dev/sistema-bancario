import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const CONTAS = process.env.CONTAS_URL || 'http://localhost:8080';
const TRANSACCOES = process.env.TRANSACCOES_URL || 'http://localhost:8081';

// o proxy evita problemas de CORS
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
