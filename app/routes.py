# Page routes

from flask import request, render_template, redirect, url_for, session
from app import app, filter, conn, psycopg2
from passlib.hash import bcrypt

@app.route('/', methods=['GET'])
@app.route('/index', methods=['GET'])
def index():
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
        if request.form['type'] == 'signin':
            # Query Database
            cur = conn.cursor()
            cur.execute("select username, password from accounts where email=(%s)", [request.form['email']])
            data = cur.fetchone()
            # Fail conditions [No user by that email or password does not match]
            if data == None: return 'none'
            if not bcrypt.verify(request.form['pass'], data[1]): return 'pass'
            # If good got to index
            session['username'] = data[0]
            return redirect(url_for('index'))

        elif request.form['type'] == 'signup':
            try:
                #Query Databse
                cur = conn.cursor()
                # Attempt to add new user and login
                password = bcrypt.hash(request.form['pass'])
                cur.execute("insert into accounts (email, username, password) values (%s, %s, %s)", 
                    [request.form['email'], request.form['user'], password])
                conn.commit()
                session['username'] = request.form['user']
                return redirect(url_for('index'))
            except psycopg2.IntegrityError:
                cur.execute('ROLLBACK')
                return ''

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
