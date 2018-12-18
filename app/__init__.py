# Flask application instance

from flask import Flask
from flask_mail import Mail, Message
import os
import psycopg2

app = Flask(__name__)
app.secret_key = os.urandom(16)
app.config.update(
    MAIL_SERVER   = 'smtp.gmail.com',
    MAIL_PORT     = 587,
    MAIL_USE_TLS  = True,
    MAIL_USE_SSL  = False,
    MAIL_USERNAME = 'filterx.website@gmail.com',
    MAIL_PASSWORD = os.environ['GMAIL_PASSWORD']
)
mail = Mail(app)
DATABASE_URL = os.environ['DATABASE_URL']
conn = psycopg2.connect(DATABASE_URL, sslmode='require')

from app import routes
