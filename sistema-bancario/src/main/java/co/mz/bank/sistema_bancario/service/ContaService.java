package co.mz.bank.sistema_bancario.service;

import co.mz.bank.sistema_bancario.dto.Requests.AbrirContaRequest;
import co.mz.bank.sistema_bancario.dto.Requests.AlterarPinRequest;
import co.mz.bank.sistema_bancario.exception.RegraNegocioException;
import co.mz.bank.sistema_bancario.exception.RecursoNaoEncontradoException;
import co.mz.bank.sistema_bancario.model.*;
import co.mz.bank.sistema_bancario.repository.ContaRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;

@Service 
public class ContaService {
    private final ContaRepository repository;
    private final ClienteService clienteService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final SecureRandom random = new SecureRandom();

    public ContaService(ContaRepository repository, ClienteService clienteService){
        this.repository = repository;
        this.clienteService = clienteService;
    }

    @Transactional
    public Conta abrir(Long clienteId, AbrirContaRequest r){
        Cliente cliente = clienteService.buscar(clienteId);
        if(cliente.getEstado() != EstadoCliente.ACTIVO) throw new RegraNegocioException("Cliente INACTIVO nao pode abrir conta");

        Conta conta = new Conta();
        conta.setNumero(gerarNumeroUnico());
        conta.setCliente(cliente);
        conta.setPinHash(encoder.encode(r.pin()));
        conta.setSaldo(r.saldoInicial());
        return repository.save(conta);
    }

    public List<Conta> listarTodas(){
        return repository.findAll();
    }

    public Conta buscar(String numero){
        return repository.findByNumero(numero).orElseThrow(()-> new RecursoNaoEncontradoException("Conta nao encontrada" +numero));
    }

    @Transactional
    public Conta bloquear(String numero){
        Conta c = buscar(numero);
        c.setEstado(EstadoConta.BLOQUEADA);
        return repository.save(c);
    }

    @Transactional 
    public Conta alterarPin(String numero, AlterarPinRequest r){
        Conta c = buscar(numero);
        if(!encoder.matches(r.pinActual(), c.getPinHash())) throw new RegraNegocioException("PIN actual incorrecto");
        if(r.pinActual().equals(r.novoPin())) throw new RegraNegocioException("O novo PIN deve ser diferente do actual");
        c.setPinHash(encoder.encode(r.novoPin()));
        c.setPrimeiroAcesso(false);
        return repository.save(c);
    }

    private String gerarNumeroUnico(){
        String numero;
        do{
            numero = String.valueOf(1_000_000_000L + (long)(random.nextDouble() * 8_999_999_999L));
        }while(repository.existsByNumero(numero));
        return numero;
    }

    public List<Conta> listarPorCliente(Long id) {
        throw new UnsupportedOperationException("Unimplemented method 'listarPorCliente'");
    }

    public Conta desbloquear(String numero) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'desbloquear'");
    }
}
