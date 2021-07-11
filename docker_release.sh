#!/usr/bin/env bash

set -e

if [[ "$1" == "" ]]; then
    echo "Supply version as first parameter!"
    exit 1
fi

if [[ "$2" == "all" ]]; then
    build_envs="staging live"
else
    build_envs="$2"
fi

for buildenv in ${build_envs}; do
  if [[ "$3" == "all" || "$3" == "backend" ]]; then
    if [[ -z "${MAXMIND_LICENSE_KEY}" ]]; then
      echo Not building backend image as MAXMIND_LICENSE_KEY is not defined!
    else
      docker build -f docker/app/Dockerfile -t jaywink/the-federation.info:${1}-${buildenv} --build-arg "MAXMIND_LICENSE_KEY=${MAXMIND_LICENSE_KEY}" .
      docker push jaywink/the-federation.info:${1}-${buildenv}
    fi
  fi

  if [[ "$3" == "all" || "$3" == "frontend" ]]; then
    if [[ ${buildenv} == "live" ]]; then
      graphql_endpoint=https://the-federation.info/graphql
    fi
    if [[ ${buildenv} == "staging" ]]; then
      graphql_endpoint=https://staging.the-federation.info/graphql
    fi
    docker build -f docker/nginx/Dockerfile -t jaywink/the-federation.info-web:${1}-${buildenv} --build-arg THEFEDERATION_GRAPHQL_API="${graphql_endpoint}" .
    docker push jaywink/the-federation.info-web:${1}-${buildenv}
  fi
done
