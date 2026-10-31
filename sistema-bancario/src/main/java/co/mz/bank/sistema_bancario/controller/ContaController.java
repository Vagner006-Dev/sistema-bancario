package co.mz.bank.sistema_bancario.controller;

import co.mz.bank.sistema_bancario.dto.Requests.AbrirContaRequest;
import co.mz.bank.sistema_bancario.dto.Requests.AlterarPinRequest;
import co.mz.bank.sistema_bancario.model.Conta;
import co.mz.bank.sistema_bancario.service.ContaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

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
    public Conta buscar(@PathVariable String numero) {
        return service.buscar(numero);
    }

    @PatchMapping("/contas/{numero}/bloquear")
    public Conta bloquear(@PathVariable String numero) {
        return service.bloquear(numero);
    }

    @PatchMapping("/contas/{numero}/desbloquear")
    public Conta desbloquear(@PathVariable String numero) {
        return service.desbloquear(numero);
    }

    @PutMapping("/contas/{numero}/pin")
    public Conta alterarPin(@PathVariable String numero, @Valid @RequestBody AlterarPinRequest r) {
        return service.alterarPin(numero, r);
    }
}