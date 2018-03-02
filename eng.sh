#!/bin/sh

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Exit early if any step fails
set -e

# Make sure we're NOT running the remote machine context!
unset DOCKER_TLS_VERIFY
unset DOCKER_HOST
unset DOCKER_CERT_PATH
unset DOCKER_MACHINE_NAME

# Nice bold text
bold=$(tput bold)
normal=$(tput sgr0)

name=$1
machine=starship
image=toomanycaptains/$name

echo "🚧 Building ${bold}$image${normal}\n"
cd "$dir/${name}" && npm run-script build &&
docker-compose build $name

echo "\n🚂 Uploading ${bold}$image${normal} to ${bold}$machine${normal}\n"
docker save $image | pv -Ibt | docker-machine ssh $machine 'docker load'

eval $(docker-machine env --shell=sh starship)

echo "\n🚀 Launching ${bold}$image${normal}\n"
docker-compose up -d $name

echo "\n🛸🌈 We did it fam"



