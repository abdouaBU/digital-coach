package com.example.demo;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.crypto.ECDSAVerifier;
import com.nimbusds.jose.jwk.ECKey;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKMatcher;
import com.nimbusds.jose.jwk.JWKSelector;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.stereotype.Component;

import java.net.MalformedURLException;
import java.net.URL;
import java.text.ParseException;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class JwtUtil {

    private final Map<String, JWKSource<SecurityContext>> jwkSources = new ConcurrentHashMap<>();

    private JWTClaimsSet parseVerifiedClaims(String token) {
        try {
            SignedJWT jwt = SignedJWT.parse(token);
            JWTClaimsSet claims = jwt.getJWTClaimsSet();
            String issuer = claims.getIssuer();

            if (issuer == null || issuer.isBlank()) {
                throw new IllegalArgumentException("Missing JWT issuer");
            }

            if (!JWSAlgorithm.ES256.equals(jwt.getHeader().getAlgorithm())) {
                throw new IllegalArgumentException("Unsupported JWT algorithm");
            }

            JWKSelector selector = new JWKSelector(new JWKMatcher.Builder()
                    .keyID(jwt.getHeader().getKeyID())
                    .keyType(com.nimbusds.jose.jwk.KeyType.EC)
                    .algorithms(JWSAlgorithm.ES256)
                    .build());

            List<JWK> matches = getJwkSource(issuer).get(selector, null);
            if (matches.isEmpty()) {
                throw new IllegalArgumentException("No matching JWK found");
            }

            ECKey ecKey = matches.get(0).toECKey();
            if (!jwt.verify(new ECDSAVerifier(ecKey))) {
                throw new IllegalArgumentException("Invalid JWT signature");
            }

            Date expiration = claims.getExpirationTime();
            if (expiration == null || expiration.before(new Date())) {
                throw new IllegalArgumentException("JWT expired");
            }

            return claims;
        } catch (ParseException | JOSEException e) {
            throw new IllegalArgumentException("Unable to verify JWT", e);
        }
    }

    private JWKSource<SecurityContext> getJwkSource(String issuer) {
        return jwkSources.computeIfAbsent(issuer, key -> {
            try {
                return new RemoteJWKSet<>(new URL(normalizeIssuer(key) + "/.well-known/jwks.json"));
            } catch (MalformedURLException e) {
                throw new IllegalArgumentException("Invalid JWT issuer URL", e);
            }
        });
    }

    private String normalizeIssuer(String issuer) {
        return issuer.endsWith("/") ? issuer.substring(0, issuer.length() - 1) : issuer;
    }

    public JWTClaimsSet extractAllClaims(String token) {
        return parseVerifiedClaims(token);
    }

    public String extractEmail(String token) {
        Object emailClaim = extractAllClaims(token).getClaim("email");
        return emailClaim == null ? null : emailClaim.toString();
    }

    public String extractUserId(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isTokenExpired(String token) {
        Date expiration = extractAllClaims(token).getExpirationTime();
        return expiration == null || expiration.before(new Date());
    }

    public boolean validateToken(String token) {
        try {
            extractAllClaims(token);
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
}
