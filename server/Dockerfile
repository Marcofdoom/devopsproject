#Very similar to the springboot hello world Dockerfile
FROM maven:latest as build
COPY . /build
WORKDIR /build
RUN mvn clean package
FROM java:8
WORKDIR /opt/Spring_Day_Two
COPY --from=build /build/target/Spring_Day_Two-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["/usr/bin/java", "-jar", "app.jar"]
