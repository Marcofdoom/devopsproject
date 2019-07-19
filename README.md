# devopsproject

## Setting up and running the devopsproject

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
If you enter the machines ip address into your web browzer, the image below should show up!
![landingpage](https://user-images.githubusercontent.com/46506164/61532704-8c3e1680-aa22-11e9-9325-25b96de3b0f8.png)

Enter a first name and last name and then click "create account". if all goes well, you should see this log within the console (Push F12 in your web browzer).

![creation](https://user-images.githubusercontent.com/46506164/61533158-e390b680-aa23-11e9-980c-325099bff651.png)

Pushing the "Get All Accounts" button should display this in the console.

![array](https://user-images.githubusercontent.com/46506164/61533131-d4aa0400-aa23-11e9-85a8-351a77cc9c23.png)

## Changing images (Services)
One of the great things about dockerizing our application is that it is very easy to change out different parts of it.

The account number is created via two different services, by concatinating the output from the text generator service and number generator service.

While setting up our project above we created two different images for each of these microservices. Notice in the image below the account number is "sev96992625".

![accountnumber2](https://user-images.githubusercontent.com/46506164/61534215-e5a84480-aa26-11e9-977b-dc18463814ea.png)

We are currently using the images:
- localhost:5000/numgen:3char for our text generator.
- localhost:5000/texgen:8fig  for our number generator.
- localhost:5000/prize:highprize for our prize generator.

if we wanted to change out these implementations to our other versions, we can use the commands below and it will swap out these services live!

```
docker service update --image localhost:5000/numgen:6fig stackdemo_numgen
docker service update --image localhost:5000/texgen:2char stackdemo_texgen
docker service update --image localhost:5000/prize:lowprize stackdemo_prizegen
```

After the update, adding any additional accounts will now use these new microservices. notice below that the new account number consists of just 2 letters and 6 numbers!

![accountnumber1](https://user-images.githubusercontent.com/46506164/61534210-e17c2700-aa26-11e9-866f-ddab75f067fb.png)

## The Architecture

![architecture](https://user-images.githubusercontent.com/46506164/61539333-3887f900-aa33-11e9-8760-7e8282aa8489.png)

### nginx
#### nginx.conf
```
events {}
http {
	server {
		listen 80;
		location / {
			proxy_pass http://client:8089/;
		}
                location /server/ {
                        proxy_pass http://server:8084/;
                }
	}
}
```

### db_connector
#### keys.js
```
module.exports = {
    mongoURI: "mongodb://mongo:27017/accounts"
  };
```

### Server
#### application.properties
```
...

server.port=8084

url.getAll=http://prizegen:5002/account/all
url.textGen=http://texgen:9018/texgen
url.numGen=http://numgen:9019/numgen
url.prize=http://prizegen:5002/account/createAccount
```










