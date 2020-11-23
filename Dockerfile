FROM node:12-alpine

ENV NODE_ENV=prod

COPY . /app
WORKDIR /app
RUN yarn --prod=false && \
  yarn build && \
  yarn --prod=true && \
  rm -rf src

CMD yarn start