package co.mz.bank.sistema_bancario.service;

import co.mz.bank.sistema_bancario.model.Auditoria;
import co.mz.bank.sistema_bancario.repository.AuditoriaRepository;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditoriaService {

    private final AuditoriaRepository repository;

    public AuditoriaService(AuditoriaRepository repository) {
        this.repository = repository;
    }


    public void registar(String acao, String entidade, String detalhe) {
        Ator ator = quemFez();

        Auditoria a = new Auditoria();
        a.setAutor(ator.nome());
        a.setPerfil(ator.perfil());
        a.setAcao(acao);
        a.setEntidade(entidade);
        a.setDetalhe(detalhe.length() > 500 ? detalhe.substring(0, 500) : detalhe);
        repository.save(a);
    }

    public List<Auditoria> listar(String autor) {
        if (autor == null || autor.isBlank())
            return repository.findAllByOrderByDataHoraDescIdDesc();
        return repository.findByAutorOrderByDataHoraDescIdDesc(autor.trim());
    }

    private record Ator(String nome, String perfil) {}

    private Ator quemFez() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();

    if (auth == null || auth instanceof AnonymousAuthenticationToken)
        return new Ator("sistema", "SISTEMA");

    String perfil = auth.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.joining(","));

    return new Ator(auth.getName(), perfil);
    }
}