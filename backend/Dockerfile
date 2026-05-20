# --- Build stage ---
FROM maven:3.9.7-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Cache dependencies layer
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

# --- Runtime stage ---
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
COPY --from=build /app/target/*.jar app.jar
USER appuser
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
