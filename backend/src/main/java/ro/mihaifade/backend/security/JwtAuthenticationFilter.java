package ro.mihaifade.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import ro.mihaifade.backend.entity.User;
import ro.mihaifade.backend.repository.UserRepository;

import java.io.IOException;
import java.util.regex.Pattern;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Pattern ROMANIAN_PHONE_PATTERN =
            Pattern.compile("^07\\d{8}$");

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService,
            UserRepository userRepository
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader == null
                || !authorizationHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authorizationHeader.substring(7);
        String email;

        try {
            email = jwtService.extractEmail(token);
        } catch (Exception exception) {
            filterChain.doFilter(request, response);
            return;
        }

        if (email == null
                || SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        UserDetails userDetails;

        try {
            userDetails = userDetailsService.loadUserByUsername(email);
        } catch (Exception exception) {
            SecurityContextHolder.clearContext();
            filterChain.doFilter(request, response);
            return;
        }

        if (!userDetails.isEnabled()
                || !jwtService.isTokenValid(token, userDetails.getUsername())) {
            filterChain.doFilter(request, response);
            return;
        }

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        boolean isClient = userDetails.getAuthorities().stream()
                .anyMatch(authority ->
                        "ROLE_CLIENT".equals(authority.getAuthority()));

        if (isClient) {
            User user = userRepository.findByEmailIgnoreCase(email)
                    .orElse(null);

            String phone = user != null ? user.getPhone() : null;

            boolean validPhone = phone != null
                    && ROMANIAN_PHONE_PATTERN.matcher(phone).matches();

            String requestUri = request.getRequestURI();
            String method = request.getMethod();

            boolean profileEndpoint =
                    "PUT".equalsIgnoreCase(method)
                            && requestUri.endsWith("/api/users/me/profile");

            boolean currentUserEndpoint =
                    "GET".equalsIgnoreCase(method)
                            && requestUri.endsWith("/api/users/me");

            boolean publicContentEndpoint =
                    "GET".equalsIgnoreCase(method)
                            && (
                            requestUri.endsWith("/api/services")
                                    || requestUri.matches(".*/api/services/[^/]+")
                                    || requestUri.endsWith("/api/gallery")
                                    || requestUri.matches(".*/api/gallery/[^/]+")
                                    || requestUri.endsWith("/api/reviews")
                                    || requestUri.matches(".*/api/reviews/[^/]+")
                                    || requestUri.endsWith("/api/barbers")
                                    || requestUri.matches(".*/api/barbers/[^/]+")
                                    || requestUri.endsWith("/api/shop-settings")
                    );

            if (!validPhone
                    && !profileEndpoint
                    && !currentUserEndpoint
                    && !publicContentEndpoint) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write(
                        "{\"code\":\"PROFILE_COMPLETION_REQUIRED\","
                                + "\"message\":\"Completează profilul cu un număr de telefon românesc valid pentru a continua.\"}"
                );
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
