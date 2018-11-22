var filter_button_active = true;
var upload_active = true;

function filter(filter_type) {
    if (!filter_button_active)
        alert('Wait for current upload or filter to finish processing!');
    else if (document.getElementById('old-img').className == 'default')
        alert('Upload an image before clicking the filter button!');
    else if (filter_type == 'none')
        alert('Select a filter before clicking the filter button!');
    else if (document.getElementById('old-img').src.indexOf('.') != -1)
        alert('Cannot filter image! Try another upload method.');
    else {
        // Prevent upload and filter() calls while processing a filter
        filter_button_active = false; upload_active = false;
        var img_string = document.getElementById('old-img').src;
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/', true);
        xhr.setRequestHeader('content-type',
                             'application/x-www-form-urlencoded;charset=UTF-8');
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                document.getElementById('new-img').src = xhr.responseText;
                filter_button_active = true; upload_active = true;
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

function get_img_type(b64_string) {
    // b64_string starts with 'data:image/img_type;base64,'
    var start_pos = b64_string.indexOf('data:image/') + 11;
    var end_pos = b64_string.indexOf(';', start_pos);
    return b64_string.substring(start_pos, end_pos);
}

function update_images(b64_string, add_to_slider) {
    if (!is_valid_b64img(b64_string))
        alert('Unable to upload item! Try another upload method.');
    else {
        var click_sound = new Audio('../static/sounds/camera_sound.mp3');
        click_sound.volume = 0.25; click_sound.play();
        document.getElementById('old-img').src = b64_string;
        document.getElementById('old-img').className = 'not-default';
        document.getElementById('new-img').src = b64_string;
        document.getElementById('new-img').className = 'not-default';
        if (add_to_slider) {
            /* slickRemove(index, removeBefore)
               Remove slide by index. If removeBefore is set true, remove
               slide preceding index, or the first slide if no index is
               specified. If removeBefore is set to false, remove the slide
               following index, or the last slide if no index is set. */
            // Remove the last slide:
            $('.img-slider').slick('slickRemove', false);
            /* slickAdd(HTML String/DOM object, index, addBefore)
               Add a slide. If an index is provided, will add at that index,
               or before if addBefore is set. If no index is provided, add
               to the end or to the beginning if addBefore is set. */
            var new_slide = '<div><img class="not-default" src="'
                + b64_string + '" alt="Recent image"></div>';
            // Add new_slide at the front:
            $('.img-slider').slick('slickAdd', new_slide, 0, true);
        }
    }
}

function download_image() {
    if (document.getElementById('new-img').className == 'default')
        alert('Upload an image before clicking the download button!');
    else {
        var b64_string = document.getElementById('new-img').src;
        var img_type = get_img_type(b64_string);
        download(b64_string, 'filterx-download.'+img_type, 'image/'+img_type);
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
            // Prevent upload and filter() calls while processing an upload
            filter_button_active = false; upload_active = false;
            var proxy_url = 'https://cors-anywhere.herokuapp.com/';
            var xhr = new XMLHttpRequest();
            xhr.open('GET', proxy_url + url, true);
            xhr.responseType = 'blob';
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var reader = new FileReader();
                    reader.onload = function() {
                        update_images(reader.result, true);
                        filter_button_active = true; upload_active = true;
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
            // input is a FileList object obtained from file item
            if (input.files[0].type.indexOf('image') == -1)
                alert('Only image files can be uploaded! Try again.');
            else {
                var reader = new FileReader();
                reader.onload = function() {
                    update_images(reader.result, true);
                };
                // readAsDataURL represents the image as a base64 encoded string
                // that starts with the regexp 'data:*/*;base64,'
                reader.readAsDataURL(input.files[0]);
            }
        }
        else {
            // input is a DataTransfer object obtained from remote item
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
                update_images(text_string, true);
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

$(document).ready(function() {

    // Configure nav button functionality
    $('.nav-btn').click(function(event) {
        event.preventDefault();
        event.stopPropagation();
    });

    // Documentation at https://github.com/ajlkn/jquery.scrollex
    $('.page-section').scrollex({
        /* Mode: where the viewport edge(s) must fall within the element's
           contact area for it to be considered "active" */
        mode: 'top',
        // Padding (of contact area): + for inward, - for outward
        top: '-1%',
        bottom: '1%',
        // Enter event: when element becomes "active"
        enter: function() {
            var id = $(this)[0].id;
            $('.nav-btn[href=#'+id+']').addClass('active');
        },
        // Leave event: when element becomes "inactive"
        leave: function() {
            var id = $(this)[0].id;
            $('.nav-btn[href=#'+id+']').removeClass('active');
        }
    });

    /* Configure image slider functionality
       Documentation at http://kenwheeler.github.io/slick */
    $('.img-slider').slick({
        dots: true,
        infinite: false,
        speed: 750,
        slidesToShow: 4,
        slidesToScroll: 4,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                }
            },
            {
                breakpoint: 752,
                settings: {
                    arrows: false,
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 480,
                settings: {
                    arrows: false,
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });

    $('.img-slider').on('dblclick', 'img', function() {
        var b64_string = $(this)[0].src;
        update_images(b64_string, false);
    });

});
