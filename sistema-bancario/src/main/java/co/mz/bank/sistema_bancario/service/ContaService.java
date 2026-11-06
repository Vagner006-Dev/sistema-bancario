package co.mz.bank.sistema_bancario.service;

import co.mz.bank.sistema_bancario.dto.Requests.AbrirContaRequest;
import co.mz.bank.sistema_bancario.dto.Requests.AlterarPinRequest;
import co.mz.bank.sistema_bancario.exception.RecursoNaoEncontradoException;
import co.mz.bank.sistema_bancario.exception.RegraNegocioException;
import co.mz.bank.sistema_bancario.model.Cliente;
import co.mz.bank.sistema_bancario.model.Conta;
import co.mz.bank.sistema_bancario.model.EstadoCliente;
import co.mz.bank.sistema_bancario.model.EstadoConta;
import co.mz.bank.sistema_bancario.repository.ContaRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class ContaService {

    private final ContaRepository repository;
    private final ClienteService clienteService;
    private final AuditoriaService auditoria;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public ContaService(ContaRepository repository, ClienteService clienteService,
                        AuditoriaService auditoria) {
        this.repository = repository;
        this.clienteService = clienteService;
        this.auditoria = auditoria;
    }

    @Transactional
    public Conta abrir(Long clienteId, AbrirContaRequest r) {
        Cliente cliente = clienteService.buscar(clienteId);
        if (cliente.getEstado() != EstadoCliente.ACTIVO)
            throw new RegraNegocioException("Cliente inactivo não pode abrir contas");

        Conta conta = new Conta();
        conta.setNumero(gerarNumeroUnico());
        conta.setCliente(cliente);
        conta.setPinHash(encoder.encode(r.pin()));
        conta.setSaldo(r.saldoInicial());
        Conta guardada = repository.save(conta);

        auditoria.registar("ABRIR_CONTA", "CONTA",
                "conta " + guardada.getNumero() + " do cliente " + cliente.getId()
                + ", saldo inicial " + guardada.getSaldo());
        return guardada;
    }

    public List<Conta> listarPorCliente(Long clienteId) {
        clienteService.buscar(clienteId);
        return repository.findByClienteId(clienteId);
    }

    public List<Conta> listarTodas() {
        return repository.findAll();
    }

    public Conta buscar(String numero) {
        return repository.findByNumero(numero)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Conta não encontrada: " + numero));
    }

    @Transactional
    public Conta bloquear(String numero) {
        Conta c = buscar(numero);
        c.setEstado(EstadoConta.BLOQUEADA);
        Conta guardada = repository.save(c);

        auditoria.registar("BLOQUEAR", "CONTA", "conta " + numero);
        return guardada;
    }

    @Transactional
    public Conta desbloquear(String numero) {
        Conta c = buscar(numero);
        c.setEstado(EstadoConta.ACTIVA);
        Conta guardada = repository.save(c);

        auditoria.registar("DESBLOQUEAR", "CONTA", "conta " + numero);
        return guardada;
    }

    /** Troca de PIN, obrigatória no primeiro acesso. O PIN nunca entra no registo. */
    @Transactional
    public Conta alterarPin(String numero, AlterarPinRequest r) {
        Conta c = buscar(numero);
        if (!encoder.matches(r.pinActual(), c.getPinHash()))
            throw new RegraNegocioException("PIN actual incorrecto");
        if (r.pinActual().equals(r.novoPin()))
            throw new RegraNegocioException("O novo PIN deve ser diferente do actual");

        c.setPinHash(encoder.encode(r.novoPin()));
        c.setPrimeiroAcesso(false);
        Conta guardada = repository.save(c);

        auditoria.registar("ALTERAR_PIN", "CONTA", "conta " + numero);
        return guardada;
    }

    private String gerarNumeroUnico() {
        String numero;
        do {
            numero = String.valueOf(ThreadLocalRandom.current().nextLong(1_000_000_000L, 10_000_000_000L));
        } while (repository.existsByNumero(numero));
        return numero;
    }
}