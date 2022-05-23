#!/usr/bin/env bash

set -e

## This assumes working directory is docroot/profile/custom/cgov_site/themes/custom

## Test ncids_trans
pushd ncids_trans/front-end
npm run lint
npm run test
popd

# There are no tests for cgov_common :(
