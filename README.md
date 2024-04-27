# ФСП "Кубок регионов" backend

## Зависимости проекта

- GigaChat API
- MinIO
- PostgreSQL
- proverkacheckov.com API

## Как развернуть API "ОтчетЭксперт"

1. Необходимо заполнить все необходимые переменные среды, путем заполнения `.env` файла в корне репозитория (пример такого файла находится в `example.env`)
2. Получить доступ ко всем необходимым API и внести токены в `.env`
3. Приложение можно развернуть с помощью `docker-compose`, в корне репозитория выполняем команду:
   ```
   $ docker compose up -d
   ```
4. При первом запуске необходимо будет [настроить MinIO](#как-настроить-minio).

## Как настроить MinIO

1. Для этого переходим по адресу `http://localhost:9001`, где нас встречает форма авторизации, вводим данные из `.env` файла с ключами `MINIO_ROOT_USER` и `MINIO_ROOT_PASSWORD`.
2. После успешной авторизации переходим в **Access Keys** создаём новый ключ и заносим `ACCESS KEY` и `SECRET KEY` в `.env` файл, под ключами `MINIO_ACCESS_KEY` и `MINIO_SECRET_KEY`, соответственно
3. После чего необходимо перезапустить приложение

```
$ docker compose down
$ docker compose up -d
```

4. Переходим в панель MinIO и настраиваем политику просмотра на **public**

   Переходим в Buckets

   ![aa](https://i.imgur.com/i0UIiE3.png)

   Выбираем "images"
   ![переносим_фото](https://i.imgur.com/5R4uqbM.png)

   Меняем `Access Policy` на `public`

   ![](https://i.imgur.com/kriN2sV.png)
   ![](https://i.imgur.com/Cnx0D51.png)

5. MinIO настроен и готов к эксплаутации
