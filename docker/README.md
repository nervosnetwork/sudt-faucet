# Use Docker to Deploy

## Config Environment

```bash
# cd project_root_directory
cp docker/.env.aggron docker/.env.aggron.local
cp docker/.env.lina docker/.env.lina.local
```

- config `docker/.env.aggron.local` before deploy applications for aggron
- config `docker/.env.lina.local` before deploy applications for lina

## Build Images

### Build Issuer-server

```bash
# cd project_root_directory
docker build -t issuer-server -f docker/issuer-server/Dockerfile .
```

### Build Issuer-ui

```bash
# cd project_root_directory

# build for aggron
docker build -t issuer-ui-aggron -f docker/issuer-ui/Dockerfile.aggron .

# build for lina
docker build -t issuer-ui-lina -f docker/issuer-ui/Dockerfile.lina .
```

### Build Claim-ui

```bash
# cd project_root_directory

# build for aggron
docker build -t claim-ui-aggron -f docker/claim-ui/Dockerfile.aggron .

# build for lina
docker build -t claim-ui-lina -f docker/claim-ui/Dockerfile.lina .
```

## Start Applications

```bash
cd docker

# start applications for aggron
docker-compose -f docker-compose.yml -f docker-compose.aggron.yml up -d

# start applications for lina
docker-compose -f docker-compose.yml -f docker-compose.lina.yml up -d
```

## Upgrade Applications

1. Rebuild the service image you want to upgrade
2. Run `cd docker && docker-compose up --no-deps -d ${service_name_you_want_to_upgrade}`
