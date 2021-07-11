import environ
import os

ROOT_DIR = environ.Path(__file__) - 2  # (/a/b/myfile.py - 2 = /a)

# Local environment
# -----------------
env = environ.Env()

if os.path.isfile(".env"):
    env.read_env(".env")

# APP CONFIGURATION
# ------------------------------------------------------------------------------
DJANGO_APPS = (
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.admin",
)
THIRD_PARTY_APPS = (
    "corsheaders",
    "django_extensions",
    "django_rq",
    "graphene_django",
    "silk",
)
LOCAL_APPS = (
    "thefederation",
)

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# MIDDLEWARE CONFIGURATION
# ------------------------------------------------------------------------------
MIDDLEWARE = (
    "silk.middleware.SilkyMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
)

# DEBUG
# ------------------------------------------------------------------------------
# See: https://docs.djangoproject.com/en/dev/ref/settings/#debug
DEBUG = env.bool("DJANGO_DEBUG", False)
DEBUG_TOOLBAR_ENABLED = False

# MANAGER CONFIGURATION
# ------------------------------------------------------------------------------
# See: https://docs.djangoproject.com/en/dev/ref/settings/#admins
ADMINS = (
    (env("DJANGO_ADMIN_NAME", default="The Federation Admin"),
     env("DJANGO_ADMIN_MAIL", default="info@thefederation.local")),
)

# See: https://docs.djangoproject.com/en/dev/ref/settings/#managers
MANAGERS = ADMINS

# DATABASE CONFIGURATION
# ------------------------------------------------------------------------------
# See: https://docs.djangoproject.com/en/dev/ref/settings/#databases
DATABASES = {
    "default": env.db("DATABASE_URL", default="postgres://thefederation:thefederation@127.0.0.1:5432/thefederation"),
}
DATABASES["default"]["ATOMIC_REQUESTS"] = True


# GENERAL CONFIGURATION
# ------------------------------------------------------------------------------
# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = "UTC"

# See: https://docs.djangoproject.com/en/dev/ref/settings/#language-code
LANGUAGE_CODE = "en-us"

# See: https://docs.djangoproject.com/en/dev/ref/settings/#use-i18n
USE_I18N = False

# See: https://docs.djangoproject.com/en/dev/ref/settings/#use-l10n
USE_L10N = True

# See: https://docs.djangoproject.com/en/dev/ref/settings/#use-tz
USE_TZ = True

