FROM node:20-alpine AS lambda

ENV PATH="/application/node_modules/.bin:${PATH}"
RUN apk add git openssh sudo bash libcap
RUN echo "node ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/node && chmod 0440 /etc/sudoers.d/node
RUN npm -g update
CMD cd "/application" && npm run build && npm run start
