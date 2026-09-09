package neuroforge_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // This opens up every single /api/ endpoint to the outside world
        registry.addMapping("/api/**")
                .allowedOrigins("*") // Allows requests from any frontend (HTML files, React, etc.)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allows all our CRUD operations
                .allowedHeaders("*"); // Allows any headers (like authentication tokens later)
    }
}