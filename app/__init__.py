# Flask application instance

from flask import Flask
from flask_login import LoginManager
from flask_mail import Mail, Message
import os
import psycopg2

app = Flask(__name__)

app.secret_key = b'Y\xf7\xec\xe3m\x99r\x19A\x9d*l[\xdd\xa1\xf9\xe7P\x8a\x88\xd7\x067<'

app.config.update(
    MAIL_SERVER   = 'smtp.gmail.com',
    MAIL_PORT     = 587,
    MAIL_USE_TLS  = True,
    MAIL_USE_SSL  = False,
    MAIL_USERNAME = 'filterx.website@gmail.com',
    MAIL_PASSWORD = os.environ['GMAIL_PASSWORD']
)

login = LoginManager(app)
login.login_view = 'login'
mail = Mail(app)
DATABASE_URL = os.environ['DATABASE_URL']
conn = psycopg2.connect(DATABASE_URL, sslmode='require')

from app import routes
