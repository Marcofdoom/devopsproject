# devopsproject

Setting up the project

first clone down the git hub project.


In order to run the devops project in swarm mode, firstly all images need to becreated and pushed up to a local registry or dockerhub.
To setup a local registry use
```
docker service create --name registry --publish published=5000,target=5000 registry:2
```
