package co.mz.bank.sistema_bancario.controller;

import co.mz.bank.sistema_bancario.model.Cliente;
import co.mz.bank.sistema_bancario.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController 
@RequestMapping("/api/clientes")
public class ClienteController {
    private final ClienteService service;

    public ClienteController(ClienteService service){
        this.service = service;
    }

    @GetMapping("/{id}")
    public Cliente buscar(@PathVariable Long id){
        return service.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Cliente criar(@Valid @RequestBody Cliente cliente){
        return service.criar(cliente);
    }

    @PutMapping("/{id}")
    public Cliente actualizar(@PathVariable Long id, @Valid @RequestBody Cliente cliente){
        return service.actualizar(id, cliente);    
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id){
        service.eliminar(id);
    }

    @GetMapping
    public List<Cliente> listarTodos(){
        return service.listarTodos();
    }
    
    
}
