#!/usr/bin/env bash

set -e

pushd tests/cypress
npm ci
popd
