# Backoffice - Premium Bank

Backoffice web em React (Vite) para os funcionários do banco.

Funciona assim:
- Clientes: criar, editar, listar e pesquisar
- Abrir conta para um cliente (PIN inicial e saldo inicial)
- Contas: listar, bloquear, desbloquear, depósito e extracto
- Auditoria (só ADMIN)

## Como correr

Precisa de Node.js 18+ e dos dois serviços do backend a correr (Contas na porta 8080, Transacções na 8081).

    npm install
    npm run dev

Abrir http://localhost:5173 e entrar com um funcionário (por exemplo admin@banco.mz).

Para usar outro servidor, definir CONTAS_URL e TRANSACCOES_URL antes de `npm run dev`.

Os endpoints de bloquear e desbloquear estão no ContaController do serviço de Contas.
