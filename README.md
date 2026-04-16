# SabaiApply

A centralized university application platform for Thailand — one application, multiple universities.

## What is SabaiApply?

SabaiApply is Thailand's unified university admissions platform, inspired by [CommonApp](https://www.commonapp.org/) (US) and [UCAS](https://www.ucas.com/) (UK). Students fill out one application and submit it to multiple Thai universities.

### Key Features

- **One Application, Many Universities** — Apply to multiple institutions from a single profile
- **Bilingual** — Full support for Thai (ไทย) and English
- **For Everyone** — Designed for both Thai and international students

## Status

🚧 Early development

## Docker Commands

We provide a `Makefile` to easily manage the Dockerized application using `docker compose`. Use the following commands:

- `make up` - Starts the application in the background (detached mode).
- `make dev` - Starts the application and watches for file changes (useful for local development).
- `make down` - Stops and removes the running containers.
- `make list` - Lists all current Docker processes and volumes.
- `make prune` - Runs `docker system prune -a` to free up space by removing unused data.
- `make fclean` - Thoroughly cleans the environment by stopping and removing all containers, images, volumes, and networks.
- `make re` - Rebuilds and restarts the container (runs `make down` followed by `make up`).

## License

TBD
