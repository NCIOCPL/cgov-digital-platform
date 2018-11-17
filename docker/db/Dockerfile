FROM ubuntu:xenial

################################################################################
#                                                                              #
#   THIS CONTAINER IS FOR EDUCATIONAL USE ONLY!                                #
#                                                                              #
#   Never use this container for running production workloads!                 #
#                                                                              #
################################################################################

# Update the package manager, then install MariaDB server.
RUN apt-get update && apt-get install -y software-properties-common
RUN apt-key adv --recv-keys --keyserver hkp://keyserver.ubuntu.com:80 0xF1656F24C74CD1D8
RUN add-apt-repository 'deb [arch=amd64,arm64,i386,ppc64el] http://mirror.lstn.net/mariadb/repo/10.0/ubuntu xenial main'

RUN apt-get install -y mariadb-server

# Reconfigure the bind address of MySQL to allow any incoming network connection.
RUN sed -i -e "s/^bind-address\s*=\s*127.0.0.1/bind-address = 0.0.0.0/" /etc/mysql/mariadb.conf.d/50-server.cnf

# Set Timezone
# NOTE: The xenial (16.04) base image doesn't include timezone data, so that needs to be installed.
#       The bionic (18.04) image resolves this problem.
RUN DEBIAN_FRONTEND=noninteractive && \
  apt install -y tzdata && \
  ln -fs /usr/share/zoneinfo/America/New_York /etc/localtime && \
  dpkg-reconfigure --frontend noninteractive tzdata


# Copy our custom entrypoint and make it executable.
COPY ./build/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Mark the MySQL directory as a volume.
VOLUME /var/lib/mysql

# Expose the default MySQL port.
EXPOSE 3306

# Replace the standard entrypoint /bin/sh with our script.
ENTRYPOINT ["docker-entrypoint.sh"]

# If no command is passed to the container, start the MySQL server by default.
CMD ["/usr/bin/mysqld_safe"]
