package co.mz.bank.sistema_bancario.controller;

import co.mz.bank.sistema_bancario.dto.Requests.AbrirContaRequest;
import co.mz.bank.sistema_bancario.dto.Requests.AlterarPinRequest;
import co.mz.bank.sistema_bancario.model.Conta;
import co.mz.bank.sistema_bancario.service.ContaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ContaController {

    private final ContaService service;

    public ContaController(ContaService service) {
        this.service = service;
    }

    @PostMapping("/clientes/{id}/contas")
    @ResponseStatus(HttpStatus.CREATED)
    public Conta abrir(@PathVariable Long id, @Valid @RequestBody AbrirContaRequest r) {
        return service.abrir(id, r);
    }

    @GetMapping("/clientes/{id}/contas")
    public List<Conta> listarDoCliente(@PathVariable Long id) {
        return service.listarPorCliente(id);
    }

    @GetMapping("/contas")
    public List<Conta> listarTodas() {
        return service.listarTodas();
    }

        @GetMapping("/contas/{numero}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR') or (hasRole('CLIENTE') and #numero == authentication.name)")
    public Conta buscar(@PathVariable String numero) {
        return service.buscar(numero);
    }

    @PutMapping("/contas/{numero}/pin")
    @PreAuthorize("hasAnyRole('CLIENTE','CLIENTE_PIN_PENDENTE') and #numero == authentication.name")
    public Conta alterarPin(@PathVariable String numero, @Valid @RequestBody AlterarPinRequest r) {
        return service.alterarPin(numero, r);
    }
}