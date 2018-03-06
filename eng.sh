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

if [ "$1" = "logs" ]
then
  name=$2
  eval $(docker-machine env --shell=sh starship)
  echo "📚 Logs for ${bold}$name${normal}\n"

  if [ "$name" = "controller" ]
  then
    ssh crew@starship ssh pi@starship-controller 'docker logs --tail=20 -f controller'
  else
    docker-compose logs --tail=20 -f $2
  fi

else
  name=$1
  image=toomanycaptains/$name

  if [ "$name" = "controller" ]
    then
    echo "🚧 Building ${bold}$image${normal}\n"
    cd "$dir/${name}" &&
    npm run build &&
    docker build -t toomanycaptains/controller .

    echo "\n🚂 Uploading ${bold}$image${normal} to ${bold}starship-controller${normal} via ${bold}starship${normal}\n"
    docker save toomanycaptains/controller | pv -Ibt | ssh crew@starship ssh pi@starship-controller 'docker load'

    eval $(docker-machine env --shell=sh starship)

    echo "\n🚀 Launching ${bold}$image${normal}\n"
    ssh crew@starship "ssh pi@starship-controller 'docker stop controller ||:&& docker rm controller ||:&& docker run -d --restart unless-stopped --net=host --privileged --name controller toomanycaptains/controller'"

    echo "\n🛸🌈 We did it fam"

    exit
    fi

  echo "🚧 Building ${bold}$image${normal}\n"
  cd "$dir/${name}" && npm run-script build &&
  docker-compose build $name

  echo "\n🚂 Uploading ${bold}$image${normal} to ${bold}$machine${normal}\n"
  docker save $image | pv -Ibt | docker-machine ssh $machine 'docker load'

  eval $(docker-machine env --shell=sh starship)

  echo "\n🚀 Launching ${bold}$image${normal}\n"
  docker-compose up -d $name
fi

echo "\n🛸🌈 We did it fam"
