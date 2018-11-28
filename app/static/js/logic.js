// Boolean values used to determine if a filter or upload is still being processed
var filter_button_active = true;
var upload_active = true;

/* Function that communicates with the Flask backend, sending the image as a base64 string
   along with a string representing the filter that is to be applied on it (filter_type).
   The Flask backend returns the filtered image as a base64 string, which is then used
   to update #new-img (the image in the 'After' box) */
function filter(filter_type) {
    if (!filter_button_active)
        alert('Wait for current upload or filter to finish processing!');
    else if (document.getElementById('old-img').className == 'default')
        alert('Upload an image before clicking the filter button!');
    else if (filter_type == 'none')
        alert('Select a filter before clicking the filter button!');
    else {
        // Prevent upload and filter() calls while processing a filter
        filter_button_active = false; upload_active = false;
        $('#align-area').LoadingOverlay('show');
        var img_string = document.getElementById('old-img').src;
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/', true);
        xhr.setRequestHeader('content-type',
                             'application/x-www-form-urlencoded;charset=UTF-8');
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var b64_string = xhr.responseText;
                $('#align-area').LoadingOverlay('hide');
                if (document.getElementById('new-img').src != b64_string) {
                    document.getElementById('new-img').src = b64_string;
                    add_img_to_slider(b64_string);
                }
                filter_button_active = true; upload_active = true;
            }
        };
        // Add time to URL to keep AJAX call unique and not cached by browser
        xhr.send('filter_type=' + filter_type + '&img_string=' +
                 encodeURIComponent(img_string) + '&t=' + new Date().getTime());
    }
}

// Determines if the string str is a valid base64 image string
function is_valid_b64img(str) {
    // Valid base64 image strings start with this regular expression
    return str.search('data:image/.*;base64,') != -1;
}

// Determines if the string url is a valid URL
function is_valid_url(url) {
    /* Valid URLs in an anchor tag have valid hosts.
       Also make sure the URL is not the URL of our website */
    var a = document.createElement('a'); a.href = url;
    return a.host && a.host != window.location.host;
}

function get_img_type(b64_string) {
    // b64_string starts with 'data:image/img_type;base64,'
    var start_pos = b64_string.indexOf('data:image/') + 11;
    var end_pos = b64_string.indexOf(';', start_pos);
    return b64_string.substring(start_pos, end_pos);
}

function add_img_to_slider(b64_string) {
    /* slickRemove(index, removeBefore)
       Remove slide by index. If removeBefore is set true, remove slide
       preceding index, or the first slide if no index is specified. If
       removeBefore is set to false, remove the slide following index,
       or the last slide if no index is set. */
    // Remove the last slide:
    $('.img-slider').slick('slickRemove', false);
    /* slickAdd(HTML String/DOM object, index, addBefore)
       Add a slide. If an index is provided, will add at that index, or
       before if addBefore is set. If no index is provided, add to the
       end or to the beginning if addBefore is set. */
    var new_slide = '<div><img class="not-default" src="' +
        b64_string + '" alt="Recent image"></div>';
    // Add new_slide at the front:
    $('.img-slider').slick('slickAdd', new_slide, 0, true);
}

/* Displays the image represented by the base64 string in #old-img and #new-img (the
   'Before' and 'After' boxes); if b64_string is not a valid base64 image, alerts the
   user that the string is not able to be displayed */
function update_images(b64_string) {
    if (!is_valid_b64img(b64_string))
        alert('Unable to upload item! Try another upload method.');
    else {
        var add_to_slide = document.getElementById('new-img').src != b64_string;
        var click_sound = new Audio('../static/sounds/camera_sound.mp3');
        click_sound.volume = 0.25; click_sound.play();
        document.getElementById('old-img').src = b64_string;
        document.getElementById('old-img').className = 'not-default';
        document.getElementById('new-img').src = b64_string;
        document.getElementById('new-img').className = 'not-default';
        if (add_to_slide)
            add_img_to_slider(b64_string);
    }
}

