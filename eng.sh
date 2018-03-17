#!/bin/sh

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

set -e # Exit early if any step fails
# set -x

# Make sure we're NOT running the remote machine context!
unset DOCKER_TLS_VERIFY
unset DOCKER_HOST
unset DOCKER_CERT_PATH
unset DOCKER_MACHINE_NAME

# Nice bold text
bold=$(tput bold)
normal=$(tput sgr0)

if ! [ -x "$(command -v docker-machine)" ]; then
  echo "⚠️️  Looks like you don't have Docker Machine installed.\n"
  echo "On macOS, you can download here: https://docs.docker.com/docker-for-mac/install/"
  exit
fi

# Ping starship
if ! ping -t 1 -c 1 starship >/dev/null 2>/dev/null; then
  echo "⚠️  Could not connect to ${bold}starship${normal}... are you plugged in?"
  exit
fi

# Ping starship-controller from starship
if ! ssh crew@starship 'ping -W 1 -c 1 starship-controller' >/dev/null 2>/dev/null; then
  echo "⚠️  Could not connect to ${bold}starship-controller${normal} from ${bold}starship${normal}... are you plugged in?"
  exit
fi

 # Make sure docker-machine is set up
if ! docker-machine status starship >/dev/null 2>/dev/null; then
  echo "⚠️  Docker machine for starship not found! Creating one...\n\n"
  docker-machine create --driver generic --generic-ip-address=10.0.1.42 --generic-ssh-key ~/.ssh/id_rsa --generic-ssh-user=crew starship
  exit
fi

if [ "$1" = "" ]; then
echo "🛸🌈 ${bold}eng${normal} manages TooManyCaptains tofuware (like firmware, but softer).\n"

echo "Usage: ${bold}eng COMPONENT${normal} => build and re-upload code for ${bold}COMPONENT${normal}"
echo "Example: ${bold}eng server${normal} => build and re-upload code for ${bold}server${normal}\n"

echo "Usage: ${bold}eng logs COMPONENT${normal} => stream logs for ${bold}COMPONENT${normal}"
echo "Example: ${bold}eng logs controller${normal} => build and re-upload code for ${bold}controller${normal}"
exit
elif [ "$1" = "logs" ]; then
  name=$2
  eval $(docker-machine env --shell=sh starship)
  echo "📚 Logs for ${bold}$name${normal}\n"

  if [ "$name" = "controller" ]; then
    ssh crew@starship ssh pi@starship-controller 'docker logs --tail=20 -f controller'
  else
    docker-compose logs --tail=20 -f $2
  fi

else
  name=$1
  image=toomanycaptains/$name

  # Build for controller (starship-controller), via docker directly

  if [ "$name" = "controller" ]; then
    echo "🚧 Building ${bold}$image${normal}\n"
    cd "$dir/${name}" &&
    npm run build &&
    docker build -t toomanycaptains/controller .

    echo "\n🚂 Uploading ${bold}$image${normal} to ${bold}starship-controller${normal} via ${bold}starship${normal}\n"
    docker save toomanycaptains/controller | pv -Ibt | ssh crew@starship ssh pi@starship-controller 'docker load'

    eval $(docker-machine env --shell=sh starship)

    echo "\n🚀 Launching ${bold}$image${normal}\n"
    ssh crew@starship "ssh pi@starship-controller 'docker stop controller ||:&& docker rm controller ||:&& docker run -dit --restart unless-stopped --net=host --privileged --name controller toomanycaptains/controller'"

    echo "\n🛸🌈 We did it fam"

    exit
  fi

  # Build for starship services, via docker-compose

  echo "🚧 Building ${bold}$image${normal}\n"
  cd "$dir/${name}" && npm run-script build &&
  docker-compose build $name

  echo "\n🚂 Uploading ${bold}$image${normal} to ${bold}starship${normal}\n"
  docker save $image | pv -Ibt | docker-machine ssh starship 'docker load'

  eval $(docker-machine env --shell=sh starship)

  echo "\n🚀 Launching ${bold}$image${normal}\n"
  if [ "$name" = "game" ]; then
    name="game kiosk"
  fi
  docker-compose up -d $name
fi

echo "\n🛸🌈 We did it fam"
