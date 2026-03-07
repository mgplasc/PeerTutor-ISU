//Global CORS configuration for the application
package com.peertutor.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")  
            .allowedOrigins(
                "http://localhost:3000",     // Local development
                "http://10.0.2.2:3000",      // Android emulator
                "https://your-production-domain.com"  // Production
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true) 
            .maxAge(3600);  // Cache preflight response for 1 hour
    }
}