# BLT Environment Helper

This helper script provides reusable functions for setting up BLT executable paths and environment mapping across ACE and MEO platforms.

## Usage

### Basic Setup

```bash
# Source the helper
source "/mnt/www/html/$sitegroup.$env/scripts/blt/blt-env-helper.sh"

# Set up BLT environment
setup_blt_environment "$sitegroup" "$env"

# Use the configured variables
$blt_executable drupal:update --environment=$blt_environment --site=$sitename
```

### Convenience Function

```bash
# Source the helper
source "/mnt/www/html/$sitegroup.$env/scripts/blt/blt-env-helper.sh"

# Run BLT command with automatic environment mapping
run_blt_command "$sitegroup" "$env" "drupal:update" "--environment=$env" "--site=$sitename"
```

## Environment Mapping

The helper automatically handles platform differences:

| Platform | Input Env | BLT Executable | Mapped Env |
|----------|-----------|----------------|------------|
| ACE      | dev       | vendor/acquia/blt/bin/blt | dev |
| ACE      | stage     | vendor/acquia/blt/bin/blt | stage |
| ACE      | prod      | vendor/acquia/blt/bin/blt | prod |
| MEO      | dev       | scripts/blt/cgov-blt | meodev |
| MEO      | stage     | scripts/blt/cgov-blt | meostage |
| MEO      | prod      | scripts/blt/cgov-blt | meoprod |

## Detection

MEO environments are detected using the `AH_ENVIRONMENT_TYPE=meo` environment variable.

## Variables Set

After calling `setup_blt_environment`:

- `$blt_executable` - Path to the appropriate BLT executable
- `$blt_environment` - Mapped environment name for BLT commands

## Scripts Using This Helper

- `scripts/post-site-install.sh`
- `scripts/site-post-code-deploy.sh`
- `scripts/z-cgov-post-update.sh`