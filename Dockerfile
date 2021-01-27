FROM node
MAINTAINER Adrian Sampson <adrian@radbox.org>

ADD . /roster
WORKDIR /roster

RUN yarn
RUN yarn build

CMD ["node", "build/roster.js"]
