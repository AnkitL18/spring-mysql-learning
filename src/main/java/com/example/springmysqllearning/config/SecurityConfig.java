package com.example.springmysqllearning.config;

import com.example.springmysqllearning.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // BCrypt password hashing
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // AuthenticationManager used during login
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }

    // Main Spring Security configuration
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            UserDetailsService userDetailsService)
            throws Exception {

        http

                // We are using JWT, so CSRF is disabled
                .csrf(csrf -> csrf.disable())

                // Disable browser Basic Authentication
                .httpBasic(httpBasic -> httpBasic.disable())

                // Disable default login page
                .formLogin(formLogin -> formLogin.disable())

                // JWT is stateless
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // Authorization rules
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                HttpMethod.GET,
                                "/customers",
                                "/customers/**"
                        ).hasAnyRole("USER", "ADMIN")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/customers"
                        ).hasAnyRole("USER", "ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/customers/**"
                        ).hasAnyRole("USER", "ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/customers/**"
                        ).hasRole("ADMIN")
                        // Authentication endpoints are public
                        .requestMatchers("/auth/**").permitAll()

                        // Public user endpoint
                        .requestMatchers("/users/public").permitAll()

                        // GET users → USER or ADMIN
                        .requestMatchers(
                                HttpMethod.GET,
                                "/users",
                                "/users/**"
                        ).hasAnyRole("USER", "ADMIN")

                        // Create user → ADMIN only
                        .requestMatchers(
                                HttpMethod.POST,
                                "/users"
                        ).hasRole("ADMIN")

                        // Update user → ADMIN only
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/users/**"
                        ).hasRole("ADMIN")

                        // Delete user → ADMIN only
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/users/**"
                        ).hasRole("ADMIN")

                        // AI endpoints → USER or ADMIN
                        .requestMatchers("/ai/**")
                        .hasAnyRole("USER", "ADMIN")

                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )

                // Tell Spring Security to use our MySQL-backed UserDetailsService
                .userDetailsService(userDetailsService)

                // Run JWT filter before username/password authentication filter
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}