docker run --rm -p 3306:3306 --name sudt-faucet-mysql -d -e MYSQL_ROOT_PASSWORD=123456 mysql:5.7
sleep 15
docker exec sudt-faucet-mysql mysql -uroot -p123456 --protocol=tcp -e "create database sudt_faucet"

knex migrate:latest --knexfile ./knexfile.ts --env development
