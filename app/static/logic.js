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
        var img_string = document.getElementById('new-img').src;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                console.log(xhr.responseText);
            }
        };
        xhr.open('POST', '/', true);
        xhr.setRequestHeader('content-type',
                             'application/x-www-form-urlencoded;charset=UTF-8');
        xhr.send('filter_type=' + filter_type + '&img_string=' +
                 encodeURIComponent(img_string) + '&t=' + new Date().getTime());
        // Add time to keep AJAX call unique and not cached by browser
    }
}

function upload(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(load_event) {
            var content = load_event.target.result;
            $('#old-img').attr('src', content);
            $('#new-img').attr('src', content);
            //console.log(content)
        };
        // readAsDataURL represents the image as a base64 encoded string that
        // starts with the regexp 'data:*/*;base64,' so may need to remove
        reader.readAsDataURL(input.files[0]);
    }
}
