#!/usr/bin/env bash

set -e

## This assumes working directory is docroot/profile/custom/cgov_site

## Test ncids_trans
pushd themes/custom/ncids_trans/front-end
npm run lint
npm run test
popd

# There are no tests for pdq_glossifier :(
