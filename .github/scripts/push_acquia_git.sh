#!/usr/bin/env bash

set -e

echo "Begining Pushing ${ACE_BRANCH_NAME}"

ACE_GIT_URL="${ACE_GIT_SUBSCRIPTION}@${ACE_GIT_HOST}:${ACE_GIT_SUBSCRIPTION}.git"

## Get the name of the artifact we want.
BRANCH_REF=$(git ls-remote $ACE_GIT_URL $ACE_BRANCH_NAME)
if [ -z "$BRANCH_REF" ]; then
  echo "Setting up new branch"
  # Clone the smallest branch we can make.
  git clone --branch empty-branch --single-branch ${ACE_GIT_URL} $ARTIFACT_GIT_DIR
  pushd $ARTIFACT_GIT_DIR
  ## Now make a brand new empty branch
  git switch --orphan $ACE_BRANCH_NAME
  popd
else
  echo "Cloning existing branch"
  # For existing branches we want to just pull down the branch and then
  # change only those files we need to.
  git clone --branch $ACE_BRANCH_NAME --single-branch ${ACE_GIT_URL} $ARTIFACT_GIT_DIR
fi

echo "Syncing Artifact Files"
# Now we should have an ARTIFACT_GIT_DIR ready to take our artifact.
rsync -avhq --delete --exclude='.git/*' ${NEW_BUILD_DIR}/ $ARTIFACT_GIT_DIR

# Now we need to git-add the artifacts, commit and push.
pushd $ARTIFACT_GIT_DIR
echo "Adding and Commiting Changes"
git add -A
GIT_MESSAGE="Github Action Run ${GITHUB_RUN_ID} #${GITHUB_RUN_NUMBER}: committed build result of ${GITHUB_REF}"
git commit -q -m "${GIT_MESSAGE}"
echo "Pushing Changes"
git push origin ${ACE_BRANCH_NAME}
popd

echo "Completed Pushing ${ACE_BRANCH_NAME}"
