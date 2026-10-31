package co.mz.bank.sistema_bancario.repository;

import co.mz.bank.sistema_bancario.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    boolean existsByNumeroBi(String numeroBi);
    boolean existsByNumeroBiAndIdNot(String numeroBi, Long id);

    @Query("""
             SELECT c FROM Cliente c
             WHERE LOWER(c.nome) LIKE LOWER(CONCAT('%', :q, '%'))
                OR c.numeroBi Like CONCAT('%', :q, '%')
                OR c.telefone LIKE CONCAT('%', :q, '%')
            """)
    List<Cliente> pesquisar(@Param("q") String q);
}
