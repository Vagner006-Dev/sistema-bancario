package co.mz.bank.transaccoes.dto;

import co.mz.bank.transaccoes.model.EstadoTransacao;
import co.mz.bank.transaccoes.model.TipoTransacao;
import co.mz.bank.transaccoes.model.Transacao;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Respostas {

    public record Comprovativo(
            String banco, String referencia, TipoTransacao tipo, EstadoTransacao estado,
            String contaOrigem, String contaDestino, BigDecimal valor, LocalDateTime dataHora) {

        public static Comprovativo de(Transacao t, String banco) {
            return new Comprovativo(banco, t.getReferencia(), t.getTipo(), t.getEstado(),
                    t.getContaOrigem(), t.getContaDestino(), t.getValor(), t.getDataHora());
        }
    }

    public record Movimento(
            String referencia, TipoTransacao tipo, EstadoTransacao estado, String sentido,
            String contaOrigem, String contaDestino, BigDecimal valor,
            LocalDateTime dataHora, String motivoFalha) {

        public static Movimento de(Transacao t, String conta) {
            String sentido = conta.equals(t.getContaDestino()) ? "CREDITO" : "DEBITO";
            return new Movimento(t.getReferencia(), t.getTipo(), t.getEstado(), sentido,
                    t.getContaOrigem(), t.getContaDestino(), t.getValor(),
                    t.getDataHora(), t.getMotivoFalha());
        }
    }
}