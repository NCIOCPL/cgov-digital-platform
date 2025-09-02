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
FILE=$HOME/$target_env/github_settings
PRIVATE_KEY_PATH=$HOME/acquia-ace-servers.github.private-key.pem

if [ -f $FILE ]; then
    . $FILE
else
    echo "File $FILE does not exist."
    exit 1
fi

# Exit if our hook is explicitly disabled
if [[ "$DISABLE_HOOK" == "true" ]]; then
    echo "GitHub / Teams hook is disabled"
    exit 0
fi

# Generate a JWT for the GitHub App
now=$(date +%s)
iat=$((${now} - 60)) # Issues 60 seconds in the past
exp=$((${now} + 600)) # Expires 10 minutes in the future

b64enc() { openssl base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n'; }

header_json='{
    "typ":"JWT",
    "alg":"RS256"
}'
header=$( echo -n "${header_json}" | b64enc )

payload_json="{
    \"iat\":${iat},
    \"exp\":${exp},
    \"iss\":\"${APP_ID}\"
}"
payload=$( echo -n "${payload_json}" | b64enc )

header_payload="${header}"."${payload}"
signature=$(
    openssl dgst -sha256 -sign $PRIVATE_KEY_PATH \
    <(echo -n "${header_payload}") | b64enc
)

JWT="${header_payload}"."${signature}"
printf '%s\n' "JWT: $JWT"

# Get Installation Access Token

response=$(curl --request POST \
--url "https://api.github.com/app/installations/$INSTALLATION_ID/access_tokens" \
--header "Accept: application/vnd.github+json" \
--header "Authorization: Bearer $JWT" \
--header "X-GitHub-Api-Version: 2022-11-28")
token=$(echo $response | grep -o '"token": *"[^"]*' | cut -d'"' -f4)

# Post our re-run request

endpoint="https://api.github.com/repos/NCIOCPL/teams-notifications/actions/runs/$RUN_ID/rerun"
curl --request POST \
--url $endpoint \
--header "Accept: application/vnd.github+json" \
--header "Authorization: token $token" \
--header "X-GitHub-Api-Version: 2022-11-28"
