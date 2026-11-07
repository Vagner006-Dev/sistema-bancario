package co.mz.bank.transaccoes.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transacoes", indexes = {
        @Index(name = "idx_conta_origem", columnList = "conta_origem"),
        @Index(name = "idx_conta_destino", columnList = "conta_destino")
})
public class Transacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String referencia;

    // Número da conta de origem
    @Column(name = "conta_origem", length = 20)
    private String contaOrigem;

    // Número da conta de destino
    @Column(name = "conta_destino", nullable = false, length = 20)
    private String contaDestino;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal valor;

    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoTransacao tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoTransacao estado = EstadoTransacao.PENDENTE;

    @Column(name = "motivo_falha")
    private String motivoFalha;

    @Column(name = "realizada_por", nullable = false)
    private String realizadaPor;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReferencia() {
        return referencia;
    }

    public void setReferencia(String referencia) {
        this.referencia = referencia;
    }

    public String getContaOrigem() {
        return contaOrigem;
    }

    public void setContaOrigem(String contaOrigem) {
        this.contaOrigem = contaOrigem;
    }

    public String getContaDestino() {
        return contaDestino;
    }

    public void setContaDestino(String contaDestino) {
        this.contaDestino = contaDestino;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }

    public TipoTransacao getTipo() {
        return tipo;
    }

    public void setTipo(TipoTransacao tipo) {
        this.tipo = tipo;
    }

    public EstadoTransacao getEstado() {
        return estado;
    }

    public void setEstado(EstadoTransacao estado) {
        this.estado = estado;
    }

    public String getMotivoFalha() {
        return motivoFalha;
    }

    public void setMotivoFalha(String motivoFalha) {
        this.motivoFalha = motivoFalha;
    }

    public String getRealizadaPor() {
        return realizadaPor;
    }

    public void setRealizadaPor(String realizadaPor) {
        this.realizadaPor = realizadaPor;
    }
}