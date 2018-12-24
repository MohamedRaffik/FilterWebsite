# Page routes

from flask import request, render_template, redirect, url_for, json
from flask_login import current_user, login_user, logout_user, login_required
from passlib.hash import bcrypt
from datetime import timedelta
from app import app, filter, conn, psycopg2, login, mail, Message

class User():
    def __init__(self, email, username):
        self.email = email
        self.username = username
    def is_authenticated(self):
        return True
    def is_active(self):
        return True
    def is_anonymous(self):
        return False
    def get_id(self):
        return self.email
    def get_username(self):
        return self.username

@login.user_loader
def load_user(id):
    # Query Database
    cur = conn.cursor()
    cur.execute("select email, username from accounts where email=%s", [id])
    data = cur.fetchone()
    if data == None:
        return None
    else:
        return User(data[0], data[1])

@app.route('/')
@app.route('/index')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    else:
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

'''
    Data format for albums:
    [
        {
                "album_name": "---",
                "images": ["---", "---", "---", ...]
        }, ...
    ]
'''
def get_galleries(cur):
    cur.execute("select albums from accounts where email=%s", [current_user.get_id()])
    return cur.fetchone()[0]

def update_galleries(cur, data):
    cur.execute("update accounts set albums=%s where email=%s", [json.dumps(data), current_user.get_id()])
    conn.commit()

@app.route('/galleries', methods=['GET', 'POST'])
def galleries():
    cur = conn.cursor()
    if request.method == 'POST':
        if request.form['type'] == 'name':
            data = get_galleries(cur)
            for i in data:
                if i['album_name'] == request.form['old']:
                    i['album_name'] = request.form['new']
            update_galleries(cur, data)
            return 'update'
        elif request.form['type'] == 'add':
            data = get_galleries(cur)
            data.append({ 'album_name' : request.form['name'], 'images': [] })
            update_galleries(cur, data)
            return 'add'
        elif request.form['type'] == 'remove':
            data = get_galleries(cur)
            for i in data:
                if i['album_name'] == request.form['name']:
                    data.remove(i)
                    break
            update_galleries(cur, data)
            return 'delete'
        elif request.form['type'] == 'addimg':
            data = get_galleries(cur)
            for i in data:
                if i['album_name'] == request.form['name']:
                    i['images'].append(request.form['img'])
                    break
            update_galleries(cur, data)
            return 'addimg'
    data = get_galleries(cur)
    return json.dumps(data)

@app.route('/message', methods=['POST'])
def message():
    formName = request.form['name']
    formEmail = request.form['email']
    formMessage = request.form['message']
    msg = Message('Hello, this is ' + formName + ' from ' + formEmail, sender=formEmail, recipients=['filterx.website@gmail.com'])
    msg.body = formMessage
    mail.send(msg)
    return 'success'

@app.route('/password', methods=['POST'])
def change_pass():
    cur = conn.cursor()
    cur.execute("select password from accounts where email=%s", [current_user.get_id()])
    data = cur.fetchone()[0]
    if not bcrypt.verify(request.form['curr'], data): return 'wrong'
    elif request.form['new'] == request.form['curr']: return 'same'
    newpass = bcrypt.hash(request.form['new'])
    cur.execute("update accounts set password=%s where email=%s", [newpass, current_user.get_id()])
    return 'success'

@app.route('/home')
@login_required
def home():
    return render_template('home.html', username=current_user.get_username())

@app.route('/logout', methods=['GET'])
def logout():
    logout_user()
    return url_for('index')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        if request.form['type'] == 'signin':
            # Query Database
            cur = conn.cursor()
            cur.execute("select email, username, password from accounts where email=%s", [request.form['email']])
            data = cur.fetchone()
            # Fail conditions [no user by that email or password does not match]
            if data == None: return '', 298
            if not bcrypt.verify(request.form['pass'], data[2]): return '', 299
            # If good go to home page
            login_user(User(data[0], data[1]), remember=True, duration=timedelta(days=1))
            return url_for('home')

        elif request.form['type'] == 'signup':
            try:
                albums = json.dumps([{ 'album_name': "My Gallery", 'images': [] }])
                #Query Database
                cur = conn.cursor()
                # Attempt to add new user and login
                password = bcrypt.hash(request.form['pass'])
                cur.execute("insert into accounts (email, username, password, albums) values (%s, %s, %s, %s)",
                            [request.form['email'], request.form['user'], password, albums])
                conn.commit()
                login_user(User(request.form['email'], request.form['user']), remember=True, duration=timedelta(days=1))
                return url_for('home')
            except psycopg2.IntegrityError:
                cur.execute('ROLLBACK')
                return '', 299

    if current_user.is_authenticated:
        return redirect(url_for('home'))
    else:
        return render_template('login.html')
