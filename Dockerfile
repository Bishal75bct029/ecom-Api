FROM node:20-alpine

WORKDIR /usr/src/app

COPY . .

RUN apk add --no-cache tini
RUN npm install -g pnpm
RUN pnpm i

RUN pnpm run build

EXPOSE 4000

ENTRYPOINT [ "/sbin/tini", "--", "node", "dist/main.js" ]
