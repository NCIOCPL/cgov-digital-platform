#!/usr/bin/env bash

set -e

ACE_GIT_URL="${ACE_GIT_SUBSCRIPTION}@${ACE_GIT_HOST}:${ACE_GIT_SUBSCRIPTION}.git"

git ls-remote $ACE_GIT_URL empty-branch
