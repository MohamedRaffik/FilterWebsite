# Flask application instance

from flask import Flask
import os
import psycopg2

app = Flask(__name__)
app.secret_key = os.urandom(16)
DATABASE_URL = os.environ['DATABASE_URL']
conn = psycopg2.connect(DATABASE_URL, sslmode='require')

from app import routes
