#!/usr/bin/env bash

set -e

## This assumes working directory is docroot/profile/custom/cgov_site

## Install ncids_trans packages
pushd themes/custom/ncids_trans/front-end
npm ci
popd

## Install cgov_common packages
pushd themes/custom/cgov/cgov_common
npm ci
popd

## Install pdq_glossifier packages
pushd modules/custom/pdq_glossifier
npm ci
popd
