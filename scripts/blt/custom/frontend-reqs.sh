#!/usr/bin/env bash

set -e

## This assumes working directory is docroot/profile/custom/cgov_site

## Install ncids_trans packages
echo "Installing ncids_trans packages"
pushd themes/custom/ncids_trans/front-end
npm ci
popd

## Install cgov_common packages
echo "Installing cgov_common packages"
pushd themes/custom/cgov/cgov_common
npm ci
popd

## Install nci_definition packages
pushd ../../../modules/custom/nci_definition
npm ci
popd
