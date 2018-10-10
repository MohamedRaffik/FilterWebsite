# Page routes

from flask import request, render_template
from app import app

@app.route('/', methods=['GET', 'POST'])
@app.route('/index', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        filter_type = request.json['filter']
        if filter_type == 'black_and_white':
            return 'BW'
        elif filter_type == 'sepia':
            return 'S'
        elif filter_type == 'casper':
            return 'C'
    return render_template('index.html')
