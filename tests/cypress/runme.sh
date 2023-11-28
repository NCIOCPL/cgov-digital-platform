#!/usr/bin/env bash

set -e

drush rs 0.0.0.0:8888 &
npm test
blt tests:server:kill --define tests.run-server=true -D behat.web-driver=chrome --no-interaction
