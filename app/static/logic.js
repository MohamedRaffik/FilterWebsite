var filter_buttons_active = true;

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
        alert('Wait for current filter to finish processing!');
    else if (document.getElementById('old-img').className == 'default')
        alert('Upload an image before clicking a filter button!');
    else if (document.getElementById('old-img').src.indexOf('.') != -1)
        alert('Cannot filter image! Try another upload method.');
    else {
        // Prevent multiple filter() calls while processing a filter
        filter_buttons_active = false;
        document.getElementById('socials').className = 'hide';
        document.getElementById('loading').className = 'show';
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
                document.getElementById('loading').className = 'hide';
                document.getElementById('socials').className = 'show';
                filter_buttons_active = true;
            }
        };
        // Add time to URL to keep AJAX call unique and not cached by browser
        xhr.send('filter_type=' + filter_type + '&img_string=' +
                 encodeURIComponent(img_string) + '&t=' + new Date().getTime());
    }
}

function update_images(b64_string) {
    var click_sound = new Audio('../static/sounds/camera_sound.mp3');
    click_sound.volume = 0.5; click_sound.play();
    document.getElementById('drop-area').className = 'hide';
    document.getElementById('old-img').src = b64_string;
    document.getElementById('old-img').className = 'not-default';
    document.getElementById('new-img').src = b64_string;
    document.getElementById('new-img').className = 'not-default';
}

function url_upload(url) {
    var pattern = new RegExp('^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$');
    if (!pattern.test(url))
        alert('Invalid image URL! Try again.');
    else {
        console.log(url);
    }
}

function upload(input) {
    if (!input)
        alert('Unable to upload item! Try another upload method.');
    else if (input.files && input.files[0]) {
        // input is a FileList object obtained from file item (upload or drop)
        if (input.files[0].type.indexOf('image') == -1)
            alert('Only image files can be uploaded! Try again.');
        else {
            var reader = new FileReader();
            reader.onload = function(event) {
                update_images(event.target.result);
            };
            // readAsDataURL represents the image as a base64 encoded string
            // that starts with the regexp 'data:*/*;base64,'
            reader.readAsDataURL(input.files[0]);
        }
    }
    else {
        // input is a DataTransfer object obtained from remote item (drop)
        var html_string = input.getData('text/html');
        // html_string has the following substring: src="src_string"
        // where src_string is possibly a base64 encoded string
        if (!html_string || html_string.indexOf('src="') == -1)
            alert('Dropped item is not a valid image! Try again.');
        else {
            var start_pos = html_string.indexOf('src="')+5;
            var src_string = html_string.substring(
                start_pos, html_string.indexOf('"', start_pos)
            );
            if (src_string.indexOf(';base64,') == -1)
                alert('Unable to upload image! Try another upload method.');
            else {
                update_images(src_string);
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
}
