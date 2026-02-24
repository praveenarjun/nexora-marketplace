import os

services = ["discovery-server", "config-server", "api-gateway", "product-service", "order-service", "inventory-service", "user-service", "notification-service"]

# Fix docker-compose.yml
with open("docker-compose.yml", "r") as f:
    compose = f.read()

for s in services:
    compose = compose.replace(f"context: ./{s}", f"context: .\n      dockerfile: {s}/Dockerfile")

with open("docker-compose.yml", "w") as f:
    f.write(compose)

# Fix Dockerfiles
for s in services:
    path = f"{s}/Dockerfile"
    with open(path, "r") as f:
        lines = f.readlines()
    
    new_lines = []
    for line in lines:
        if "COPY pom.xml ." in line:
            new_lines.append("COPY . .\n")
        elif "RUN mvn dependency:go-offline" in line:
            continue
        elif "COPY src ./src" in line:
            continue
        elif "RUN mvn clean package -DskipTests" in line:
            new_lines.append(f"RUN mvn clean package -pl {s} -am -DskipTests\n")
        elif "COPY --from=build /app/target/*.jar app.jar" in line:
            new_lines.append(f"COPY --from=build /app/{s}/target/*.jar app.jar\n")
        else:
            new_lines.append(line)
            
    with open(path, "w") as f:
        f.writelines(new_lines)

print("Docker context correctly updated for Multi-Module!")
