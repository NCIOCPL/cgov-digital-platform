#!/usr/bin/env bash
set -o pipefail

## If this is ACSF then exit.
if [[ $AH_SITE_GROUP == "ncigov" ]]; then
  exit;
fi;

site="$1"
target_env="$2"
source_branch="$3"
deployed_tag="$4"
repo_url="$5"
repo_type="$6"

# Acquire our secrets
FILE=$HOME/$target_env/teams_webhook

if [[ -f "$FILE" ]]; then
    . "$FILE"
else
    echo "File $FILE does not exist."
    # Not worth breaking the deployment over, so still exit 0.
    exit 0
fi

# Exit if our hook is explicitly disabled in the teams_webhook file.
if [[ "$DISABLE_HOOK" == "true" ]]; then
    echo "Teams hook is disabled."
    exit 0
fi

# Quick variable presence checks
missing=()
[[ -z "${TEAMS_WEBHOOK_URL:-}" ]] && missing+=("TEAMS_WEBHOOK_URL")
[[ -z "${TEAMS_TEAM_ID:-}"    ]] && missing+=("TEAMS_TEAM_ID")
[[ -z "${TEAMS_CHANNEL_ID:-}" ]] && missing+=("TEAMS_CHANNEL_ID")
[[ -z "${TEAMS_MESSAGE_ID:-}" ]] && missing+=("TEAMS_MESSAGE_ID")
if (( ${#missing[@]} )); then
  echo "Teams webhook: missing required var(s): ${missing[*]}."
  exit 0
fi

# Post our webhook request.
# This expects the following variables to be loaded in from the teams_webhook file:
# - $TEAMS_WEBHOOK_URL
# - $TEAMS_TEAM_ID
# - $TEAMS_CHANNEL_ID
# - $TEAMS_MESSAGE_ID

if [ "$source_branch" != "$deployed_tag" ]; then
  message="An updated deployment has been made to ${site}.${target_env} using branch ${source_branch} as ${deployed_tag}."
else
  message="An updated deployment has been made to ${site}.${target_env} using tag ${deployed_tag}."
fi

payload=$(printf '{ "team_id": "%s", "channel_id": "%s", "message_id": "%s", "message": "%s" }' \
  "$TEAMS_TEAM_ID" "$TEAMS_CHANNEL_ID" "$TEAMS_MESSAGE_ID" "$message")

output=$(curl --request POST \
  --url "$TEAMS_WEBHOOK_URL" \
  --header 'Content-Type: application/json' \
  --data "$payload" \
  --max-time 30 \
  --fail \
  --silent 2>&1)

status=$?

if [[ $status -eq 0 ]]; then
  echo "Teams webhook successful:"
  echo "$output"
else
  echo "Teams: webhook post failed with exit code $status."
fi

exit 0
