package co.mz.bank.sistema_bancario.controller;

import co.mz.bank.sistema_bancario.model.Auditoria;
import co.mz.bank.sistema_bancario.service.AuditoriaService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auditoria")
public class AuditoriaController {

    private final AuditoriaService service;

    public AuditoriaController(AuditoriaService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Auditoria> listar(@RequestParam(required = false) String autor) {
        return service.listar(autor);
    }
}