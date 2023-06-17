FROM ubuntu:focal

################################################################################
#                                                                              #
#   THIS CONTAINER IS FOR EDUCATIONAL USE ONLY!                                #
#                                                                              #
#   Never use this container for running production workloads!                 #
#                                                                              #
################################################################################

# Update the package manager...
RUN DEBIAN_FRONTEND=noninteractive \
  apt-get update

# Install curl so we can get the SSL certificate
RUN DEBIAN_FRONTEND=noninteractive \
  apt-get install -yq \
  curl

# Get the NIH Root certificates and install them so we work on VPN
# Download from https://ocio.nih.gov/Smartcard/Pages/PKI_chain.aspx
RUN mkdir /usr/local/share/ca-certificates/nih \
  && curl -o /usr/local/share/ca-certificates/nih/NIH-DPKI-ROOT-1A-base64.crt https://ocio.nih.gov/Smartcard/Documents/Certificates/NIH-DPKI-ROOT-1A-base64.cer \
  && curl -o /usr/local/share/ca-certificates/nih/NIH-DPKI-CA-1A-base64.crt https://ocio.nih.gov/Smartcard/Documents/Certificates/NIH-DPKI-CA-1A-base64.cer \
  && update-ca-certificates

# Install add-apt-repository
RUN DEBIAN_FRONTEND=noninteractive \
  apt-get install -yq software-properties-common

# Add the PHP repository
RUN DEBIAN_FRONTEND=noninteractive \
  add-apt-repository ppa:ondrej/php; \
  DEBIAN_FRONTEND=noninteractive \
  add-apt-repository ppa:ondrej/apache2; \
  DEBIAN_FRONTEND=noninteractive \
  add-apt-repository ppa:phd/chromium-browser; \
  apt update

## This forces Ubuntu to use the PPA version of chromium-browser and not
## ubuntu's version. (Ubuntu requires SNAP and it does not work with Docker)
## The ppa:phd/chromium-browser was added above.
COPY ./build/etc/apt/preferences.d/phd-chromium-browser /etc/apt/preferences.d/phd-chromium-browser

# ...then install packages.
RUN DEBIAN_FRONTEND=noninteractive \
  apt-get install -yq \
  apache2 \
  build-essential \
  php8.0 \
  libapache2-mod-php8.0 \
  php8.0-bz2 \
  php8.0-cli \
  php8.0-common \
  php8.0-curl \
  php8.0-fpm \
  php8.0-gd \
  php8.0-mbstring \
  php8.0-memcached \
  php8.0-mysql \
  php8.0-oauth \
  php8.0-opcache \
  php8.0-readline \
  php8.0-sqlite3 \
  php8.0-soap \
  php8.0-xdebug \
  php8.0-xml \
  mysql-client-8.0 \
  git \
  imagemagick \
  vim \
  zip \
  autoconf libtool m4 pkg-config nasm \
  libpng-dev \
  chromium-browser \
  chromium-chromedriver

# Copy up the available sites config. The startup script
# manipulates this file based on env vars.
COPY ./build/000-default.conf /etc/apache2/sites-available/000-default.conf

## These are the PHP modules that are available to be
## loaded by the CLI & apache. This should be inline with
## the modules installed above.
COPY ./build/php-conf /etc/php/8.0/mods-available

# Enable mod_rewrite 'cause we needs it.
RUN a2enmod rewrite

# Forward logs to docker log collector.
RUN ln -sf /dev/stdout /var/log/apache2/access.log && \
  ln -sf /dev/stderr /var/log/apache2/error.log && \
  ln -sf /dev/stdout /var/log/apache2/000_default-access_log && \
  ln -sf /dev/stderr /var/log/apache2/000_default-error_log

# Copy our custom entrypoint and make it executable.
COPY ./build/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Install Node
# nvm environment variables
ENV NVM_DIR /usr/local
ENV NODE_VERSION 16.13.0

# install nvm
# https://github.com/creationix/nvm#install-script
RUN curl --silent -o- https://raw.githubusercontent.com/creationix/nvm/v0.39.0/install.sh | bash

# install node and npm
RUN . $NVM_DIR/nvm.sh \
  && nvm install $NODE_VERSION \
  && nvm alias default $NODE_VERSION \
  && nvm use default

# add node and npm to path so the commands are available
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# update npm
RUN npm install -g npm@8.1.0

# Install composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer --2

## Install Drush Launcher (runs local drush instances)
RUN curl -sL -o /usr/local/bin/drush https://github.com/drush-ops/drush-launcher/releases/download/0.10.1/drush.phar \
  && chmod +x /usr/local/bin/drush

## Install Drupal console
RUN curl https://drupalconsole.com/installer -L -o /usr/local/bin/drupal \
  && chmod +x /usr/local/bin/drupal

RUN php --version; composer --version; drupal --version; drush --drush-launcher-version

## Enable BLT function
RUN curl -sL -o /usr/local/bin/blt https://github.com/acquia/blt-launcher/releases/download/v1.1.0/blt.phar \
  && chmod +x /usr/local/bin/blt

## Turn off xdebug as it uses resources that could be best used
## elsewhere. Once the container is up you can use
## phpenmod -s <SAPI> xdebug
## where SAPI is probably, most likely, apache2
RUN phpdismod -s cli xdebug
RUN phpdismod -s apache2 xdebug

# Expose the default Apache port.
EXPOSE 80

# Replace the standard entrypoint /bin/sh with our script.
ENTRYPOINT ["docker-entrypoint.sh"]

# If no command is passed to the container, start Apache by default.
CMD ["apachectl", "-D", "FOREGROUND"]

# Default to /var/www so we don't need to do it by hand.
WORKDIR /var/www
