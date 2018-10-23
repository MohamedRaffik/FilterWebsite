function change_theme() {
    if (document.body.className == 'dark') {
        document.body.className = 'light';
    }
    else {
        document.body.className = 'dark';
    }
}

function filter(filter_type) {
    document.getElementById('loading').style.visibility = 'visible';
    var img_string = document.getElementById('old-img').src;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/', true);
    xhr.setRequestHeader('content-type',
                         'application/x-www-form-urlencoded;charset=UTF-8');
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            document.getElementById('new-img').src = xhr.responseText;
            document.getElementById('loading').style.visibility = 'hidden';
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
