#!/usr/bin/env bash

set -e

## This assumes working directory is docroot/profile/custom/cgov_site/themes/custom

## Install ncids_trans packages
pushd ncids_trans/front-end
npm ci
popd

## Install cgov_common packages
pushd cgov/cgov_common
npm ci
popd
