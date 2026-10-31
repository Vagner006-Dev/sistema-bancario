package co.mz.bank.sistema_bancario.repository;

import jakarta.persistence.LockModeType;
import co.mz.bank.sistema_bancario.model.Conta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ContaRepository extends JpaRepository<Conta, Long> {
    Optional<Conta> findByNumero(String numero);
    boolean existsByNumero(String numero);

    boolean existsByClienteId(Long clienteId);
    List<Conta> findByClienteId(Long clienteId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("Select c FROM Conta c WHERE c.numero = :numero")
    Optional<Conta> findByNumeroForUpdate(@Param("numero") String numero);

}
