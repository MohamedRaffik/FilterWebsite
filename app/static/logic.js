function change_theme() {
    var new_theme;
    if (document.body.className == 'dark') {   // 'Dark Mode' -> 'Light Mode'
        document.getElementById('theme-btn').textContent = 'Dark Mode';
        new_theme = 'light';
    }
    else {   // 'Light Mode' -> 'Dark Mode'
        document.getElementById('theme-btn').textContent = 'Light Mode';
        new_theme = 'dark';
    }
    document.getElementById('intro').className = new_theme;
    document.body.className = new_theme;
}

function filter(filter_type) {
    var img_string = document.getElementById('old-img').src;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/', true);
    xhr.setRequestHeader('content-type',
                         'application/x-www-form-urlencoded;charset=UTF-8');
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            document.getElementById('new-img').src = xhr.responseText;
        }
    };
    // Add time to URL to keep AJAX call unique and not cached by browser
    xhr.send('filter_type=' + filter_type + '&img_string=' +
             encodeURIComponent(img_string) + '&t=' + new Date().getTime());
}

function upload(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(load_event) {
            var content = load_event.target.result;
            document.getElementById('old-img').src = content;
            document.getElementById('new-img').src = content;
        };
        // readAsDataURL represents the image as a base64 encoded string that
        // starts with the regexp 'data:*/*;base64,'
        reader.readAsDataURL(input.files[0]);
    }
}
