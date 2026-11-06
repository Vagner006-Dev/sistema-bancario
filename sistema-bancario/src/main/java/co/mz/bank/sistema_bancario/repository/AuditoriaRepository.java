package co.mz.bank.sistema_bancario.repository;

import co.mz.bank.sistema_bancario.model.Auditoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditoriaRepository extends JpaRepository<Auditoria, Long> {

    List<Auditoria> findAllByOrderByDataHoraDescIdDesc();

    List<Auditoria> findByAutorOrderByDataHoraDescIdDesc(String autor);
}