# Backoffice – Premium Bank (React)

Backoffice web para os funcionários: clientes, contas, depósitos, extracto, bloquear/desbloquear e auditoria.

## Como correr

Requisitos: Node.js 18 ou superior, e os dois serviços do backend a correr
(Contas na porta 8080 e Transacções na porta 8081).

    npm install
    npm run dev

Abrir http://localhost:5173 e entrar com o funcionário (por exemplo `admin@banco.mz`).

O navegador fala só com o servidor do Vite, que reencaminha para o backend
(`/contas-api` para a porta 8080 e `/transaccoes-api` para a 8081), por isso não é preciso CORS.
Para apontar para outro servidor:

    $env:CONTAS_URL = "http://servidor:8080"
    $env:TRANSACCOES_URL = "http://servidor:8081"
    npm run dev

## O que faz

- **Clientes:** criar, editar, listar e pesquisar (nome, BI, telefone, email).
- **Abrir conta** para um cliente, com PIN inicial e saldo inicial (mostra o número da conta gerado).
- **Contas:** lista com saldo, bloquear e desbloquear, depósito e extracto.
- **Auditoria** (só ADMIN): quem fez que acção e quando.

Nota: bloquear e desbloquear precisam dos endpoints `PATCH /api/contas/{numero}/bloquear` e
`/desbloquear` no serviço de Contas (`ContaController`).
