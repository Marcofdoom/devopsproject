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
This will then build all of the images within the docker-compose.yaml file. After this, you will need to navigate to the Dockerfile for the second version of the microservices and build them. From LAFB directory, using this command will navigate you to each of these Dockerfiles and then build the images.
```
cd numgen/8fig/
docker build -t localhost:5000/numgen:8fig .

cd ../texgen/3char/
docker build -t localhost:5000/texgen:3char .

cd ../prize/lowprize/
docker build -t localhost:5000/prizegen:lowprize .
```
We then have to push these images to the registry.
```
docker-compose push
docker push localhost:5000/numgen:8fig
docker push localhost:5000/texgen:3char
docker push localhost:5000/prizegen:lowprize
```
Navigate back to the LAFB directory and enter this command.
```
docker stack deploy --compose-file docker-compose.yaml stackdemo
```
This will then spin up all services for this project. You can check if all the services have run successfully by using the command below.
```
docker service list
```
If you now navigate to the URL and enter the ip address of your machine, you should be able to see this web page.
