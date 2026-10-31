package co.mz.bank.sistema_bancario.service;

import co.mz.bank.sistema_bancario.exception.RecursoNaoEncontradoException;
import co.mz.bank.sistema_bancario.exception.RegraNegocioException;
import co.mz.bank.sistema_bancario.model.Conta;
import co.mz.bank.sistema_bancario.model.EstadoConta;
import co.mz.bank.sistema_bancario.repository.ContaRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class SaldoService {

    private final ContaRepository repository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public SaldoService(ContaRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void creditar(String numero, BigDecimal valor) {
        validarValor(valor);
        Conta conta = bloquear(numero);
        exigirActiva(conta);
        conta.setSaldo(conta.getSaldo().add(valor));
    }

    public void transferir(String origem, String destino, BigDecimal valor, String pin) {
        validarValor(valor);
        if (origem.equals(destino)) throw new RegraNegocioException("As contas de origem e destino devem ser diferentes");

        boolean origemPrimeiro = origem.compareTo(destino) < 0;
        Conta primeira = bloquear(origemPrimeiro ? origem : destino);
        Conta segunda = bloquear(origemPrimeiro ? destino : origem);
        Conta contaOrigem = origemPrimeiro ? primeira : segunda;
        Conta contaDestino = origemPrimeiro ? segunda : primeira;

        exigirActiva(contaOrigem);
        exigirActiva(contaDestino);

        if (!encoder.matches(pin, contaOrigem.getPinHash())) throw new RegraNegocioException("PIN incorrecto");
        if (contaOrigem.getSaldo().compareTo(valor) < 0) throw new RegraNegocioException("Saldo insuficiente");

        contaOrigem.setSaldo(contaOrigem.getSaldo().subtract(valor));
        contaDestino.setSaldo(contaDestino.getSaldo().add(valor));
    }

    private Conta bloquear(String numero) {
        return repository.findByNumeroForUpdate(numero).orElseThrow(() -> new RecursoNaoEncontradoException("Conta nao encontrada: " + numero));
    }

    private void exigirActiva(Conta c) {
        if (c.getEstado() != EstadoConta.ACTIVA) throw new RegraNegocioException("Conta " + c.getNumero() + " não está activa");
    }

    private void validarValor(BigDecimal valor) {
        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) throw new RegraNegocioException("O valor deve ser maior que zero");
    }
}