# Page routes

from flask import request, render_template
from app import app
from app import filter

@app.route('/', methods=['GET', 'POST'])
@app.route('/index', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        filter_type = request.form['filter_type']
        b64_string = request.form['img_string']
        type_of = b64_string[b64_string.index('/')+1:b64_string.index(';')]
        if type_of == 'gif' or type_of =='webp':
            new_img = filter.motion_filter(b64_string, filter_type, type_of)
        else:
            new_img = filter.filter(b64_string, filter_type)
        return new_img
    return render_template('index.html')
