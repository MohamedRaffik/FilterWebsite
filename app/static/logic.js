var filter_buttons_active = true;
var upload_active = true;

function change_theme() {
    if (document.body.className == 'dark') {
        document.body.className = 'light';
    }
    else {
        document.body.className = 'dark';
    }
}

function filter(filter_type) {
    if (!filter_buttons_active)
        alert('Wait for current upload or filter to finish processing!');
    else if (document.getElementById('old-img').className == 'default')
        alert('Upload an image before clicking a filter button!');
    else if (document.getElementById('old-img').src.indexOf('.') != -1)
        alert('Cannot filter image! Try another upload method.');
    else {
        // Prevent upload as well as filter() calls while processing a filter
        filter_buttons_active = false; upload_active = false;
        document.getElementById('socials').className = 'hide';
        document.getElementById('filter-loading').className = 'show';
        var wait_song = new Audio('../static/sounds/runescape_harmony.mp3');
        wait_song.volume = 0.25; wait_song.play(); wait_song.loop = true;

        var img_string = document.getElementById('old-img').src;
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/', true);
        xhr.setRequestHeader('content-type',
                             'application/x-www-form-urlencoded;charset=UTF-8');
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                wait_song.pause();
                document.getElementById('new-img').src = xhr.responseText;
                document.getElementById('filter-loading').className = 'hide';
                document.getElementById('socials').className = 'show';
                filter_buttons_active = true; upload_active = true;
            }
        };
        // Add time to URL to keep AJAX call unique and not cached by browser
        xhr.send('filter_type=' + filter_type + '&img_string=' +
                 encodeURIComponent(img_string) + '&t=' + new Date().getTime());
    }
}

function is_valid_b64img(str) {
    return str.search('data:image/.*;base64,') != -1;
}

function is_valid_url(url) {
    var a = document.createElement('a'); a.href = url;
    return a.host && a.host != window.location.host;
}

function update_images(b64_string) {
    if (!is_valid_b64img(b64_string))
        alert('Unable to upload item! Try another upload method.');
    else {
        var click_sound = new Audio('../static/sounds/camera_sound.mp3');
        click_sound.volume = 0.5; click_sound.play();
        document.getElementById('drop-area').className = 'hide';
        document.getElementById('old-img').src = b64_string;
        document.getElementById('old-img').className = 'not-default';
        document.getElementById('new-img').src = b64_string;
        document.getElementById('new-img').className = 'not-default';
    }
}

function download_image() {
    if (document.getElementById('new-img').className == 'default')
        alert('Upload an image before clicking the download button!');
    else {
        download(document.getElementById('new-img').src, 'filterx_download.jpg', 'image/jpeg');
    }
}

function url_upload(url) {
    if (!upload_active)
        alert('Wait for current upload or filter to finish processing!');
    else {
        var start_pos = url.indexOf('imgurl=');
        if (start_pos != -1) {
            start_pos += 7;
            var end_pos = url.indexOf('&', start_pos);
            if (end_pos != -1) {
                // Read after 'imgurl=' and before '&' (& starts next URL param)
                url = decodeURIComponent( url.substring(start_pos, end_pos) );
            }
        }

        if (!is_valid_url(url))
            alert('Invalid URL! Try again.');
        else {
            // Prevent upload as well as filter() calls while processing an upload
            filter_buttons_active = false; upload_active = false;
            document.getElementById('upload-options').className = 'hide';
            document.getElementById('upload-loading').className = 'show';
            var proxy_url = 'https://cors-anywhere.herokuapp.com/';
            var xhr = new XMLHttpRequest();
            xhr.open('GET', proxy_url + url, true);
            xhr.responseType = 'blob';
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var reader = new FileReader();
                    reader.onload = function() {
                        update_images(reader.result);
                        document.getElementById('upload-loading').className = 'hide';
                        document.getElementById('upload-options').className = 'show';
                        filter_buttons_active = true; upload_active = true;
                    };
                    reader.readAsDataURL(xhr.response);
                }
            };
            xhr.send();
        }
    }
}

function upload(input) {
    if (!upload_active)
        alert('Wait for current upload or filter to finish processing!');
    else {
        if (!input)
            alert('Unable to upload item! Try another upload method.');
        else if (input.files && input.files[0]) {
            // input is a FileList object obtained from file item (upload or drop)
            if (input.files[0].type.indexOf('image') == -1)
                alert('Only image files can be uploaded! Try again.');
            else {
                var reader = new FileReader();
                reader.onload = function() {
                    update_images(reader.result);
                };
                // readAsDataURL represents the image as a base64 encoded string
                // that starts with the regexp 'data:*/*;base64,'
                reader.readAsDataURL(input.files[0]);
            }
        }
        else {
            // input is a DataTransfer object obtained from remote item (drop)
            var text_string = input.getData('text');
            var html_string = input.getData('text/html');
            var start_pos = html_string.indexOf('src="');
            if (html_string && start_pos != -1) {
                start_pos += 5;
                var end_pos = html_string.indexOf('"', start_pos);
                if (end_pos != -1) {
                    var src_string = html_string.substring(start_pos, end_pos);
                    text_string = new DOMParser().parseFromString(
                        src_string, 'text/html').body.textContent;
                }
            }

            if (is_valid_b64img(text_string)) {
                update_images(text_string);
            }
            else if (!text_string || !is_valid_url(text_string))
                alert('Dropped item is not a valid image! Try again.');
            else {
                url_upload(text_string);
            }
        }
    }
}

// Configure drag-and-drop functionality

window.onload = function() {
    var drop_area = document.getElementById('drop-area');

    function handle_drop(event) {
        upload(event.dataTransfer);
    }
    function prevent_default(event) {
        event.preventDefault();
        event.stopPropagation();
    }
    function highlight(event) {
        drop_area.classList.add('highlight');
    }
    function unhighlight(event) {
        drop_area.classList.remove('highlight');
    }

    drop_area.addEventListener('drop', handle_drop, false);
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function(event) {
        drop_area.addEventListener(event, prevent_default, false);
    });
    ['dragenter', 'dragover'].forEach(function(event) {
        drop_area.addEventListener(event, highlight, false);
    });
    ['dragleave', 'drop'].forEach(function(event) {
        drop_area.addEventListener(event, unhighlight, false);
    });
};
