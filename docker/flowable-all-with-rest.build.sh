#!/usr/bin/env bash

cd assets
unzip flowable-6.4.1.zip "*/flowable-rest.war" assets
cd ..

docker build -t flowable-all-with-rest -f flowable-all-with-rest.docker .
