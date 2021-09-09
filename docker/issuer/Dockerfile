FROM node

WORKDIR /var/lib

RUN git clone https://account:token@github.com/nervosnetwork/sudt-faucet.git
RUN cd sudt-faucet/ && git checkout fix-deploy
RUN cd sudt-faucet/ && git submodule update --init && yarn install && yarn build:lib

RUN cd sudt-faucet/packages/app-ui-issuer && yarn build && cp -r build/ ../app-server-issuer/
RUN cd sudt-faucet/packages/app-server-issuer && yarn build

EXPOSE 1570
CMD cd sudt-faucet/packages/app-server-issuer && sleep 30 && npx knex migrate:latest --knexfile ./src/db/knexfile.ts --env development  && node dist/index.js


