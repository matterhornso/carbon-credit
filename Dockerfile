FROM node:14-alpine

RUN addgroup -S nupp && adduser -S -g nupp nupp

ENV HOME=/home/nupp

COPY package.json npm-shrinkwrap.json tsconfig.json copyStaticAssets.ts tsoa.json $HOME/app/

COPY src/ $HOME/app/src

COPY env/ $HOME/app/env

ADD https://github.com/Yelp/dumb-init/releases/download/v1.1.1/dumb-init_1.1.1_amd64 /usr/local/bin/dumb-init

WORKDIR $HOME/app

RUN chown -R nupp:nupp $HOME/* /usr/local/ && \
  chmod +x /usr/local/bin/dumb-init && \
  npm install --unsafe-perm=true && \
  chown -R nupp:nupp $HOME/* && \
  chown -R nupp:nupp /home/nupp/.config

USER nupp

EXPOSE 4001

CMD ["dumb-init", "npm", "start"]
