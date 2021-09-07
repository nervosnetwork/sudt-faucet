lint: lint-lib lint-apps
fix-lint: fix-lint-lib fix-lint-apps

lint-fix:
	yarn eslint packages/*/src/**/*.{ts,tsx} --fix
	lerna run lint -- --fix

lint-apps:
	lerna run lint

fix-lint-apps:
	lerna run lint -- --fix

lint-lib:
	yarn eslint packages/*/src/**/*.{ts,tsx} --format=pretty

fix-lint-lib:
	yarn eslint packages/*/src/**/*.{ts,tsx} --format=pretty --fix

build-lib:
	yarn lerna run --ignore @sudt-faucet/app-* build

clean:
	yarn rimraf packages/*/dist
	yarn rimraf apps/ui/*/dist
	yarn rimraf apps/server/*/dist

github-ci: build-lib lint

watch-lib: build-lib
	yarn lerna exec --parallel yarn run watch
