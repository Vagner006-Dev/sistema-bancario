package co.mz.bank.sistema_bancario.controller;

import co.mz.bank.sistema_bancario.dto.Requests.CreditarRequest;
import co.mz.bank.sistema_bancario.dto.Requests.TransferirRequest;
import co.mz.bank.sistema_bancario.service.SaldoService;
import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RequestMapping("/api/interno/contas")
public class SaldoController {

    private final SaldoService service;

    public SaldoController(SaldoService service) {
        this.service = service;
    }

    @PostMapping("/{numero}/creditar")
    public void creditar(@PathVariable String numero, @Valid @RequestBody CreditarRequest r) {
        service.creditar(numero, r.valor());
    }

        @PostMapping("/transferir")
    @PreAuthorize("hasRole('CLIENTE') and #r.origem() == authentication.name")
    public void transferir(@Valid @RequestBody TransferirRequest r) {
        service.transferir(r.origem(), r.destino(), r.valor(), r.pin());
    }
}