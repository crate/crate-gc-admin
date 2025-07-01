FROM node:24.3.0-slim as build-deps

# The base node image sets a very verbose log level.
ENV NPM_CONFIG_LOGLEVEL warn

# FIXME: This should not be hardcoded
ENV VITE_GRAND_CENTRAL_URL http://localhost:5050

# Create the work dir
ADD . /home/nodeuser/app
ENV HOME /home/nodeuser
WORKDIR /home/nodeuser/app

# We are creating a specific user to be able to build
# the docker image on azure to avoid running npm tasks as root
RUN useradd -ms /bin/bash nodeuser
RUN chown -R nodeuser:nodeuser /home/nodeuser
USER nodeuser
COPY --chown=nodeuser:nodeuser package.json yarn.lock ./

ENV NODE_PATH=/home/nodeuser/app/node_modules
ENV PATH=$PATH:/home/nodeuser/app/node_modules/.bin

RUN yarn && yarn build && rm -r /home/nodeuser/app/node_modules

# Serve the gc-admin build.
FROM nginx:1.27.5

# pick up any security updates
RUN apt-get update && apt-get upgrade -y

RUN rm -rf /etc/nginx/conf.d
COPY conf /etc/nginx
COPY --from=build-deps /home/nodeuser/app/build /usr/share/nginx/html

EXPOSE 5000
CMD ["nginx", "-g", "daemon off;"]
