FROM node

RUN mkdir /usr/local/docker_ebooks
ADD . /usr/local/docker_ebooks

WORKDIR /usr/local/docker_ebooks
RUN npm install

CMD ["bash", "etc/run.sh"]
