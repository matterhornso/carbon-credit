#!/usr/bin/env bash

docker rm -f carbon-credit

docker rmi carbon-credit -f

docker image prune -f

docker volume prune -f

docker build -t carbon-credit .
