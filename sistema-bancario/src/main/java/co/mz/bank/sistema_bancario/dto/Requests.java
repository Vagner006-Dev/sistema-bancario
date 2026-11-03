package co.mz.bank.sistema_bancario.dto;

import co.mz.bank.sistema_bancario.model.Role;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public class Requests {

    public record AbrirContaRequest(
            @NotBlank(message = "O PIN é obrigatório")
            @Pattern(regexp = "\\d{4}", message = "O PIN deve ter 4 dígitos") String pin,
            @NotNull(message = "O saldo inicial é obrigatório")
            @DecimalMin(value = "0.00", message = "Saldo inicial inválido") BigDecimal saldoInicial) {}

    public record AlterarPinRequest(
            @NotBlank(message = "O PIN actual é obrigatório") String pinActual,
            @NotBlank @Pattern(regexp = "\\d{4}", message = "O novo PIN deve ter 4 dígitos") String novoPin) {}

    public record CreditarRequest(
            @NotNull @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero") BigDecimal valor) {}

    public record TransferirRequest(
            @NotBlank String origem,
            @NotBlank String destino,
            @NotNull @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero") BigDecimal valor,
            @NotBlank String pin) {}


    public record LoginFuncionarioRequest(
            @NotBlank(message = "O email é obrigatório") @Email(message = "Email inválido") String email,
            @NotBlank(message = "A senha é obrigatória") String senha) {}

    public record LoginContaRequest(
            @NotBlank(message = "O número da conta é obrigatório") String numero,
            @NotBlank(message = "O PIN é obrigatório") String pin) {}

    public record CriarFuncionarioRequest(
            @NotBlank(message = "O nome é obrigatório") String nome,
            @NotBlank @Email(message = "Email inválido") String email,
            @NotBlank @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres") String senha,
            @NotNull(message = "O perfil é obrigatório") Role role) {}

    public record TokenResponse(
            String token,
            String tipo,
            long expiraEmSegundos,
            List<String> roles,
            boolean primeiroAcesso) {}
}