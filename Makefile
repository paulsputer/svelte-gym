.PHONY: config-initial
config-initial: ## First time configuration of system
	brew install pnpm
	nvm install --lts 

.PHONY: config
config: ## Configure after package updates etc 
	pnpm install

.PHONY: build
build: ## Build the package 
	pnpm run build

.PHONY: preview
preview: ## Show the demo page
	pnpm run preview

.PHONY: package
package: ## Create the package 
	pnpm run package

.PHONY: run
run: ## Run the live mode
	pnpm run dev -- --open




.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
