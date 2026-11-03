package co.mz.bank.sistema_bancario.service;

import co.mz.bank.sistema_bancario.dto.Requests.LoginContaRequest;
import co.mz.bank.sistema_bancario.dto.Requests.LoginFuncionarioRequest;
import co.mz.bank.sistema_bancario.dto.Requests.TokenResponse;
import co.mz.bank.sistema_bancario.exception.CredenciaisInvalidasException;
import co.mz.bank.sistema_bancario.exception.RegraNegocioException;
import co.mz.bank.sistema_bancario.model.Conta;
import co.mz.bank.sistema_bancario.model.EstadoConta;
import co.mz.bank.sistema_bancario.model.EstadoFuncionario;
import co.mz.bank.sistema_bancario.model.Funcionario;
import co.mz.bank.sistema_bancario.repository.ContaRepository;
import co.mz.bank.sistema_bancario.repository.FuncionarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {

    private final FuncionarioRepository funcionarioRepository;
    private final ContaRepository contaRepository;
    private final PasswordEncoder encoder;
    private final TokenService tokenService;

    public AuthService(FuncionarioRepository funcionarioRepository, ContaRepository contaRepository,
                       PasswordEncoder encoder, TokenService tokenService) {
        this.funcionarioRepository = funcionarioRepository;
        this.contaRepository = contaRepository;
        this.encoder = encoder;
        this.tokenService = tokenService;
    }

    /** Login do funcionário: email e senha */
    public TokenResponse loginFuncionario(LoginFuncionarioRequest r) {
        Funcionario f = funcionarioRepository.findByEmail(r.email().trim().toLowerCase())
                .orElseThrow(CredenciaisInvalidasException::new);

        if (!encoder.matches(r.senha(), f.getSenhaHash()) || f.getEstado() != EstadoFuncionario.ACTIVO)
            throw new CredenciaisInvalidasException();

        return tokenService.gerar(f.getEmail(), "FUNCIONARIO", List.of(f.getRole().name()), false);
    }

    public TokenResponse loginConta(LoginContaRequest r) {
        Conta c = contaRepository.findByNumero(r.numero())
                .orElseThrow(CredenciaisInvalidasException::new);

        if (!encoder.matches(r.pin(), c.getPinHash()))
            throw new CredenciaisInvalidasException();

        if (c.getEstado() != EstadoConta.ACTIVA)
            throw new RegraNegocioException("Conta bloqueada. Contacte o banco");

        String role = c.isPrimeiroAcesso() ? "CLIENTE_PIN_PENDENTE" : "CLIENTE";
        return tokenService.gerar(c.getNumero(), "CLIENTE", List.of(role), c.isPrimeiroAcesso());
    }
}