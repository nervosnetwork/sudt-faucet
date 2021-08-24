lint: lint-lib lint-apps
fix-lint: fix-lint-lib fix-lint-apps

lint-fix:
	yarn eslint packages/*/src/**/*.{ts,tsx} --fix
	yarn workspace issue-ui run lint --fix
	yarn workspace claim-ui run lint --fix

lint-apps:
	yarn workspace issue-ui run lint
	yarn workspace claim-ui run lint

fix-lint-apps:
	yarn workspace issue-ui run lint --fix
	yarn workspace claim-ui run lint --fix

lint-lib:
	yarn eslint packages/*/src/**/*.{ts,tsx} --format=pretty

fix-lint-lib:
	yarn eslint packages/*/src/**/*.{ts,tsx} --format=pretty --fix

build-lib:
	yarn lerna run --ignore *-ui --ignore *-server build

clean:
	yarn rimraf packages/*/dist
	yarn rimraf apps/ui/*/dist
	yarn rimraf apps/server/*/dist

ci: build-lib lint

watch-lib: build-lib
	yarn lerna exec --parallel yarn run watch
