
# create databases

# Database used for running tests.
CREATE DATABASE IF NOT EXISTS simpletest;
GRANT ALL ON simpletest.* TO 'drupal'@'%';

# create root user and grant rights
#CREATE USER 'root'@'localhost' IDENTIFIED BY 'local';
#GRANT ALL ON *.* TO 'root'@'%';
