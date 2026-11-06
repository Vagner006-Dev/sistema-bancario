package co.mz.bank.sistema_bancario.controller;

import co.mz.bank.sistema_bancario.dto.Requests.LoginContaRequest;
import co.mz.bank.sistema_bancario.dto.Requests.LoginFuncionarioRequest;
import co.mz.bank.sistema_bancario.dto.Requests.TokenResponse;
import co.mz.bank.sistema_bancario.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/login")
    public TokenResponse loginFuncionario(@Valid @RequestBody LoginFuncionarioRequest r) {
        return service.loginFuncionario(r);
    }

    @PostMapping("/conta/login")
    public TokenResponse loginConta(@Valid @RequestBody LoginContaRequest r) {
        return service.loginConta(r);
    }
}