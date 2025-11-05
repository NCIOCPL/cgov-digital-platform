#!/bin/bash
#
# BLT Environment Helper
#
# This script provides a reusable function to set up BLT executable and environment
# mapping for both ACE and MEO platforms.
#
# Usage:
#   source /path/to/blt-env-helper.sh
#   setup_blt_environment "$sitegroup" "$env"
#   # Then use $blt_executable and $blt_environment in your commands
#

##
# Sets up BLT executable path and environment name for ACE/MEO platforms
#
# Arguments:
#   $1 - sitegroup (e.g., "ncigovmeo")
#   $2 - environment (e.g., "dev", "stage", "ode", "prod")
#
# Sets global variables:
#   blt_executable - Path to the appropriate BLT executable
#   blt_environment - Mapped environment name for BLT commands
#
setup_blt_environment() {
  local sitegroup="$1"
  local env="$2"

  # Default to ACE setup
  blt_executable="/mnt/www/html/$sitegroup.$env/vendor/acquia/blt/bin/blt"
  blt_environment="$env"

  # Override for MEO environments
  if [ "$AH_ENVIRONMENT_TYPE" = "meo" ]; then
    blt_executable="/mnt/www/html/$sitegroup.$env/scripts/blt/cgov-blt"

    # Map environment names for MEO
    case "$env" in
      dev) blt_environment="meodev" ;;
      stage) blt_environment="meostage" ;;
      prod) blt_environment="meoprod" ;;
      *) blt_environment="$env" ;;
    esac
  fi
}

##
# Convenience function that runs a BLT command with proper environment setup
#
# Arguments:
#   $1 - sitegroup
#   $2 - environment
#   $3+ - BLT command and arguments
#
# Example:
#   run_blt_command "$sitegroup" "$env" "drupal:update" "--site=${sitename}" "--define" "drush.uri=$domain/"
#
run_blt_command() {
  local sitegroup="$1"
  local env="$2"
  shift 2

  setup_blt_environment "$sitegroup" "$env"

  # Replace --environment=* with correct mapped environment
  local args=()
  for arg in "$@"; do
    if [[ "$arg" == --environment=* ]]; then
      args+=("--environment=$blt_environment")
    else
      args+=("$arg")
    fi
  done

  echo "Running: $blt_executable ${args[*]}"
  "$blt_executable" "${args[@]}"
}
