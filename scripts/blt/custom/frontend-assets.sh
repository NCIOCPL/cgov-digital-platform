#!/usr/bin/env bash

set -e

## This assumes working directory is docroot/profile/custom/cgov_site/themes/custom

## build ncids_trans packages
pushd ncids_trans/front-end
npm run build:prod
popd

## Install cgov_common packages
pushd cgov/cgov_common
npm run build
popd
