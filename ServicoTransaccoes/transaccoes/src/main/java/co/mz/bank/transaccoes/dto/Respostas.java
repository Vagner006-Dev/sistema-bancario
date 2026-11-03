package co.mz.bank.transaccoes.dto;

import co.mz.bank.transaccoes.model.EstadoTransacao;
import co.mz.bank.transaccoes.model.TipoTransacao;
import co.mz.bank.transaccoes.model.Transacao;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Respostas {

    public record Comprovativo(
        String banco, String referencia, TipoTransacao tipo, EstadoTransacao estado,
        String contaOrigem, String contaDestino, BigDecimal Valor, LocalDateTime datahora
    ){
        public static Comprovativo de(Transacao transacao, String banco){
            return new Comprovativo(banco, transacao.getReferencia(), transacao.getTipo(), transacao.getEstado(), 
                    transacao.getContaOrigem(), transacao.getContaDestino(), transacao.getValor(), transacao.getDataHora());
        }
    }

    public record Movimento(
        String referencia, TipoTransacao tipo, EstadoTransacao estado, String sentido,
        String contaOrigem, String contaDestino, BigDecimal valor,
        LocalDateTime dataHora, String motivoFalha 
    ){
        public static Movimento de(Transacao transacao, String conta){
            String sentido = conta.equals(transacao.getContaDestino()) ? "CREDITO" : "DEBITO";
            return new Movimento(transacao.getReferencia(), transacao.getTipo(), transacao.getEstado(), sentido,
                    transacao.getContaOrigem(), transacao.getContaDestino(), transacao.getValor(),
                    transacao.getDataHora(), transacao.getMotivoFalha());
        }
    }

}
