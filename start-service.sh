# !/usr/bin/env bash

# docker service create --replicas 2 --name carbon-credit -l=apiRoute='/carbon-credit' -p 3004:3000 104.154.26.100:5000/carbon-credit
# docker run --name carbon-credit -p 3000:3000 carbon-credit