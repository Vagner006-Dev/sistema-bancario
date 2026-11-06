package co.mz.bank.sistema_bancario.security;

import co.mz.bank.sistema_bancario.model.Funcionario;
import co.mz.bank.sistema_bancario.model.Role;
import co.mz.bank.sistema_bancario.repository.FuncionarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final FuncionarioRepository repository;
    private final PasswordEncoder encoder;

    @Value("${admin.email:admin@banco.mz}")
    private String adminEmail;

    @Value("${admin.senha:Admin@123}")
    private String adminSenha;

    public DataInitializer(FuncionarioRepository repository, PasswordEncoder encoder) {
        this.repository = repository;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (repository.count() == 0) {
            Funcionario admin = new Funcionario();
            admin.setNome("Administrador");
            admin.setEmail(adminEmail);
            admin.setSenhaHash(encoder.encode(adminSenha));
            admin.setRole(Role.ADMIN);
            repository.save(admin);
        }
    }
}