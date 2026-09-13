# Node 20: the services' dependencies (eosjs, jsonwebtoken) break on newer
# runtimes, and the previous node:14 base is years past end of life.
FROM node:20-alpine

RUN apk add --no-cache dumb-init python3 make g++

WORKDIR /app
COPY . .

# Compile at image build time. The previous setup ran the TypeScript build on
# every container start, which made each restart minutes long.
RUN npm install --unsafe-perm=true && npm run build

# uploads/ holds evidence until object storage replaces local disk; logs/ is
# created by the rotating file logger at startup. Without both owned by the
# runtime user the process dies on boot with EACCES.
RUN mkdir -p /app/uploads /app/logs && chown -R node:node /app/uploads /app/logs

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER node
CMD ["dumb-init", "/app/docker-entrypoint.sh"]
