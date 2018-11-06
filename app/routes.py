# Page routes

from flask import request, render_template
from app import app
from app import filter

@app.route('/', methods=['GET', 'POST'])
@app.route('/index', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        filter_type = request.form['filter_type']
        new_img = filter.filter(request.form['img_string'], filter_type)
        return new_img
    return render_template('index.html')
