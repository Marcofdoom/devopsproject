# Use a base node image
FROM node:10 as client-build
WORKDIR /build
# copy contents into image
COPY . .
# execute command to download dependancies
RUN npm install
# execute command to construct node project
EXPOSE 8089
ENTRYPOINT ["/usr/local/bin/node", "server.js", "8089"]
