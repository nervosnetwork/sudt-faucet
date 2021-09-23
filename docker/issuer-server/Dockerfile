# syntax=docker/dockerfile:1
FROM node:12 as build

WORKDIR /app
COPY . .
RUN yarn install && yarn build:lib
RUN cd packages/app-server-issuer && yarn build


FROM node:12 as deps

WORKDIR /app
COPY . .
RUN yarn install --prod


FROM node:12-alpine

WORKDIR /app
COPY --from=deps /app .
COPY --from=build /app/packages/commons/dist ./packages/commons/dist
COPY --from=build /app/packages/app-server-issuer/dist ./packages/app-server-issuer/dist
COPY --from=build /app/ckit/packages/base/dist ./ckit/packages/base/dist
COPY --from=build /app/ckit/packages/ckit/dist ./ckit/packages/ckit/dist
COPY --from=build /app/ckit/packages/easy-byte/dist ./ckit/packages/easy-byte/dist
COPY --from=build /app/ckit/packages/mercury-client/dist ./ckit/packages/mercury-client/dist
COPY --from=build /app/ckit/packages/rc-lock/dist ./ckit/packages/rc-lock/dist
COPY --from=build /app/ckit/packages/tippy-client/dist ./ckit/packages/tippy-client/dist
COPY --from=build /app/ckit/packages/utils/dist ./ckit/packages/utils/dist
CMD cd packages/app-server-issuer && node ./dist/index.js
