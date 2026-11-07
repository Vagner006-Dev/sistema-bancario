package co.mz.bank.sistema_bancario.repository;

import co.mz.bank.sistema_bancario.model.Conta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ContaRepository extends JpaRepository<Conta, Long> {

    Optional<Conta> findByNumero(String numero);

    boolean existsByNumero(String numero);

    boolean existsByClienteId(Long clienteId);

    List<Conta> findByClienteId(Long clienteId);

    @Query(value = """
            SELECT *
            FROM contas
            WHERE numero = :numero
            FOR UPDATE
            """, nativeQuery = true)
    Optional<Conta> findByNumeroForUpdate(@Param("numero") String numero);
}