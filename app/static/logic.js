function change_theme() {
    if (document.getElementById('theme-btn').textContent == 'Light Mode') {
        // 'Dark Mode' -> 'Light Mode'
        document.getElementById('theme-btn').textContent = 'Dark Mode';
        document.getElementById('intro').style.color = '#000000';
        document.body.style.background = '#F0FFFF';
    }
    else {
        // 'Light Mode' -> 'Dark Mode'
        document.getElementById('theme-btn').textContent = 'Light Mode';
        document.getElementById('intro').style.color = '#FFFFFF';
        document.body.style.background = '#000000';
    }
}

function filter(filter_type) {
    // Polyfill for String.endsWith()
    if (!String.prototype.endsWith) {
        String.prototype.endsWith = function(search, this_len) {
            if (this_len === undefined || this_len > this.length) {
                this_len = this.length;
            }
            return this.substring(this_len-search.length, this_len) === search;
        };
    }
    if ( !document.getElementById('old-img').src.
         endsWith('placeholder.png') ) {
        if (filter_type == 'black_and_white') {
            console.log('black and white filter');
        }
        else if (filter_type == 'sepia') {
            console.log('sepia filter');
        }
        else if (filter_type == 'casper') {
            console.log('casper filter');
        }
    }
}

function upload(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(load_event) {
            var content = load_event.target.result;
            $('#old-img').attr('src', content);
            $('#new-img').attr('src', content);
        };
        // readAsDataURL represents the image as a base64 encoded string that
        // starts with the regexp 'data:*/*;base64,' so may need to remove:
        // var search_value = new RegExp('data:*/*;base64,');
        // console.log( content.substring(content.indexOf(',')+1) );
        reader.readAsDataURL(input.files[0]);
    }
}
