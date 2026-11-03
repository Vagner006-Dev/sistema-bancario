package co.mz.bank.sistema_bancario.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey chave;
    private final long expiracaoMs;

    public JwtService(@Value("${jwt.secret}") String secret,
                      @Value("${jwt.expiration-ms}") long expiracao) {
        this.chave = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.expiracaoMs = expiracao;
    }

    public String gerarToken(String numeroConta) {
        Date agora = new Date();
        return Jwts.builder()
                .setSubject(numeroConta)
                .setIssuedAt(agora)
                .setExpiration(new Date(agora.getTime() + expiracaoMs))
                .signWith(chave)
                .compact();
    }

   public String extrairNumeroConta(String token) {
    return Jwts.parserBuilder()
            .setSigningKey(chave)
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
}

    public long getExpiracaoSegundos() {
        return expiracaoMs / 1000;
    }
}
