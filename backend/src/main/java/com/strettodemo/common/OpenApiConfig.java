package com.strettodemo.common;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("Bankruptcy Case Tracker API")
                        .description("""
                                Full-stack case management API for bankruptcy attorneys and trustees.
                                
                                **How to authenticate:**
                                1. Call `POST /api/auth/login` with `{"email":"admin@strettodemo.com","password":"demo1234"}`
                                2. Copy the `token` from the response
                                3. Click the **Authorize** button above, enter `Bearer <token>`, click Authorize
                                4. All subsequent requests will include the JWT automatically
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Stretto Demo")
                                .url("https://github.com/chutieu312/bankruptcy-case-tracker")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Paste your JWT token here (without the 'Bearer ' prefix)")));
    }
}
