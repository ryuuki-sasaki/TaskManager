起動手順

```
cd path/to/TaskManeger
docker-compose build
docker-compose up
```

初回起動時実行

```
cd path/to/TaskManeger
docker-compose exec web pyhton3 init_setup.py
```