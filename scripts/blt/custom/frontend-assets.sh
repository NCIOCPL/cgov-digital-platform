#!/usr/bin/env bash

set -e

## This assumes working directory is docroot/profile/custom/cgov_site

## build ncids_trans packages
pushd themes/custom/ncids_trans/front-end
npm run build:prod
popd

## Install cgov_common packages
pushd themes/custom/cgov/cgov_common
npm run build
popd

## Build nci_definition packages
pushd ../../../modules/custom/nci_definition
npm run build
popd
