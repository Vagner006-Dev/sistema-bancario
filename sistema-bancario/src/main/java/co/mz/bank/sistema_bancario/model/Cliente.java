package co.mz.bank.sistema_bancario.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "clientes")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome é obrigatório")
    @Column(nullable = false)
    private String nome;

    @NotBlank(message = "O número do BI é obrigatório")
    @Column(name = "numero_bi", nullable = false, unique = true, length = 20)
    private String numeroBi;

    private String telefone;

    @Email(message = "Email inválido")
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoCliente estado = EstadoCliente.ACTIVO;

    public Long getId(){ 
        return id; 
    }
    public void setId(Long id){
        this.id = id; 
    }
    public String getNome(){ 
        return nome; 
    }
    public void setNome(String nome){ 
        this.nome = nome; 
    }
    public String getNumeroBi(){ 
        return numeroBi; 
    }
    public void setNumeroBi(String numeroBi){ 
        this.numeroBi = numeroBi; 
    }
    public String getTelefone(){ 
        return telefone; 
    }
    public void setTelefone(String telefone){ 
        this.telefone = telefone; 
    }
    public String getEmail(){ 
        return email; 
    }
    public void setEmail(String email){ 
        this.email = email; 
    }
    public EstadoCliente getEstado(){ 
        return estado; 
    }
    public void setEstado(EstadoCliente estado){
        this.estado = estado; 
    }
}