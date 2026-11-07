package co.mz.bank.transaccoes.client;

import co.mz.bank.transaccoes.exception.ErroContasException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.math.BigDecimal;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class ContasClient {

    private final RestClient restClient;

    public ContasClient(@Value("${contas.url}") String baseUrl) {
        HttpClient http = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(3))
                .build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(http);
        factory.setReadTimeout(Duration.ofSeconds(10));

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
    }

    public void creditar(String numero, BigDecimal valor, String authorization) {
        enviar("/api/interno/contas/{numero}/creditar", authorization,
                Map.of("valor", valor), numero);
    }

    public void transferir(String origem, String destino, BigDecimal valor, String pin,
                           String authorization) {
        enviar("/api/interno/contas/transferir", authorization,
                Map.of("origem", origem, "destino", destino, "valor", valor, "pin", pin));
    }

    private void enviar(String uri, String authorization, Object corpo, Object... variaveis) {
        try {
            restClient.post()
                    .uri(uri, variaveis)
                    .header(HttpHeaders.AUTHORIZATION, authorization)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(corpo)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException e) {
            int status = e.getStatusCode().value();
            throw new ErroContasException(status >= 500 ? 502 : status, extrairErro(e));
        } catch (ResourceAccessException e) {
            throw new ErroContasException(503, "Serviço de Contas indisponível");
        }
    }

    private String extrairErro(RestClientResponseException e) {
        try {
            Map<?, ?> corpo = e.getResponseBodyAs(Map.class);
            if (corpo != null && corpo.get("erro") != null) {
                return corpo.get("erro").toString();
            }
            if (corpo != null && !corpo.isEmpty()) {
                return corpo.values().stream()
                        .map(Object::toString)
                        .collect(Collectors.joining("; "));
            }
        } catch (Exception ignorado) {
            // cai para a mensagem genérica
        }
        return "Erro no serviço de Contas (" + e.getStatusCode().value() + ")";
    }
}