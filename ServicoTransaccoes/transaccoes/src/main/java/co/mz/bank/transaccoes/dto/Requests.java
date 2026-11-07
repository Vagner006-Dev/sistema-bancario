package co.mz.bank.transaccoes.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class Requests {

    public record DepositoRequest(
            @NotNull(message = "O valor é obrigatório")
            @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero") BigDecimal valor) {}

    public record TransferenciaRequest(
            @NotBlank(message = "A conta de origem é obrigatória") String origem,
            @NotBlank(message = "A conta de destino é obrigatória") String destino,
            @NotNull(message = "O valor é obrigatório")
            @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero") BigDecimal valor,
            @NotBlank(message = "O PIN é obrigatório") String pin) {}
}