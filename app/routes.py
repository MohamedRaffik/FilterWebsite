# Page routes

from flask import request, render_template
from app import app
from app import filter
import os
import psycopg2

@app.route('/', methods=['GET'])
@app.route('/index', methods=['GET'])
def index():
    #DATABASE_URL = os.environ['DATABASE_URL']
    #conn = psycopg2.connect(DATABASE_URL, sslmode='require')
    return render_template('index.html')

@app.route('/filter', methods=['POST'])
def apply_filter():
    filter_type = request.form['filter_type']
    b64_string = request.form['img_string']
    type_of = b64_string[b64_string.index('/')+1:b64_string.index(';')]
    if type_of == 'gif' or type_of =='webp':
        new_img = filter.motion_filter(b64_string, filter_type, type_of)
    else:
        new_img = filter.filter(b64_string, filter_type)
    return new_img

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # do stuff when the form is submitted

        # redirect to end the POST handling
        return redirect(url_for('index'))

    # show the login page if it wasn't submitted yet
    return render_template('login.html')

'''
    Data format for albums:

    {
        "albums": [
            {
                "album_name": "---",
                "images": ["---", "---", "---", ...]
            }, ...
        ]
    }
'''
