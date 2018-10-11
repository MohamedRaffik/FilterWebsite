# Page routes

from flask import request, render_template
from app import app

@app.route('/', methods=['GET', 'POST'])
@app.route('/index', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        filter_type = request.form['filter']
        if filter_type == 'black_and_white':
            return 'filter: black_and_white'
        elif filter_type == 'sepia':
            return 'filter: sepia'
        elif filter_type == 'casper':
            return 'filter: casper'
    return render_template('index.html')
