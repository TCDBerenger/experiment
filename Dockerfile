FROM manycore/node
MAINTAINER Roman Atachiants "atachiar@scss.tcd.ie"

# Extract & Install
COPY . /app
RUN cd /app; npm install

# Http Port
EXPOSE 80

CMD ["node", "/app/bin/lilbro"]