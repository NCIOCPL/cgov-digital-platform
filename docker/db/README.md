## What is this?
This is the database container.

## File Structure
* `Dockerfile` - duh
* **build** - files used during build
  * `docker-entrypoint.sh` - The entrypoint to the container, which is a shell script that starts up mysql.
* **overrides** - folder for files used during runtime. These are mounted as volumes into the container from the docker-compose file.
  * ***backups*** - A place to store backup files. Files in folder are not tracked in source control