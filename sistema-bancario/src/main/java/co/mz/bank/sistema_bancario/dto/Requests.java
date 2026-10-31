package co.mz.bank.sistema_bancario.dto;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public class Requests {

    public record AbrirContaRequest(
        @NotBlank(message = "O pin e obrigatorio")
        @Pattern(regexp = "\\d{4}", message = "O pin deve ter 4 digitos") String pin,
        @NotNull(message = "O saldo inicial e obrigatorio")
        @DecimalMin(value = "0.00", message = "Saldo inicial invalido") BigDecimal saldoInicial
    ){}

    public record AlterarPinRequest(
        @NotBlank(message = "O pin e obrigatorio")String pinActual,
        @NotBlank @Pattern(regexp = "\\d{4}", message = "O novo PIN deve ter 4 digitos") String novoPin
    ){}

    public record CreditarRequest(
        @NotNull @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero") BigDecimal valor
    ){}

    public record TransferirRequest(
        @NotBlank String origem,
        @NotBlank String destino,
        @NotNull @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero") BigDecimal valor,
        @NotBlank String pin
    ){}

}
