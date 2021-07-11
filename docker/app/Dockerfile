FROM python:3.7

ENV PYTHONUNBUFFERED 1
ARG MAXMIND_LICENSE_KEY

COPY requirements/requirements.txt /requirements.txt

RUN apt-get update -qq && apt-get install python-dev python3-dev -qqy \
    && pip install --no-cache-dir -U pip setuptools pip-tools \
    && pip-sync requirements.txt

RUN curl "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-Country&license_key=${MAXMIND_LICENSE_KEY}&suffix=tar.gz" -o /tmp/geoip.tar.gz

RUN groupadd -r django \
    && useradd -r -g django django

COPY --chown=django:django . /app
COPY --chown=django:django docker/app/gunicorn.sh /gunicorn.sh

RUN tar xva -C /app/utils/maxmind --overwrite --strip-components 1 -f /tmp/geoip.tar.gz

ENV POSTGRES_PASSWORD postgres
ENV RQWORKER_NUM 5
ENV DJANGO_SETTINGS_MODULE config.production
ENV REDIS_HOST redis
ENV DATABASE_URL postgres://postgres:$POSTGRES_PASSWORD@db:5432/postgres
ENV DJANGO_SECURE_SSL_REDIRECT True
ENV DJANGO_DEBUG False
ENV DJANGO_ALLOWED_HOSTS the-federation.info,thefederation.local
ENV DBHOST=db

WORKDIR /app
CMD bash -c "./utils/wait-for-it/wait-for-it.sh --strict --timeout=10 $DBHOST:5432 && circusd /app/config/circus.ini"
