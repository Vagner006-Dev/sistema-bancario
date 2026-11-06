package co.mz.bank.sistema_bancario.controller;

import co.mz.bank.sistema_bancario.dto.Requests.CriarFuncionarioRequest;
import co.mz.bank.sistema_bancario.model.Funcionario;
import co.mz.bank.sistema_bancario.service.FuncionarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/funcionarios")
public class FuncionarioController {

    private final FuncionarioService service;

    public FuncionarioController(FuncionarioService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Funcionario criar(@Valid @RequestBody CriarFuncionarioRequest r) {
        return service.criar(r);
    }

    @GetMapping
    public List<Funcionario> listar() {
        return service.listar();
    }
}