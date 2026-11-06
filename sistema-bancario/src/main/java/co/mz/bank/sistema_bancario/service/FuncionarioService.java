package co.mz.bank.sistema_bancario.service;

import co.mz.bank.sistema_bancario.dto.Requests.CriarFuncionarioRequest;
import co.mz.bank.sistema_bancario.exception.RegraNegocioException;
import co.mz.bank.sistema_bancario.model.Funcionario;
import co.mz.bank.sistema_bancario.model.Role;
import co.mz.bank.sistema_bancario.repository.FuncionarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FuncionarioService {

    private final FuncionarioRepository repository;
    private final PasswordEncoder encoder;

    public FuncionarioService(FuncionarioRepository repository, PasswordEncoder encoder) {
        this.repository = repository;
        this.encoder = encoder;
    }

    @Transactional
    public Funcionario criar(CriarFuncionarioRequest r) {
        if (r.role() != Role.ADMIN && r.role() != Role.OPERADOR)
            throw new RegraNegocioException("O perfil do funcionário deve ser ADMIN ou OPERADOR");

        String email = r.email().trim().toLowerCase();
        if (repository.existsByEmail(email))
            throw new RegraNegocioException("Já existe um funcionário com este email");

        Funcionario funcionario = new Funcionario();
        funcionario.setNome(r.nome());
        funcionario.setEmail(email);
        funcionario.setSenhaHash(encoder.encode(r.senha()));
        funcionario.setRole(r.role());
        return repository.save(funcionario);
    }

    public List<Funcionario> listar() {
        return repository.findAll();
    }
}