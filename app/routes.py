# Page routes

from flask import request, render_template, redirect, url_for, session, json
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

@app.route('/galleries', methods=['GET'])
def galleries():
    cur = conn.cursor()
    cur.execute("select albums from accounts where email=(%s)", [session['email']])
    data = cur.fetchone()[0]
    return data

@app.route('/logout', methods=['GET'])
def logout():
    session['email'] = None
    return redirect(url_for('index'))

@app.route('/home', methods=['GET'])
def home():
    if not session.get('email'):
        return redirect(url_for('index'))
    cur = conn.cursor()
    cur.execute("select username from accounts where email=(%s)", [session['email']])
    username = cur.fetchone()[0]
    return render_template('home.html', username=username)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        if request.form['type'] == 'signin':
            # Query Database
            cur = conn.cursor()
            cur.execute("select email, password from accounts where email=(%s)", [request.form['email']])
            data = cur.fetchone()
            # Fail conditions [No user by that email or password does not match]
            if data == None: return 'none'
            if not bcrypt.verify(request.form['pass'], data[1]): return 'pass'
            # If good got to index
            session['email'] = data[0]
            return redirect(url_for('home'))

        elif request.form['type'] == 'signup':
            try:
                albums = json.dumps([
                    {
                        'album_name': "test",
                        'images': []
                    }
                ])
                #Query Databse
                cur = conn.cursor()
                # Attempt to add new user and login
                password = bcrypt.hash(request.form['pass'])
                cur.execute("insert into accounts (email, username, password, albums) values (%s, %s, %s, %s)",
                            [request.form['email'], request.form['user'], password, json.dumps(albums)])
                conn.commit()
                session['email'] = request.form['email']
                return redirect(url_for('home'))
            except psycopg2.IntegrityError:
                cur.execute('ROLLBACK')
                return ''

    # show the login page if it wasn't submitted yet
    return render_template('login.html')

'''
    Data format for albums:
    [
        {
                "album_name": "---",
                "images": ["---", "---", "---", ...]
        }, ...
    ]
'''