/* Allows the user to download the filtered image displayed in the 'After' box.
   Alerts the user if they try to download when there is no image being displayed */
function download_image() {
    if (document.getElementById('new-img').className == 'default')
        alert('Upload an image before clicking the download button!');
    else {
        var b64_string = document.getElementById('new-img').src;
        var img_type = get_img_type(b64_string);
        var ext;
        if (img_type == 'x-icon')
            ext = '.ico';
        else if (img_type == 'svg+xml')
            ext = '.svg';
        else
            ext = '.'+img_type;
        download(b64_string, 'filterx-download'+ext, 'image/'+img_type);
    }
}

/* Function for the URL input on the webpage.
   Checks to make sure that an upload or filter is not being processed, and then
   retrieves the image from url as a base64 string and displays it to the user */
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
            $('#drop-area').LoadingOverlay('show');
            var proxy_url = 'https://cors-anywhere.herokuapp.com/';
            var xhr = new XMLHttpRequest();
            xhr.open('GET', proxy_url + url, true);
            xhr.responseType = 'blob';
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var reader = new FileReader();
                    reader.onload = function() {
                        $('#drop-area').LoadingOverlay('hide');
                        update_images(reader.result);
                        filter_button_active = true; upload_active = true;
                    };
                    reader.readAsDataURL(xhr.response);
                }
            };
            xhr.send();
        }
    }
}

/* Function for uploading images from the user's local machine or from
   drag and drop (from local machine or remote location, such as from a website) */
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
                    update_images(reader.result);
                };
                /* readAsDataURL represents the image as a base64 encoded string
                   that starts with the regexp 'data:image/*;base64,' */
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
            /* Determines if input was already a valid base64 image
               (e.g. drag and drop from 'After' box) or an image from a
               remote URL, in which case call the url_upload() function */
            if (is_valid_b64img(text_string))
                update_images(text_string);
            else if (!text_string || !is_valid_url(text_string))
                alert('Dropped item is not a valid image! Try again.');
            else
                url_upload(text_string);
        }
    }
}

// Configure drag-and-drop functionality
window.onload = function() {
    var drop_area = document.getElementById('drop-area');
    /* Calls upload() with the image data [base64 string] once a drop
       is done on #drop-area (the area inside the 'Before' box) */
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
        top: -5,
        bottom: 5,
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

    /* Configure default loading overlay functionality
       Documentation at https://gasparesganga.com/labs/jquery-loading-overlay */
    $.LoadingOverlaySetup({
        background: 'rgba(255, 255, 255, 0.75)',
        // direction can be 'row' or 'column'
        direction: 'column',
        // fade: [x, y] means x ms for "show"/fade in, y ms for "hide"/fade out
        fade: [200, 100],
        image: '',
        // maxSize and minSize are in pixels, size is a % of the container
        maxSize: 130,
        minSize: 50,
        size: 25,

        fontawesome: 'fa fa-cog',
        // Possible animations are: rotate_right, rotate_left, fadein, pulse
        fontawesomeAnimation: 'rotate_right 2500ms',
        fontawesomeAutoResize: true,
        fontawesomeColor: '#191970',
        fontawesomeOrder: 2,
        // Proportion between the fontawesome element and the size parameter:
        fontawesomeResizeFactor: 1.0,

        text: 'Loading...',
        textAnimation: '',
        textAutoResize: true,
        textColor: '#191970',
        textOrder: 1,
        // Proportion between the text element and the size parameter:
        textResizeFactor: 0.4
    });
    //$('#drop-area').LoadingOverlay('show');

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
                    slidesToScroll: 3
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

    /* Allow re-uploading of images that were recently uploaded or filtered
       by double clicking on an image in the slider */
    $('.img-slider').on('dblclick', 'img', function() {
        var b64_string = $(this)[0].src;
        update_images(b64_string);
    });

});
