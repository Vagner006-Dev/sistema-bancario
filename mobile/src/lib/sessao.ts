import { useEffect } from 'react';
import { router } from 'expo-router';

// A sessão fica só em memória: ao fechar a app, o cliente entra de novo.
export const sessao: { token: string | null; numero: string | null } = {
  token: null,
  numero: null,
};

export function guardarSessao(token: string, numero: string) {
  sessao.token = token;
  sessao.numero = numero;
}

export function limparSessao() {
  sessao.token = null;
  sessao.numero = null;
}

// Usar no topo dos ecrãs que exigem login.
export function useExigirSessao() {
  useEffect(() => {
    if (!sessao.token) {
      router.replace('/');
    }
  }, []);
}
