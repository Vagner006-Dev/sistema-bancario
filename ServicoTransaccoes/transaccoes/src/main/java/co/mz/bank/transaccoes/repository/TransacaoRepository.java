package co.mz.bank.transaccoes.repository;

import co.mz.bank.transaccoes.model.Transacao;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransacaoRepository extends JpaRepository<Transacao, Long>{

    @Query("""
            SELECT transacao FROM Transacao transacao
            WHERE transacao.contaOrigem = :conta OR transacao.contaDestino = :conta
            ORDER BY transacao.dataHora DESC, transacao.id DESC
            """)
    List<Transacao> extracto(@Param("conta") String conta, Pageable pageable);

}
