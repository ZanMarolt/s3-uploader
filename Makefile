-include .env
.DEFAULT_GOAL := help
.PHONY: help
help: ## Show help
	@echo "\nUsage:\n  make \033[36m<target>\033[0m\n\nTargets:"
	@grep -E '^[a-zA-Z_/%\-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

upload/file: ## automatically uploades a file to s3 bucket and copies over the returned URL
	@node upload.mjs $(FILE)

upload/file/temp: ## automatically uploades a file to s3 bucket and copies over the returned signed URL (valid for only 7 days)
	@node upload.mjs $(FILE) --sign