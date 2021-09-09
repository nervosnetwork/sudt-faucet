FROM node

WORKDIR /var/lib

RUN git clone https://account:token@github.com/nervosnetwork/sudt-faucet.git
RUN cd sudt-faucet/ && git checkout develop
RUN cd sudt-faucet/ && git submodule update --init && yarn install && yarn build:lib

RUN cd sudt-faucet/packages/app-ui-issuer && yarn build && cp -r build/ ../app-server-issuer/
RUN cd sudt-faucet/packages/app-ui-claim && yarn build
RUN cd sudt-faucet/packages/app-server-issuer && yarn build


RUN apt-get update \
  && apt-get install -y --no-install-recommends nginx \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*


EXPOSE 1570
EXPOSE 1080
EXPOSE 1081

CMD cd sudt-faucet/packages/app-server-issuer \
    && nginx -c /etc/nginx/nginx.conf && nginx -t \
    && nginx -s reload && sleep 20 \
    && npx knex migrate:latest --knexfile ./src/db/knexfile.ts --env development \
    && node dist/index.js


