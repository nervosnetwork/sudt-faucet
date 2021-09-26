# SUDT Faucets 操作手册

## 预备

### 环境

- Node.js12+
- Yarn 1.x
- PM2(或其他  daemon 进程管理工具)
- NGINX(或其他 http server)

### 服务

- **SendGrid** 账户：Issuer Server 使用 [SendGrid](https://sendgrid.com/) 作为邮件服务，如需要使用邮件进行空投，我们需要先注册 SendGrid [API_KEY](https://docs.sendgrid.com/ui/account-and-settings/api-keys) ，并进行[域名认证](https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication)

### 管理

> 私钥极为重要，请注意不要暴露，否则将导致资金被盗

- **Owner** 私钥：用于作为发行者身份进行铸造（mint）token，目前支持使用 [MetaMask](https://metamask.io) 作为签名工具。如果不熟悉 MetaMask 使用可以看看[这个帖子](https://zhuanlan.zhihu.com/p/112285438)。同时，Owner 也是登录 Issuer 相关服务的唯一角色
- **Hosted** 私钥：托管在 Issuer Server 的私钥。当用户进行 claim 时，服务将使用该私钥进行转账操作

###  预备好了

若是完成了上述准备工作，我们可以记录下相关数据，以供部署使用

- Owner 私钥： 0x... 
- Owner 地址： 0x...
- Hosted 私钥：0x... 
- SENDGRID_API_KEY='SG...'
- SENDGRID_VERIFIED_SENDER='xxxxx@gmail.com'




## 二、构建启动服务

#### 准备环境

- 系统信息

- 环境依赖

    - Docker： docker version

      ```shell
      Client: Docker Engine - Community
       Version:           19.03.12
      
      Server: Docker Engine - Community
       Engine:
        Version:          19.03.12
      ```

    - Node：v12.18.2 及以上

#### 准备环境
在构建 UI 以及启动 server 前，我们需要配置好相关环境地变量

我们提供了一份模板 env 于[deploy](../deploy) 文件夹下，两个默认配置文件 `.env.aggron` 与 `.env.lina`，分别对应 CKB 测试网与主网。我们可以复制一份 env 变量并修改为符合自己环境的变量

可以先看看 .env.lina 配置都有哪些项目

  ```shell
    # ----------- commons -----------
    NETWORK=Lina
    CKB_NODE_URL='https://mainnet.ckb.dev/rpc'
    CKB_INDEXER_URL='https://mainnet.ckb.dev/indexer'
    
    # ----------- Faucet Server -----------
    ## A private key hosted by issuer server which is used for transferring automatically.
    ## Note: Recommend to set when launching server
    ## PRIVATE_KEY='0x...'
    
    ## The issuer Ethereum address
    USER_ADDRESS='0x...'
    
    MYSQL_HOST=mysql-sudt-faucet
    MYSQL_PORT=3306
    MYSQL_PASSWORD=
    MYSQL_DATABASE=sudt_faucet
    
    SENDGRID_API_KEY='MY_SENDGRID_API_KEY'
    SENDGRID_VERIFIED_SENDER='MY_SENDGRID_VERIFIED_SENDER'
    
    BATCH_TRANSACTION_LIMIT=100
    BATCH_MAIL_LIMIT=50
    CLAIM_SUDT_DOMAIN="MY_DOMAIN"
    
    SERVER_LISTEN_PORT=1570
    
    # ----------- UI -----------
    ## Unipass authentication URL
    REACT_APP_UNIPASS_URL=https://unipass.xyz
    ## Social token wallet URL
    REACT_APP_WALLET_URL=https://tok.social
    ## Nervosnetwork explorer URL
    REACT_APP_NERVOS_EXPLORER_URL=https://explorer.nervos.org
    
    REACT_APP_NETWORK=Lina
    REACT_APP_CKB_NODE_URL='https://mainnet.ckb.dev/rpc'
    REACT_APP_CKB_INDEXER_URL='https://mainnet.ckb.dev/indexer'
  ```

#### 依赖构建

```shell
# 下载 submodule
cd sudt-faucet && yarn install && git submodule update --init

yarn run build:lib

export $(grep -v '^#' deploy/.env.lina | xargs)

# 构建 app-server-issuer 代码。
yarn workspace @sudt-faucet/app-server-issuer  run build

# 构建 app-ui-issuer 代码
yarn workspace @sudt-faucet/app-ui-issuer run build

# 构建 app-ui-claim 代码
yarn workspace @sudt-faucet/app-ui-claim  run build

```



#### Nginx 启动

- Nginx 配置文件，可以命名为 `sudt_faucet` ，下面配置中 注释的代码就是 之前准备的域名。

    - 配置中 `/var/lib/sudt-faucet/packages/app-ui-claim/build`   是对应的项目代码位置，必须根据实际位置将其替换

  ```
  # upstream sudt.faucet.me { 
  #     server 127.0.0.1 max_fails=7 fail_timeout=7s;
  # }
  
  server {
      listen       1081;
      # server_name  sudt.faucet.me;
      location / {
          root /var/lib/sudt-faucet/packages/app-ui-claim/build;
      }
      location /sudt-issuer/api/v1{
          proxy_pass http://127.0.0.1:1570;
          proxy_redirect     off;
      }
  }
  server {
      listen       1080;
      # server_name  sudt.faucet.me;
  
      client_max_body_size 1024M;
      client_body_buffer_size 1024M;
      fastcgi_intercept_errors on;
      location / {
          root /var/lib/sudt-faucet/packages/app-ui-issuer/build;
      }
  
      location /sudt-issuer/api/v1 {
          proxy_pass http://127.0.0.1:1570;
          proxy_redirect     off;
      }
  }
  ```

- 下载，启动 Nginx

  ```shell
  # 安装 nginx 
  apt-get update \
    && apt-get install -y --no-install-recommends nginx \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
    
  # 将之前准备的 nginx 配置文件复制到 nginx 默认目录下
  cp sudt_faucet /etc/nginx/sites-enabled/sudt_faucet
    
  # 测试 nginx 配置文件是否可用，并且重启生效
  nginx -c /etc/nginx/nginx.conf && nginx -t && nginx -s reload
  ```



#### mysql 启动

> 初次启动服务前，需要初始化 mysql，我们可以通过 app-server-issuer/src/db 下的脚本进行建表操作
```shell
cd packages/app-server-issuer
npx knex migrate:latest --knexfile dist/db/knexfile.js
```



#### 服务启动

- 通过 PM2 维护服务

  ```shell
  export $(grep -v '^#' deploy/.env.lina | xargs) && cd packages/app-server-issuer  && pm2 start --name issuer-server "node dist/index.js"
  ```





## 三、如何使用系统

### Owner

这是整个系统的拥有者，涉及到

#### 1、选择登录 Login

- 打开 系统界面

  ![](https://upload.cc/i1/2021/09/13/wirM98.png)

- 登录后可以看到主页面

  ![](https://upload.cc/i1/2021/09/11/dMB43g.png)



#### 2、创建Token

![](https://upload.cc/i1/2021/09/11/HRkBh2.png)

#### 3、管理已经创建的Token

![](https://upload.cc/i1/2021/09/11/Wsxcop.png)

##### Issue 功能

- 给已知CKB 地址的用户 分配 token

  ![](https://upload.cc/i1/2021/09/11/HaoALl.png)

- 单独给某个用户邮箱 发送邮件，邮件内部包含 领取Token的凭证

  ![](https://upload.cc/i1/2021/09/11/gBcI9X.png)

- 批量给多个用户邮箱 发送邮件，邮件内部包含 领取Token的凭证

  ![](https://upload.cc/i1/2021/09/11/MdQpw3.png)



##### Management 功能

![](https://upload.cc/i1/2021/09/13/qLyANB.png)

- charge 功能组件： 点击 change 从 Owner 账户转帐给 Hosted 账户，需要注意地是，这里的 token 是使用 mint 方式进行增发，也就是说，使用 charge 功能会增加当前流通量（current supply）

  ![](https://upload.cc/i1/2021/09/13/9NQztj.png)

- disable 功能组件： 点击 disable 可以取消该用户领取 token 的权利



### User

#### 1、打开包含凭证的邮件

![](https://upload.cc/i1/2021/09/11/TSDc1H.png)

#### 2、 领取Token

![](https://upload.cc/i1/2021/09/11/WEN46G.png)



## 四、注意事项

#### 服务维护

- mysql 建议使用 **云数据库 RDS** 保障数据高可用

  邮件发送后，我们会在数据库中写入记录，如果此时磁盘挂了，虽然不会造成资产损失，由于 claim secret 丢失导致没来得及 claim 的用户无法 claim。

  如果有数据可用性需求，那么需要有备份数据的策略

    - 主从库的方式：成本较高，但安全性较高
    - snapshot 定期备份的方式：成本较低，但可能导致用户重复 claim

#### 账户安全

- Owner 账户 和 Hosted 账户都会涉及到资产，注意保管‼️

