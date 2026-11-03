package co.mz.bank.sistema_bancario.service;

import co.mz.bank.sistema_bancario.dto.Requests.TokenResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class TokenService {

    private final JwtEncoder encoder;

    @Value("${jwt.expiracao-segundos:30}")
    private long expiracaoSegundos;

    public TokenService(JwtEncoder encoder) {
        this.encoder = encoder;
    }

    public TokenResponse gerar(String subject, String tipo, List<String> roles, boolean primeiroAcesso) {
        Instant agora = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("sistema-bancario")
                .subject(subject)                      
                .issuedAt(agora)
                .expiresAt(agora.plusSeconds(expiracaoSegundos))                
                .claim("tipo", tipo)                    
                .claim("roles", roles)
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();

        return new TokenResponse(token, "Bearer", expiracaoSegundos , roles, primeiroAcesso);
    }
}