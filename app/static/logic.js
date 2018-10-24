function change_theme() {
    if (document.body.className == 'dark') {
        document.body.className = 'light';
    }
    else {
        document.body.className = 'dark';
    }
}

function filter(filter_type) {
    if (document.getElementById('new-img').className != 'default-img') {
        document.getElementById('loading').style.visibility = 'visible';
        var waiting_song = new Audio('../static/sounds/runescape_harmony.mp3');
        waiting_song.play(); waiting_song.loop = true;

        var img_string = document.getElementById('old-img').src;
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/', true);
        xhr.setRequestHeader('content-type',
                             'application/x-www-form-urlencoded;charset=UTF-8');
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                document.getElementById('new-img').src = xhr.responseText;
                waiting_song.pause(); waiting_song.currentTime = 0;
                document.getElementById('loading').style.visibility = 'hidden';
            }
        };
        // Add time to URL to keep AJAX call unique and not cached by browser
        xhr.send('filter_type=' + filter_type + '&img_string=' +
                 encodeURIComponent(img_string) + '&t=' + new Date().getTime());
    }
}

function update_images(b64_string) {
    document.getElementById('drop-area').style.border = 'none';
    document.getElementById('old-img').style.border = '1px solid #000000';
    document.getElementById('old-img').src = b64_string;
    document.getElementById('new-img').src = b64_string;
    document.getElementById('new-img').className = 'not-default-img';
}

function upload(input) {
    new Audio('../static/sounds/camera_sound.mp3').play();
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(load_event) {
            var b64_string = load_event.target.result;
            update_images(b64_string);
        };
        // readAsDataURL represents the image as a base64 encoded string that
        // starts with the regexp 'data:*/*;base64,'
        reader.readAsDataURL(input.files[0]);
    }
    else {   // input is an image from another website being drag-and-dropped
        var html_string = input.getData('text/html');
        // html_string has the following substring: src="..." where ... is the
        // base64 encoded string that starts with the regexp 'data:*/*;base64,'
        var b64_string = html_string.substring(html_string.indexOf('src="')+5,
                                               html_string.length-2);
        if (b64_string.search('https://encrypted') == -1) {
            update_images(b64_string);
        }
        else {
            console.log(html_string);
            alert('404 Not Found Error! Try again.');
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
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
        drop_area.addEventListener(event, prevent_default, false);
    });
    ['dragenter', 'dragover'].forEach(event => {
        drop_area.addEventListener(event, highlight, false);
    });
    ['dragleave', 'drop'].forEach(event => {
        drop_area.addEventListener(event, unhighlight, false);
    });
}
