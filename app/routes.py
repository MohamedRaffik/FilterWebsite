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

@app.route('/urlInput', methods=['POST'])
def url_input():
    if request.method == 'POST':
        b64_from_url = filter.urlImg_to_b64(request.form['img_url'])
        return b64_from_url
