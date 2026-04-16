# Shell
SHELL := /usr/bin/env bash

# Rules
all: up

up:
	@echo "Starting docker-compose daemon..."
	@docker compose up -d --build --remove-orphans

dev:
	@echo "Starting docker-compose..."
	@docker compose up --build --watch --remove-orphans

down:
	@echo "Stopping docker-compose..."
	@docker compose down

prune:
	@echo "Pruning..."
	@docker system prune -a

list:
	@echo "Current docker processes:"
	@docker ps -a
	@echo
	@echo "Current docker volumes:"
	@docker volume ls

fclean: down
	@echo "Cleaning..."
	@docker stop $$(docker ps -qa) 2>/dev/null || true
	@docker rm $$(docker ps -qa) 2>/dev/null || true
	@docker rmi -f $$(docker images -qa) 2>/dev/null || true
	@docker volume rm $$(docker volume ls -q) 2>/dev/null || true
	@docker network rm $$(docker network ls -q) 2>/dev/null || true

re: down up

.PHONY: up dev down prune list fclean re
