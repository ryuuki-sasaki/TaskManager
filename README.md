起動手順

```
cd path/to/TaskManeger
docker-compose build
docker-compose up
```

初回起動時実行

```
DBにユーザー作成 
https://www.digitalocean.com/community/tutorials/how-to-set-up-flask-with-mongodb-and-dockerのSTEP6参照
```
sudo docker-compose -f docker-compose.production.yml exec mongodb bash
mongo -u ルートユーザー名 -p (ルートユーザー名,パスワードはdocker-compose.production.ymlのmongodbのMONGO_INITDB_ROOT_USERNAME, MONGO_INITDB_ROOT_PASSWORD参照)
use DB名 (DB名はdocker-compose.production.ymlのmongodbのMONGO_INITDB_DATABASE参照)
db.createUser({user: 'ユーザー名', pwd: 'パスワード', roles: [{role: 'readWrite', db: 'DB名'}]})　(ユーザー名,パスワード,DB名はdocker-compose.production.ymlのflaskのMONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_DATABASE参照)
exit
#作成したユーザでログインできることを確認
mongo -u ユーザー名 -p パスワード --authenticationDatabase DB名
exit
exit
```
初期セットアップスクリプト実行
```
cd path/to/TaskManeger
sudo docker-compose -f docker-compose.production.yml exec flask python3 init_setup.py
```