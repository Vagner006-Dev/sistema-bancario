package co.mz.bank.sistema_bancario.service;

import co.mz.bank.sistema_bancario.exception.RecursoNaoEncontradoException;
import co.mz.bank.sistema_bancario.exception.RegraNegocioException;
import co.mz.bank.sistema_bancario.model.Cliente;
import co.mz.bank.sistema_bancario.model.EstadoCliente;
import co.mz.bank.sistema_bancario.repository.ClienteRepository;
import co.mz.bank.sistema_bancario.repository.ContaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository repository;
    private final ContaRepository contaRepository;
    private final AuditoriaService auditoria;

    public ClienteService(ClienteRepository repository, ContaRepository contaRepository,
                          AuditoriaService auditoria) {
        this.repository = repository;
        this.contaRepository = contaRepository;
        this.auditoria = auditoria;
    }

    public List<Cliente> listar(String q) {
        return (q == null || q.isBlank()) ? repository.findAll() : repository.pesquisar(q.trim());
    }

    public List<Cliente> listarTodos(){
        return repository.findAll();
    }

    public Cliente buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cliente não encontrado: " + id));
    }

    @Transactional
    public Cliente criar(Cliente cliente) {
        if (repository.existsByNumeroBi(cliente.getNumeroBi()))
            throw new RegraNegocioException("Já existe um cliente com este número de BI");

        cliente.setId(null);
        cliente.setEstado(EstadoCliente.ACTIVO);
        Cliente guardado = repository.save(cliente);

        auditoria.registar("CRIAR", "CLIENTE",
                "cliente " + guardado.getId() + " - " + guardado.getNome());
        return guardado;
    }

    @Transactional
    public Cliente actualizar(Long id, Cliente dados) {
        Cliente existente = buscar(id);
        if (repository.existsByNumeroBiAndIdNot(dados.getNumeroBi(), id))
            throw new RegraNegocioException("Já existe outro cliente com este número de BI");

        existente.setNome(dados.getNome());
        existente.setNumeroBi(dados.getNumeroBi());
        existente.setTelefone(dados.getTelefone());
        existente.setEmail(dados.getEmail());
        if (dados.getEstado() != null) existente.setEstado(dados.getEstado());
        return repository.save(existente);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!repository.existsById(id))
            throw new RecursoNaoEncontradoException("Cliente não encontrado: " + id);
        if (contaRepository.existsByClienteId(id))
            throw new RegraNegocioException("Cliente com contas não pode ser eliminado; passe-o a INACTIVO");
        repository.deleteById(id);
    }
}