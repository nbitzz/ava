# skidded off https://git.madhouselabs.net/MadHouse-Labs/file-uploader/src/branch/master/Dockerfile
FROM node:lts-alpine AS base
WORKDIR /usr/src/app

FROM oven/bun:1-debian AS base2
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json package-lock.json /temp/dev/
RUN cd /temp/dev && npm install

RUN mkdir -p /temp/prod
COPY package.json package-lock.json /temp/prod/
RUN cd /temp/prod && npm install --omit dev

FROM base AS prisma
COPY --from=install /temp/prod/node_modules node_modules
COPY . .
RUN npx prisma generate

FROM base AS prisma-dev
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
RUN npx prisma generate

FROM base2 AS build
COPY --from=prisma-dev /usr/src/app/node_modules node_modules
COPY . .
# vite build
RUN NODE_ENV=production bun --bun run build

FROM base2 AS release
COPY --from=prisma /usr/src/app/prisma prisma
COPY --from=prisma /usr/src/app/node_modules node_modules
COPY --from=build /usr/src/app/build build
COPY --from=build /usr/src/app/assets assets
COPY --from=build /usr/src/app/package.json .

EXPOSE 3000/tcp
CMD [ "bun", "run", "./build/index.js" ]