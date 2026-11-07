package co.mz.bank.transaccoes.service;

import co.mz.bank.transaccoes.client.ContasClient;
import co.mz.bank.transaccoes.dto.Respostas.Movimento;
import co.mz.bank.transaccoes.exception.ErroContasException;
import co.mz.bank.transaccoes.model.EstadoTransacao;
import co.mz.bank.transaccoes.model.TipoTransacao;
import co.mz.bank.transaccoes.model.Transacao;
import co.mz.bank.transaccoes.repository.TransacaoRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class TransacaoService {

    private final TransacaoRepository repository;
    private final ContasClient contas;

    public TransacaoService(TransacaoRepository repository, ContasClient contas) {
        this.repository = repository;
        this.contas = contas;
    }

    // NÃO usar @Transactional nestes dois métodos: cada save() tem de ficar gravado
    // logo, para o registo PENDENTE existir antes da chamada ao Contas e o registo
    // FALHADA sobreviver quando a excepção sobe.

    public Transacao depositar(String conta, BigDecimal valor, String autor, String authorization) {
        Transacao t = repository.save(nova(TipoTransacao.DEPOSITO, null, conta, valor, autor));
        try {
            contas.creditar(conta, valor, authorization);
        } catch (ErroContasException e) {
            registarFalha(t, e.getMessage());
            throw e;
        }
        return concluir(t);
    }

    public Transacao transferir(String origem, String destino, BigDecimal valor, String pin,
                                String autor, String authorization) {
        Transacao t = repository.save(nova(TipoTransacao.TRANSFERENCIA, origem, destino, valor, autor));
        try {
            contas.transferir(origem, destino, valor, pin, authorization);
        } catch (ErroContasException e) {
            registarFalha(t, e.getMessage());
            throw e;
        }
        return concluir(t);
    }

    @Transactional(readOnly = true)
    public List<Movimento> extracto(String conta, int limite) {
        int n = Math.min(Math.max(limite, 1), 100);
        return repository.extracto(conta, PageRequest.of(0, n)).stream()
                .map(t -> Movimento.de(t, conta))
                .toList();
    }

    private Transacao nova(TipoTransacao tipo, String origem, String destino, BigDecimal valor, String autor) {
        Transacao t = new Transacao();
        t.setReferencia("TRX-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase());
        t.setTipo(tipo);
        t.setContaOrigem(origem);
        t.setContaDestino(destino);
        t.setValor(valor);
        t.setRealizadaPor(autor);
        return t;
    }

    private Transacao concluir(Transacao t) {
        t.setEstado(EstadoTransacao.CONCLUIDA);
        return repository.save(t);
    }

    private void registarFalha(Transacao t, String motivo) {
        String texto = (motivo == null || motivo.isBlank()) ? "Erro desconhecido" : motivo;
        t.setEstado(EstadoTransacao.FALHADA);
        t.setMotivoFalha(texto.length() > 255 ? texto.substring(0, 255) : texto);
        repository.save(t);
    }
}