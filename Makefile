generate-keys:
	pnpm ts-node ./src/scripts/generateKeys.ts

update-rbac:
	pnpm ts-node ./src/scripts/updateRbac.ts

server:
	pnpm start:dev

build:
	pnpm build

docker:
	docker compose up --watch
