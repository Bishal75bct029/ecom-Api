FROM node:20-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install -g pnpm
RUN pnpm i

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "start"]