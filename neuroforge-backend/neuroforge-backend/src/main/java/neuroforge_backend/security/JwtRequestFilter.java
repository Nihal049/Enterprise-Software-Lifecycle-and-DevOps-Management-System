package neuroforge_backend.security;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.ExpiredJwtException; // <-- ADDED THIS IMPORT

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    public JwtRequestFilter(CustomUserDetailsService userDetailsService, JwtUtil jwtUtil) {
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // 1. Grab the "Authorization" header from the incoming HTTP request
        final String authorizationHeader = request.getHeader("Authorization");

        String email = null;
        String jwt = null;

        // 2. Check if the header contains a Bearer token
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7); // Cut off "Bearer " to get just the token

            // <-- FIX: CATCH THE EXPIRED TOKEN CRASH HERE
            try {
                email = jwtUtil.extractUsername(jwt);   // Decode the token to get the user's email
            } catch (ExpiredJwtException e) {
                System.out.println("Dead token caught and ignored. Forcing user to log in again.");
            } catch (Exception e) {
                System.out.println("Invalid token caught and ignored.");
            }
        }

        // 3. If we found an email, let's validate it!
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = this.userDetailsService.loadUserByUsername(email);

            // 4. If the token isn't fake or expired, generate a VIP Pass!
            if (jwtUtil.validateToken(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken vipPass = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());

                vipPass.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 5. Let Spring Security know this user is officially logged in for this request
                SecurityContextHolder.getContext().setAuthentication(vipPass);
            }
        }

        // 6. Send the request down the chain to the actual Controller
        chain.doFilter(request, response);
    }
}