build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs --tail=10 -f

login:
	docker-compose run -w /application lambda-auth /bin/bash

compile:
	npm run build && cd dist && zip -r ./lambda_function.zip . && cd ..
