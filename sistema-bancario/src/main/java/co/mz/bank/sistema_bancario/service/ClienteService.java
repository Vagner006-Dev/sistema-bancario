package co.mz.bank.sistema_bancario.service;

import co.mz.bank.sistema_bancario.exception.RecursoNaoEncontradoException;
import co.mz.bank.sistema_bancario.exception.RegraNegocioException;
import co.mz.bank.sistema_bancario.exception.RecursoNaoEncontradoException;
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

    public ClienteService(ClienteRepository repository, ContaRepository contaRepository){
        this.repository = repository;
        this.contaRepository = contaRepository;
    }

    public List<Cliente> listar(String q){
        return (q == null || q.isBlank()) ? repository.findAll() : repository.pesquisar(q.trim());
    }

    public List<Cliente> listarTodos(){
        return repository.findAll();
    }

    public Cliente buscar(Long id){
        return repository.findById(id).orElseThrow(()->new RecursoNaoEncontradoException("Cliente nao encontrado: " +id));
    }

    @Transactional
    public Cliente criar(Cliente cliente){
        if(repository.existsByNumeroBi(cliente.getNumeroBi())) throw new RegraNegocioException("Ja existe um cliente com este numero de BI");
        cliente.setId(null);
        cliente.setEstado(EstadoCliente.ACTIVO);
        return repository.save(cliente);
    }

    @Transactional 
    public Cliente actualizar(Long id, Cliente dados){
        Cliente existente = buscar(id);
        if(repository.existsByNumeroBiAndIdNot(dados.getNumeroBi(), id)) throw new RegraNegocioException("Ja existe outro cliente com este numero de BI");
        existente.setNome(dados.getNome());
        existente.setEmail(dados.getEmail());
        existente.setTelefone(dados.getTelefone());
        existente.setNumeroBi(dados.getNumeroBi());
        if(dados.getEstado() != null) existente.setEstado(dados.getEstado());
        return repository.save(existente);
    }

    @Transactional
    public void eliminar(Long id){
        if(!repository.existsById(id)) throw new RecursoNaoEncontradoException("Cliente nao encontradi: " +id);
        if(contaRepository.existsByClienteId(id)) throw new RegraNegocioException("Cliente com contas nao pode ser eliminado, passe-o a INACTIVO");
        repository.deleteById(id);
    }
}