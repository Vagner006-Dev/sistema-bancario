package co.mz.bank.transaccoes.controller;

import co.mz.bank.transaccoes.dto.Requests.DepositoRequest;
import co.mz.bank.transaccoes.dto.Requests.TransferenciaRequest;
import co.mz.bank.transaccoes.dto.Respostas.Comprovativo;
import co.mz.bank.transaccoes.dto.Respostas.Movimento;
import co.mz.bank.transaccoes.service.TransacaoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TransacaoController {

    private final TransacaoService service;
    private final String banco;

    public TransacaoController(TransacaoService service, @Value("${banco.nome}") String banco) {
        this.service = service;
        this.banco = banco;
    }

    @PostMapping("/contas/{numero}/depositos")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR')")
    public Comprovativo depositar(@PathVariable String numero,
                                  @Valid @RequestBody DepositoRequest r,
                                  @RequestHeader("Authorization") String authorization,
                                  Authentication auth) {
        return Comprovativo.de(
                service.depositar(numero, r.valor(), auth.getName(), authorization), banco);
    }

    @PostMapping("/transferencias")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CLIENTE') and #r.origem() == authentication.name")
    public Comprovativo transferir(@Valid @RequestBody TransferenciaRequest r,
                                   @RequestHeader("Authorization") String authorization,
                                   Authentication auth) {
        return Comprovativo.de(
                service.transferir(r.origem(), r.destino(), r.valor(), r.pin(),
                        auth.getName(), authorization), banco);
    }

    @GetMapping("/contas/{numero}/movimentos")
    @PreAuthorize("hasAnyRole('ADMIN','OPERADOR') or (hasRole('CLIENTE') and #numero == authentication.name)")
    public List<Movimento> extracto(@PathVariable String numero,
                                    @RequestParam(defaultValue = "20") int limite) {
        return service.extracto(numero, limite);
    }
}