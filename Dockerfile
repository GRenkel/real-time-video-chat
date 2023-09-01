FROM node:20.5.1-alpine3.18
WORKDIR /web-chat
COPY  . /web-chat/
RUN npm i
EXPOSE 5000
EXPOSE 3000
ENTRYPOINT [ "npm", "start"]