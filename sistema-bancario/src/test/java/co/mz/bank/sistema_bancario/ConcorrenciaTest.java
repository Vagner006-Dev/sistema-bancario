package co.mz.bank.sistema_bancario;

import co.mz.bank.sistema_bancario.dto.Requests.AbrirContaRequest;
import co.mz.bank.sistema_bancario.exception.RegraNegocioException;
import co.mz.bank.sistema_bancario.model.Cliente;
import co.mz.bank.sistema_bancario.repository.ContaRepository;
import co.mz.bank.sistema_bancario.service.ClienteService;
import co.mz.bank.sistema_bancario.service.ContaService;
import co.mz.bank.sistema_bancario.service.SaldoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;

// Atenção: NÃO usar @Transactional nesta classe, senão as threads não veem os dados.
@SpringBootTest
class ConcorrenciaTest {

    @Autowired ClienteService clienteService;
    @Autowired ContaService contaService;
    @Autowired SaldoService saldoService;
    @Autowired ContaRepository contaRepo;

    // ---------- Teste 1: depósitos simultâneos na mesma conta ----------
    @Test
    void depositosSimultaneos_somamOsDois() throws Exception {
        String conta = novaConta("0.00");

        List<Runnable> tarefas = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            tarefas.add(() -> saldoService.creditar(conta, new BigDecimal("100.00")));
        }
        int sucessos = executarEmParalelo(tarefas);

        assertEquals(10, sucessos);
        assertSaldo("1000.00", conta);   // nenhum depósito se perdeu
    }

    // ---------- Teste 2: duas transferências, saldo só para uma ----------
    @Test
    void transferenciasSimultaneas_saldoSoParaUma() throws Exception {
        String origem = novaConta("100.00");
        String destino = novaConta("0.00");

        List<Runnable> tarefas = new ArrayList<>();
        for (int i = 0; i < 2; i++) {
            tarefas.add(() -> saldoService.transferir(origem, destino, new BigDecimal("100.00"), "1234"));
        }
        int sucessos = executarEmParalelo(tarefas);

        assertEquals(1, sucessos);        // uma aceite, a outra rejeitada
        assertSaldo("0.00", origem);      // o saldo nunca fica negativo
        assertSaldo("100.00", destino);
    }

    // ---------- Teste 3: transferências cruzadas A→B e B→A ----------
    @Test
    void transferenciasCruzadas_naoFicamBloqueadas() throws Exception {
        String a = novaConta("1000.00");
        String b = novaConta("1000.00");

        List<Runnable> tarefas = new ArrayList<>();
        for (int i = 0; i < 20; i++) {
            tarefas.add(() -> saldoService.transferir(a, b, new BigDecimal("10.00"), "1234"));
            tarefas.add(() -> saldoService.transferir(b, a, new BigDecimal("10.00"), "1234"));
        }
        int sucessos = executarEmParalelo(tarefas);   // com deadlock, daria timeout

        assertEquals(40, sucessos);
        assertSaldo("1000.00", a);        // 20 saídas e 20 entradas de 10
        assertSaldo("1000.00", b);
    }

    // ================= Métodos auxiliares =================

    /** Todas as threads esperam na "linha de partida" e arrancam ao mesmo tempo. */
    private int executarEmParalelo(List<Runnable> tarefas) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(tarefas.size());
        CountDownLatch prontas = new CountDownLatch(tarefas.size());
        CountDownLatch partida = new CountDownLatch(1);
        List<Future<Boolean>> futuros = new ArrayList<>();

        for (Runnable t : tarefas) {
            futuros.add(pool.submit(() -> {
                prontas.countDown();
                partida.await();
                try {
                    t.run();
                    return true;
                } catch (RegraNegocioException e) {
                    return false;   // rejeitada pelas regras (ex.: saldo insuficiente)
                }
            }));
        }

        prontas.await();
        partida.countDown();

        int sucessos = 0;
        for (Future<Boolean> f : futuros) {
            if (f.get(30, TimeUnit.SECONDS)) sucessos++;   // timeout = deadlock detectado
        }
        pool.shutdown();
        return sucessos;
    }

    private String novaConta(String saldoInicial) {
        Cliente c = new Cliente();
        c.setNome("Teste");
        c.setNumeroBi(UUID.randomUUID().toString().substring(0, 14));
        c.setTelefone("840000000");
        c.setEmail("t@mail.com");
        c = clienteService.criar(c);
        return contaService.abrir(c.getId(),
                new AbrirContaRequest("1234", new BigDecimal(saldoInicial))).getNumero();
    }

    private void assertSaldo(String esperado, String numeroConta) {
        BigDecimal real = contaRepo.findByNumero(numeroConta).orElseThrow().getSaldo();
        assertEquals(0, new BigDecimal(esperado).compareTo(real),
                "Saldo esperado " + esperado + " mas foi " + real);
    }
}