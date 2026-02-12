package com.minor.alumini_platform.config;

import com.minor.alumini_platform.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

  private final JwtAuthenticationFilter jwtAuthenticationFilter;

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .cors().and()
        .csrf().disable()
        .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        .and()
        .authorizeRequests()
          .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
          .antMatchers("/", "/health").permitAll()
          .antMatchers("/api/v1/alumni/register", "/api/v1/alumni/login").permitAll()
          .antMatchers("/api/v1/students/register", "/api/v1/students/login").permitAll()
          .antMatchers("/api/v1/otp/**").permitAll()
          .antMatchers("/api/v1/auth/**").permitAll()
          .antMatchers(HttpMethod.GET, "/api/v1/posts").permitAll()
          .antMatchers(HttpMethod.GET, "/api/v1/search").permitAll()
          .antMatchers("/ws-chat/**").permitAll()
          .antMatchers("/api/auth/**", "/api/public/**").permitAll()
          .antMatchers("/api/v1/**").authenticated()
          .anyRequest().authenticated()
        .and()
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}
