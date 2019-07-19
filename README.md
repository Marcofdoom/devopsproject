# devopsproject

Setting up the project

first clone down the git hub project.

```
https://github.com/Marcofdoom/devopsproject.git
```

In order to run the devops project in swarm mode, firstly all images need to be created and pushed up to a local registry or dockerhub.

To setup a local registry, enter this command.
```
docker service create --name registry --publish published=5000,target=5000 registry:2
```

Navigate to the docker-compose.yaml file under the directory LAFB, and enter this command.
```
docker-compose build
```
