#!/usr/bin/env bash

set -e

## This assumes working directory is docroot/profile/custom/cgov_site

## build ncids_trans packages
pushd themes/custom/ncids_trans/front-end
npm run build:prod
popd

## Build nci_definition packages
pushd ../../../modules/custom/nci_definition
npm run build
popd

## Build nci_ckeditor5_enhancements packages
pushd ../../../modules/custom/nci_ckeditor5_enhancements
npm run build
popd
