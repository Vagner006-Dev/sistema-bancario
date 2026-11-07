package co.mz.bank.sistema_bancario.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "contas")
public class Conta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 12)
    private String numero;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @JsonIgnore
    @Column(name = "pin_hash", nullable = false)
    private String pinHash;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal saldo = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoConta estado = EstadoConta.ACTIVA;

    @Column(name = "data_abertura", nullable = false)
    private LocalDateTime dataAbertura = LocalDateTime.now();

    @Column(name = "primeiro_acesso", nullable = false)
    private boolean primeiroAcesso = true;

    @JsonIgnore
    @Version
    private Long version;

    public Long getId(){
        return id;
    }
    public void setId(Long id){
        this.id = id;
    }
    public String getNumero(){
        return numero;
    }
    public void setNumero(String numero){
        this.numero = numero;
    }
    public Cliente getCliente(){
        return cliente;
    }
    public void setCliente(Cliente cliente){
        this.cliente = cliente;
    }
    public String getPinHash(){
        return pinHash; 
    }
    public void setPinHash(String pinHash){
        this.pinHash = pinHash;
    }
    public BigDecimal getSaldo(){
        return saldo;
    }
    public void setSaldo(BigDecimal saldo){
        this.saldo = saldo;
    }
    public EstadoConta getEstado(){
        return estado;
    }
    public void setEstado(EstadoConta estado){
        this.estado = estado;
    }
    public LocalDateTime getDataAbertura(){
        return dataAbertura;
    }
    public void setDataAbertura(LocalDateTime dataAbertura){
        this.dataAbertura = dataAbertura;
    }
    public boolean isPrimeiroAcesso() {
        return primeiroAcesso; 
    }
    public void setPrimeiroAcesso(boolean primeiroAcesso){ 
        this.primeiroAcesso = primeiroAcesso; 
    }
    public Long getVersion(){
        return version; 
    }
    public void setVersion(Long version){
        this.version = version; 
    }
}