# TEMPLATE CONFIGURATION
# ------------------------------------------------------------------------------
# See: https://docs.djangoproject.com/en/dev/ref/settings/#templates
TEMPLATES = [
    {
        # See: https://docs.djangoproject.com/en/dev/ref/settings/#std:setting-TEMPLATES-BACKEND
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        # See: https://docs.djangoproject.com/en/dev/ref/settings/#template-dirs
        "DIRS": [
            # str(APPS_DIR.path("templates")),
        ],
        "OPTIONS": {
            # See: https://docs.djangoproject.com/en/dev/ref/settings/#template-debug
            "debug": DEBUG,
            # See: https://docs.djangoproject.com/en/dev/ref/settings/#template-loaders
            # https://docs.djangoproject.com/en/dev/ref/templates/api/#loader-types
            "loaders": [
                "django.template.loaders.filesystem.Loader",
                "django.template.loaders.app_directories.Loader",
            ],
            # See: https://docs.djangoproject.com/en/dev/ref/settings/#template-context-processors
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.template.context_processors.media",
                "django.template.context_processors.static",
                "django.template.context_processors.tz",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# STATIC FILE CONFIGURATION
# ------------------------------------------------------------------------------
# See: https://docs.djangoproject.com/en/dev/ref/settings/#static-root
STATIC_ROOT = str(ROOT_DIR("staticfiles"))

# See: https://docs.djangoproject.com/en/dev/ref/settings/#static-url
STATIC_URL = "/appstatic/"

# See: https://docs.djangoproject.com/en/dev/ref/contrib/staticfiles/#std:setting-STATICFILES_DIRS
STATICFILES_DIRS = (
    # str(APPS_DIR.path("static")),
)

# See: https://docs.djangoproject.com/en/dev/ref/contrib/staticfiles/#staticfiles-finders
STATICFILES_FINDERS = (
    "django.contrib.staticfiles.finders.FileSystemFinder",
    "django.contrib.staticfiles.finders.AppDirectoriesFinder",
)

# MEDIA CONFIGURATION
# ------------------------------------------------------------------------------
# See: https://docs.djangoproject.com/en/dev/ref/settings/#media-root
MEDIA_ROOT = str(ROOT_DIR("media"))

# See: https://docs.djangoproject.com/en/dev/ref/settings/#media-url
MEDIA_URL = "/media/"

# URL Configuration
# ------------------------------------------------------------------------------
ROOT_URLCONF = "config.urls"

# See: https://docs.djangoproject.com/en/dev/ref/settings/#wsgi-application
WSGI_APPLICATION = "config.wsgi.application"

# AUTHENTICATION CONFIGURATION
# ------------------------------------------------------------------------------
AUTHENTICATION_BACKENDS = (
    "django.contrib.auth.backends.ModelBackend",
)

# REDIS
# -----
REDIS_HOST = env("REDIS_HOST", default="localhost")
REDIS_PORT = env("REDIS_PORT", default=6379)
REDIS_DB = env("REDIS_DB", default=0)
REDIS_PASSWORD = env("REDIS_PASSWORD", default=None)

# RQ
# --
_rq_redis_params = {
    "HOST": REDIS_HOST,
    "PORT": REDIS_PORT,
    "DB": REDIS_DB,
    "PASSWORD": REDIS_PASSWORD,
    "DEFAULT_TIMEOUT": 360,
}
RQ_QUEUES = {
    "high": _rq_redis_params,
    "medium": _rq_redis_params,
    "low": _rq_redis_params,
    "default": _rq_redis_params,
}
RQ_SHOW_ADMIN_LINK = True

# Location of root django.contrib.admin URL, use {% url "admin:index" %}
ADMIN_URL = r"^admin/"

# SITE CONFIGURATION
# ------------------------------------------------------------------------------
# Hosts/domain names that are valid for this site
# See https://docs.djangoproject.com/en/1.6/ref/settings/#allowed-hosts
ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=["127.0.0.1", "localhost"])

# The Federation
# ------------------------------------------------------------------------------
THEFEDERATION_DOMAIN = env("THEFEDERATION_DOMAIN", default="127.0.0.1")
THEFEDERATION_HTTPS = env.bool("THEFEDERATION_HTTPS", True)
THEFEDERATION_URL = "{protocol}://{domain}".format(
    protocol="https" if THEFEDERATION_HTTPS else "http",
    domain=THEFEDERATION_DOMAIN
)
THEFEDERATION_LEGACY_HOST = env("THEFEDERATION_LEGACY_HOST", default='localhost')
THEFEDERATION_LEGACY_USER = env("THEFEDERATION_LEGACY_USER", default='thefederation')
THEFEDERATION_LEGACY_PASSWORD = env("THEFEDERATION_LEGACY_PASSWORD", default=None)
THEFEDERATION_LEGACY_DB = env("THEFEDERATION_LEGACY_DB", default='thefederation')

# For posting on Socialhome
THEFEDERATION_SOCIALHOME_HOST = env("THEFEDERATION_SOCIALHOME_HOST", default="socialhome.network")
THEFEDERATION_SOCIALHOME_KEY = env("THEFEDERATION_SOCIALHOME_KEY", default="")
THEFEDERATION_SOCIALHOME_VISIBILITY = env("THEFEDERATION_SOCIALHOME_VISIBILITY", default="self")

# Graphene
# --------
GRAPHENE = {
    'SCHEMA': 'config.schema.schema'
}

# CORS
# ----
# Allow from all
CORS_ORIGIN_ALLOW_ALL = True

# MAXMIND GEOIP2
# --------------
MAXMIND_DB_PATH = os.path.join(str(ROOT_DIR("utils")), "maxmind", "GeoLite2-Country.mmdb")

# SILK
# ----
def is_silky_request(request):
    path = request.path.strip('/')
    if path.startswith('_') or path.startswith('admin') or path.startswith('static'):
        return False
    return True

SILKY_AUTHENTICATION = True
SILKY_AUTHORISATION = True
SILKY_INTERCEPT_FUNC = is_silky_request

# LOGGING CONFIGURATION
# ------------------------------------------------------------------------------
# See: https://docs.djangoproject.com/en/dev/ref/settings/#logging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": True,
    "filters": {
        "require_debug_false": {
            "()": "django.utils.log.RequireDebugFalse"
        }
    },
    "formatters": {
        "verbose": {
            "format": "%(levelname)s %(asctime)s %(module)s "
                      "%(process)d %(thread)d %(message)s"
        },
    },
    "handlers": {
        "mail_admins": {
            "level": "ERROR",
            "filters": ["require_debug_false"],
            "class": "django.utils.log.AdminEmailHandler"
        },
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
        "file": {
            "filename": env("THEFEDERATION_LOGFILE", default="/tmp/thefederation.log"),
            "level": "DEBUG",
            "class": "logging.handlers.RotatingFileHandler",
            "formatter": "verbose",
            "maxBytes": 10485760,  # 10mb
            "backupCount": 10,
        },
    },
    "loggers": {
        "django.request": {
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": True,
        },
        "django.security.DisallowedHost": {
            "level": "ERROR",
            "handlers": ["console"],
            "propagate": True
        },
        "thefederation": {
            "level": "DEBUG",
            "handlers": ["console"],
            "propagate": False,
        },
        "federation": {
            "level": "DEBUG",
            "handlers": ["console"],
            "propagate": False,
        },
        "rq_scheduler.scheduler": {
            "level": "ERROR",
            "handlers": ["console"],
            "propagate": False,
        },
    }
}
