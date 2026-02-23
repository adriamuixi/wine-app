FROM php:8.4-fpm-alpine
# System deps
RUN apk add --no-cache \
    bash \
    git \
    icu-dev \
    libzip-dev \
    postgresql-dev \
    oniguruma-dev \
    unzip \
    $PHPIZE_DEPS

# PHP extensions
RUN docker-php-ext-install \
    intl \
    opcache \
    pdo \
    pdo_pgsql \
    zip

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# PHP config
COPY php.ini /usr/local/etc/php/conf.d/app.ini

WORKDIR /var/www/html

# Symfony CLI (opcional, útil en dev)
RUN wget -qO- https://get.symfony.com/cli/installer | bash && \
    mv /root/.symfony*/bin/symfony /usr/local/bin/symfony