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
import com.example.springmysqllearning.security.RestAccessDeniedHandler;
import com.example.springmysqllearning.security.RestAuthenticationEntryPoint;
@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    private final RestAuthenticationEntryPoint
            authenticationEntryPoint;

    private final RestAccessDeniedHandler
            accessDeniedHandler;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            RestAuthenticationEntryPoint authenticationEntryPoint,
            RestAccessDeniedHandler accessDeniedHandler) {

        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;

        this.authenticationEntryPoint =
                authenticationEntryPoint;

        this.accessDeniedHandler =
                accessDeniedHandler;
    }

    // =========================================================
    // PASSWORD ENCODER
    // =========================================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // =========================================================
    // AUTHENTICATION MANAGER
    // =========================================================

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }

    // =========================================================
    // SECURITY FILTER CHAIN
    // =========================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            UserDetailsService userDetailsService)
            throws Exception {

        http

                // -------------------------------------------------
                // JWT API → CSRF not required
                // -------------------------------------------------

                .csrf(csrf -> csrf.disable())

                // -------------------------------------------------
                // Disable browser authentication mechanisms
                // -------------------------------------------------

                .httpBasic(httpBasic -> httpBasic.disable())

                .formLogin(formLogin -> formLogin.disable())

                // -------------------------------------------------
                // JWT is stateless
                // -------------------------------------------------

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(
                                authenticationEntryPoint
                        )
                        .accessDeniedHandler(
                                accessDeniedHandler
                        )
                )

                // =================================================
                // AUTHORIZATION RULES
                // =================================================

                .authorizeHttpRequests(auth -> auth

                        // -------------------------------------------------
                        // PUBLIC ENDPOINTS
                        // -------------------------------------------------

                        .requestMatchers("/auth/**")
                        .permitAll()

                        .requestMatchers("/users/public")
                        .permitAll()


                        // =================================================
                        // DASHBOARD + REPORTS
                        // USER + ADMIN
                        // =================================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/dashboard/**",
                                "/reports/**"
                        )
                        .hasAnyRole("USER", "ADMIN")


                        // =================================================
                        // ORDERS
                        // =================================================

                        // View orders
                        .requestMatchers(
                                HttpMethod.GET,
                                "/orders",
                                "/orders/**"
                        )
                        .hasAnyRole("USER", "ADMIN")

                        // Create order
                        .requestMatchers(
                                HttpMethod.POST,
                                "/orders"
                        )
                        .hasAnyRole("USER", "ADMIN")

                        // Change order status
                        // Administrative/operational action
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/orders/**"
                        )
                        .hasRole("ADMIN")


                        // =================================================
                        // INVENTORY
                        // =================================================

                        // Everyone authenticated can view inventory
                        .requestMatchers(
                                HttpMethod.GET,
                                "/inventory",
                                "/inventory/**"
                        )
                        .hasAnyRole("USER", "ADMIN")

                        // Inventory creation/modification → ADMIN
                        .requestMatchers(
                                HttpMethod.POST,
                                "/inventory/**"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/inventory/**"
                        )
                        .hasRole("ADMIN")


                        // =================================================
                        // SUPPLIERS
                        // =================================================

                        // View suppliers
                        .requestMatchers(
                                HttpMethod.GET,
                                "/suppliers",
                                "/suppliers/**"
                        )
                        .hasAnyRole("USER", "ADMIN")

                        // Manage suppliers → ADMIN
                        .requestMatchers(
                                HttpMethod.POST,
                                "/suppliers"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/suppliers/**"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/suppliers/**"
                        )
                        .hasRole("ADMIN")


                        // =================================================
                        // PURCHASES
                        // =================================================

                        // View purchases
                        .requestMatchers(
                                HttpMethod.GET,
                                "/purchases",
                                "/purchases/**"
                        )
                        .hasAnyRole("USER", "ADMIN")

                        // Create / update purchases → ADMIN
                        .requestMatchers(
                                HttpMethod.POST,
                                "/purchases"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/purchases/**"
                        )
                        .hasRole("ADMIN")


                        // =================================================
                        // CATEGORIES
                        // =================================================

                        // View categories
                        .requestMatchers(
                                HttpMethod.GET,
                                "/categories",
                                "/categories/**"
                        )
                        .hasAnyRole("USER", "ADMIN")

                        // Manage categories → ADMIN
                        .requestMatchers(
                                HttpMethod.POST,
                                "/categories"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/categories/**"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/categories/**"
                        )
                        .hasRole("ADMIN")


                        // =================================================
                        // PRODUCTS
                        // =================================================

                        // View products
                        .requestMatchers(
                                HttpMethod.GET,
                                "/products",
                                "/products/**"
                        )
                        .hasAnyRole("USER", "ADMIN")

                        // Manage products → ADMIN
                        .requestMatchers(
                                HttpMethod.POST,
                                "/products"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/products/**"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/products/**"
                        )
                        .hasRole("ADMIN")


                        // =================================================
                        // CUSTOMERS
                        // =================================================

                        // View customers
                        .requestMatchers(
                                HttpMethod.GET,
                                "/customers",
                                "/customers/**"
                        )
                        .hasAnyRole("USER", "ADMIN")

                        // Create/update customer
                        .requestMatchers(
                                HttpMethod.POST,
                                "/customers"
                        )
                        .hasAnyRole("USER", "ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/customers/**"
                        )
                        .hasAnyRole("USER", "ADMIN")

                        // Delete customer → ADMIN
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/customers/**"
                        )
                        .hasRole("ADMIN")


                        // =================================================
                        // APPLICATION USERS
                        // ADMIN ONLY
                        // =================================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/users",
                                "/users/**"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/users"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/users/**"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/users/**"
                        )
                        .hasRole("ADMIN")


                        // =================================================
                        // GEMINI AI
                        // USER + ADMIN
                        // =================================================

                        .requestMatchers("/ai/**")
                        .hasAnyRole("USER", "ADMIN")


                        // =================================================
                        // EVERYTHING ELSE
                        // =================================================

                        .anyRequest()
                        .authenticated()
                )

                // -------------------------------------------------
                // MySQL-backed UserDetailsService
                // -------------------------------------------------

                .userDetailsService(userDetailsService)

                // -------------------------------------------------
                // JWT filter executes before standard authentication
                // -------------------------------------------------

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}