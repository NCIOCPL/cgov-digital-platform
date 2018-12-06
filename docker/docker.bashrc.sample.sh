#!/usr/bin/env bash

# Function to start up a docker-compose environment
function ldock() {
  # display help/usage message if -?, -h or --help is first argument
  USAGE= <<Usage
Usage: ldock ProjectName WebPort MySQLPort Command...
  Examples:
    # start image 'cgov' with port 80 & 3306 exposed to host
    ldock cgov 80:80 3306:3306 up -d
    # start image 'devbox' with port container port 80 exposed as port 8080 and 3306 exposed as a random port
    ldock devbox 8080:80 3306 up -d
  Default ProjectName of [your repo's directory name] will be used if not specified.
  Default web ports of '80:80' will be used if none specified.
  Default MySQL ports of '3306' (unexposed to host) will be used if none specified.
Usage

  if [[ $# -lt 5 ]]; then
  echo $USAGE
  return 1;
  fi

  case "$1" in
  -? | -h | --help)
  echo $USAGE
  return 1;
  esac

  # Find the root of the repo. Redirect stderr as if we are not
  # under a repo an error will occur.
  REPO_ROOT=`git rev-parse --show-toplevel 2> /dev/null`

  if [ "$REPO_ROOT" == "" ]; then
  echo "You must run this command from within a git repo."
  return 2
  fi

  COMPOSE_FILE="$REPO_ROOT/docker/docker-compose.yml"
  if [ ! -f "$COMPOSE_FILE" ]; then
  echo "This project does not appear to have a docker compose file."
echo "Missing: docker/docker-compose.yml"
  return 3
  fi

  COMPOSE_CMD=`which docker-compose`
  if [ "$COMPOSE_CMD" == "" ]; then
  echo "Cannot find docker-compose command. Make sure it is on your path."
  return 4
  fi

  # Get the name of the project (repo folder)
  PROJECT_NAME=$(basename "$REPO_ROOT")

  COMPOSE_PROJECT_NAME=$1
  WEB_PORT=$2
  MYSQL_PORT=$3

  if [[ "$COMPOSE_PROJECT_NAME" == "" ]]; then
  echo "Set default project name"
  COMPOSE_PROJECT_NAME=$PROJECT_NAME
  fi

  if [[ "$WEB_PORT" == "" ]]; then
  echo "Set default web port"
  WEB_PORT="80:80"
  fi


  if [[ "$MYSQL_PORT" == "" ]]; then
  echo "Set default db port"
  MYSQL_PORT="3306"
  fi

  # shift off config arguments, leaving docker-compose command options
  shift 3

  ## Run compose pointing at our config and
  COMPOSE_PROJECT_NAME="$COMPOSE_PROJECT_NAME" WEB_PORT="$WEB_PORT" MYSQL_PORT="$MYSQL_PORT" $COMPOSE_CMD --file $COMPOSE_FILE "$@"
}

# Default values (so docker-compose up -d) will work by itself without options
export WEB_PORT=80:80
export MYSQL_PORT=3306:3306
export COMPOSE_PROJECT_NAME=cgov

# Shortcut aliases
# Bring up containers (be in the appropriate repo when running commands)
# Using ports 80 (default), 8002, 8003  (8082, 8083 are reserved for Utilistor Client (3082) & Server (8083))
alias up1="ldock cgov 80:80 3306:3306 up -d"
alias up2="ldock devbox 8002:80 3307:3306 up -d"
alias up3="ldock reference 8003:80 3308:3306 up -d"

alias down1="ldock cgov 80:80 3306:3306 down"
alias down2="ldock devbox 8002:80 3307:3306 down"
alias down3="ldock reference 8003:80 3308:3306 down"

alias ssh1="ldock cgov 80:80 3306 exec web /bin/bash"
alias ssh2="ldock devbox 8002:80 3306 exec web /bin/bash"
alias ssh3="ldock reference 8003:80 3306 exec web /bin/bash"

