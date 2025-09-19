#!/usr/bin/env bash

set -e

## This assumes working directory is docroot/profile/custom/cgov_site

## Install ncids_trans packages
echo "Installing ncids_trans packages"
pushd themes/custom/ncids_trans/front-end
npm ci
popd

## Install nci_definition packages
pushd ../../../modules/custom/nci_definition
npm ci
popd

## Install nci_ckeditor5_enhancements packages
pushd ../../../modules/custom/nci_ckeditor5_enhancements
npm ci
popd
