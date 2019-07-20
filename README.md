# devopsproject README

## Installing docker, docker-compose and docker swarm

### Creating the Virtual Machines

Firstly, you'll want to create two virtual machines in Azure. Create an account in Azure, open the CLI in the Azure portal and enter these commands to create a new resource group and two new VMs.

Create the resource group.
```
az group create --location ukwest --name myResourceGroup.
```

Create the VMs.
```
az vm create --resource-group myResourceGroup --image UbuntuLTS --location ukwest --generate-ssh-keys --name manager
az vm create --resource-group myResourceGroup --image UbuntuLTS --location ukwest --generate-ssh-keys --name worker
```

Next, we need to get Docker and docker-compose installed on both VMs as well as activating the ability to use docker-swarm. On both machines follow these commands.

### Installing docker
```
sudo apt-get update
sudo apt-get install docker.io -y
sudo usermod -aG docker $(whoami)
```
Exit the VM and re-enter it for the installation to take effect and enter the commands below.
```
sudo systemctl start docker
sudo systemctl enable docker
```

You can check that docker is installed by either typing "docker" which will list available docker commands or by running the docker hello-world image using the command below.
```
docker run hello-world
```
### Installing docker-compose
Next step is to install docker-compose on both machines.
```
sudo curl -L "https://github.com/docker/compose/releases/download/1.23.2/docker-compose-$(uname -s)-$(uname -m)" -o/usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```
To test if docker-compose has installed correctly, type docker-compose and it should come up with a list of possible commands you can use with docker-compose.

### Installing docker swarm
After installing both docker and docker-compose on both machines, its time to install docker swarm! On the Manager VM, run the command below. This will initialise docker swarm on our Manager VM. Make a note of the token code that is generated in the console as we will need this in order for our second VM to join the swarm as a worker node.
```
docker swarm init
```
SSH into the second VM (Worker) and type the docker swarm join command that was displayed in the Manager VM, youll have to replace "SOME_TOKEN_KEY" with the key that was generated for you.
```
docker swarm join --token SOME_TOKEN_KEY 10.0.0.5:2377
```
## Cloning the devops project into our enviornment
From now on all work will be done in the Manager node. SSH into the Manager node and start by cloning down the devops github project into this VM.
```
https://github.com/Marcofdoom/devopsproject.git
```
### Create a local registry
In order to run the devops project in swarm mode, firstly all images need to be created and pushed up to a local registry or dockerhub.

To setup a local registry, enter this command.
```
docker service create --name registry --publish published=5000,target=5000 registry:2
```
### Building our images and pushing them to the local registry
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

### Nginx
#### nginx.conf

The nginx container is responsible for forwarding requests. The nginx.conf file details what it should communicate to. It listens on port 80, and will pass on requests to the client (the static_website) on port 8089 and the server on port 8084.
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

### Static Website
#### server.js
The static website is built using Node.js. server.js tell the application to listen on port 8089.
```
var express = require('express');
var app = express();

app.use(express.static('public'))

app.listen(8089);
```
#### script.js
The static website has two http requests. A Get request which sends a request to the server on port 8084 via /getAllAccounts and a Port request on port 8084 via /addAccount.
```
...
'GET', 'http://51.140.121.39:8084/getAllAccounts'
...
'POST', 'http://51.140.121.39:8084/addAccount'
...
```
### Server
#### application.properties
The application.properties file details the port of the server as well as defining urls that are used in the business logic layer in the spring boot application (AccountService.java).

From here, the server can communicate to each of the three microservices using the end points that they expose which are mentioned under the Numgen, Texgen and Prizegen sections below.
```
...
server.port=8084

url.getAll=http://prizegen:5002/account/all
url.textGen=http://texgen:9018/texgen
url.numGen=http://numgen:9019/numgen
url.prize=http://prizegen:5002/account/createAccount
```
### Numgen
#### app.py
This function exposes the end point /numgen in order for the server to access this container.
```
@app.route('/numgen', methods=['GET'])
...
```
The test function exposes the end point /test for testing purposes only.
```
@app.route('/test', methods=['GET'])
...
```
The application sets its port to 9019 in order for the server to communicate with it.
```
if __name__ == '__main__':
     app.run(host='0.0.0.0', port=9019)
```
### Texgen
#### app.py
This function exposes the end point /texgen in order for the server to access this container.
```
@app.route('/texgen', methods=['GET'])
...
```
The test function exposes the end point /test for testing purposes only.
```
@app.route('/test', methods=['GET'])
...
```
The application sets its port to 9018 in order for the server to communicate with it.
```
if __name__ == '__main__':
     app.run(host='0.0.0.0', port=9018)
```
### Prizegen
#### account.js
This function exposes the /all end point. When called it will send an HTTP GET request to the db_connector which is on port 5001.
```
router.get("/all", (req, res) => {
  axios.get('http://db_connector:5001/account/all')
...
```
This function exposes the /createAccount end point. When called it will:
- Send an HTTP GET request to the db_connector on port 5001.
- Send an HTTP POST request to the notification_server on port 9000.
```
router.post("/createAccount", (req, res) => {
...
    axios.get('http://notificationserver:9000/notify').catch(error => {
...
    axios.post('http://db_connector:5001/account/createAccount', newAccount)
...
});
```
The test function exposes the end point /test for testing purposes only.
```
router.get("/test", (req, res) => {
...
```
### DB Connector
#### keys.js
```
module.exports = {
    mongoURI: "mongodb://mongo:27017/accounts"
  };
```
#### account.js
The account.js file in the db_connector communicates with the Mongo database using the two endpoints below.
- The GET end point /all will return all accounts from the mongo database.
- The POST end point /createAccount will create an account and add it into the mongo database.
```
// @route   GET account/all
// @desc    Get all accounts
// @access  Public
router.get("/all", (req, res) => {
...
});
```
```
// @route   POST Account/createAccount
// @desc    Create an Account
// @access  Public
router.post("/createAccount", (req, res) => {
...
});
```
