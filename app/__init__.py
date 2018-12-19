# Flask application instance

from flask import Flask, Session
from flask_mail import Mail, Message
import os
import psycopg2

app = Flask(__name__)

app.config.update(
    SECRET_KEY = os.environ['SECRET_KEY']
    SESSION_USE_SIGNER = True,
    MAIL_SERVER   = 'smtp.gmail.com',
    MAIL_PORT     = 587,
    MAIL_USE_TLS  = True,
    MAIL_USE_SSL  = False,
    MAIL_USERNAME = 'filterx.website@gmail.com',
    MAIL_PASSWORD = os.environ['GMAIL_PASSWORD']
)

mail = Mail(app)
session = Session()
DATABASE_URL = os.environ['DATABASE_URL']
conn = psycopg2.connect(DATABASE_URL, sslmode='require')

from app import routes
