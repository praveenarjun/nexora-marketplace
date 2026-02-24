# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -pl user-service -am -DskipTests

# Stage 2: Run
FROM eclipse-temurin:17-jre
WORKDIR /app
RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring
COPY --from=build /app/user-service/target/*.jar app.jar
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget -q -O - http://localhost:8083/actuator/health || exit 1
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
