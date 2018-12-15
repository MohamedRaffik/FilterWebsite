// Boolean values used to determine if a filter or upload is still being processed
var $filter_button_active = true;
var $upload_active = true;

// Boolean values used to prevent re-uploading of the same image to Cloudinary
var $uploaded_to_cloudinary = false; // Was the current image uploaded to Cloudinary?
var $prev_cloudinary_url = ''; // The URL of the image recently uploaded to Cloudinary

const $GALLERY_NAME_LIMIT = 30; // How long a gallery name can be

/* Function that communicates with the Flask backend.
   Sends to Flask: 1) #old-img (the image in the 'Before' box) as a base64 encoded string
   and 2) a string representing the filter that is to be applied on it (@filter_type).
   Receives from Flask: the filtered image as a base64 encoded string, which is then
   used to update #new-img (the image in the 'After' box).
   Side effect: $uploaded_to_cloudinary = false */
function filter(filter_type) {
    if (!$filter_button_active)
        alert('Wait for current upload or filter to finish processing!');
    else if (document.getElementById('old-img').className === 'default')
        alert('Upload an image before clicking the filter button!');
    else if (filter_type === 'none')
        alert('Select a filter before clicking the filter button!');
    else {
        // Prevent upload and filter() calls while processing a filter
        $filter_button_active = false; $upload_active = false;
        $('#align-area').LoadingOverlay('show');
        var img_string = document.getElementById('old-img').src;
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/filter', true);
        xhr.setRequestHeader('content-type',
                             'application/x-www-form-urlencoded;charset=UTF-8');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var b64_string = xhr.responseText;
                $('#align-area').LoadingOverlay('hide');
                if (document.getElementById('new-img').src !== b64_string) {
                    document.getElementById('new-img').src = b64_string;
                    add_img_to_slider(b64_string);
                    $uploaded_to_cloudinary = false;
                }
                $filter_button_active = true; $upload_active = true;
            }
        };
        // Add time to URL to keep AJAX call unique and not cached by browser
        xhr.send('filter_type=' + filter_type + '&img_string=' +
                 encodeURIComponent(img_string) + '&t=' + new Date().getTime());
    }
}

// Determines if the string @str is a valid base64 image string
function is_valid_b64img(str) {
    // Valid base64 image strings start with this regular expression
    return str.search('data:image/.*;base64,') !== -1;
}

// e.g. if @b64_string is 'data:image/png;base64,...', returns 'png'
function get_img_type(b64_string) {
    var start_pos = b64_string.indexOf('data:image/') + 11;
    var end_pos = b64_string.indexOf(';', start_pos);
    return b64_string.substring(start_pos, end_pos);
}

// Determines if the string @url is a valid URL
function is_valid_url(url) {
    /* Valid URLs in an anchor tag have valid hosts.
       Also make sure @url is not a URL of our website */
    var a = document.createElement('a'); a.href = url;
    return a.host && a.host !== window.location.host;
}

// Returns true if the current page is home.html, else returns false
function is_homepage() {
    return document.body.getAttribute('data-page') === 'home';
}

// Adds the image represented by the string @b64_string to the image slider in home.html
function add_img_to_slider(b64_string) {
    if (is_homepage()) {   // Only home.html has the image slider
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
}

/* Displays the image represented by the string @b64_string in #old-img and #new-img (the
   images in the 'Before' and 'After' boxes) and adds it to the image slider; if @b64_string
   is not a valid base64 image, alerts the user that the string is not able to be displayed.
   Side effect: $uploaded_to_cloudinary = false */
function update_images(b64_string) {
    var img_type = get_img_type(b64_string);
    if (!is_valid_b64img(b64_string))
        alert('Unable to upload item! Try another upload method.');
    else if (img_type === 'svg+xml' || img_type === 'tiff')
        alert('SVG and TIFF files are not supported!');
    else {
        var add_to_slide = document.getElementById('new-img').src !== b64_string;
        var click_sound = new Audio('../static/sounds/camera_sound.mp3');
        click_sound.volume = 0.25; click_sound.play();
        document.getElementById('old-img').src = b64_string;
        document.getElementById('old-img').className = 'not-default';
        document.getElementById('new-img').src = b64_string;
        document.getElementById('new-img').className = 'not-default';
        $uploaded_to_cloudinary = false;
        if (add_to_slide)
            add_img_to_slider(b64_string);
    }
}

/* Allows the user to download #new-img (the image in the 'After' box).
   Alerts the user if they try to download when there is no image being displayed */
function download_image() {
    if (document.getElementById('new-img').className === 'default')
        alert('Upload an image before clicking the download button!');
    else {
        var b64_string = document.getElementById('new-img').src;
        var img_type = get_img_type(b64_string);
        var ext;
        if (img_type === 'x-icon')
            ext = '.ico';
        else if (img_type === 'svg+xml')
            ext = '.svg';
        else
            ext = '.'+img_type;
        download(b64_string, 'filterx-download'+ext, 'image/'+img_type);
    }
}

/* Function for the URL input on the webpage. Checks to make sure that an
   upload or filter is not being processed, and then retrieves the image
   from string @url as a base64 string and displays it to the user */
function url_upload(url) {
    if (!$upload_active)
        alert('Wait for current upload or filter to finish processing!');
    else {
        var start_pos = url.indexOf('imgurl=');
        if (start_pos !== -1) {
            start_pos += 7;
            var end_pos = url.indexOf('&', start_pos);
            if (end_pos !== -1) {
                // Read after 'imgurl=' and before '&' (& starts next URL param)
                url = decodeURIComponent( url.substring(start_pos, end_pos) );
            }
        }

        if (!is_valid_url(url))
            alert('Invalid URL! Try again.');
        else {
            // Prevent upload and filter() calls while processing an upload
            $filter_button_active = false; $upload_active = false;
            $('#drop-area').LoadingOverlay('show');
            var proxy_url = 'https://cors-anywhere.herokuapp.com/';
            var xhr = new XMLHttpRequest();
            xhr.open('GET', proxy_url + url, true);
            xhr.responseType = 'blob';
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var reader = new FileReader();
                    reader.onload = function() {
                        $('#drop-area').LoadingOverlay('hide');
                        update_images(reader.result);
                        $filter_button_active = true; $upload_active = true;
                    };
                    reader.readAsDataURL(xhr.response);
                }
            };
            xhr.send();
        }
    }
}

// Function for uploading images from the user's local machine or from drag and drop
function upload(input) {
    if (!$upload_active)
        alert('Wait for current upload or filter to finish processing!');
    else {
        if (!input)
            alert('Unable to upload item! Try another upload method.');
        else if (input.files && input.files[0]) {
            // @input is a FileList object obtained from file item
            if (input.files[0].type.indexOf('image') === -1)
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
            // @input is a DataTransfer object obtained from remote item
            var text_string = input.getData('text');
            var html_string = '';
            var start_pos;
            if (skel.vars.browser !== 'ie') {
                html_string = input.getData('text/html');
                start_pos = html_string.indexOf('src="');
            }
            if (html_string && start_pos !== -1) {
                start_pos += 5;
                var end_pos = html_string.indexOf('"', start_pos);
                if (end_pos !== -1) {
                    var src_string = html_string.substring(start_pos, end_pos);
                    text_string = new DOMParser().parseFromString(
                        src_string, 'text/html').body.textContent;
                }
            }
            /* Determines if @input is already a valid base64 image
               (e.g. drag and drop from 'After' box) or an image from a
               remote URL, in which case calls url_upload() */
            if (is_valid_b64img(text_string))
                update_images(text_string);
            else if (!text_string || !is_valid_url(text_string))
                alert('Dropped item is not a valid image! Try again.');
            else
                url_upload(text_string);
        }
    }
}

/* Uploads string @b64_string as an image to Cloudinary and then invokes function
   @callback with the argument as the URL of the uploaded image. Side effects:
   $uploaded_to_cloudinary = true, $prev_cloudinary_url = '<URL of uploaded image>' */
function upload_to_cloudinary(b64_string, callback) {
    if (!$uploaded_to_cloudinary) {   // Prevent re-upload of same image
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://api.cloudinary.com/v1_1/filterx/upload', true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                $uploaded_to_cloudinary = true;
                var response = JSON.parse(xhr.responseText);
                $prev_cloudinary_url = response.secure_url;
                callback($prev_cloudinary_url);
            }
        };
        var form_data = new FormData();
        form_data.append('upload_preset', 'unsigned-default');
        form_data.append('tags', 'browser_upload');
        form_data.append('file', b64_string);
        xhr.send(form_data);
    }
    else
        callback($prev_cloudinary_url);
}

/* Shares the base64 encoded image in #new-img to @website, which can be one of:
   'facebook', 'twitter', or 'linkedin' */
function share_to(website) {
    if (document.getElementById('new-img').className === 'default')
        alert('Upload an image before clicking a share button!');
    else if (website === 'facebook') {
        var callback = function(url) {
            var link = document.createElement('a');
            link.href = 'https://www.facebook.com/sharer/sharer.php?u=' +
                encodeURIComponent(url);
            link.target = '_blank';
            link.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
        };
        upload_to_cloudinary(document.getElementById('new-img').src, callback);
    }
    else if (website === 'twitter') {
        var callback = function(url) {
            var link = document.createElement('a');
            link.href = 'https://twitter.com/intent/tweet?ref_src=twsrc%5Etfw&text=Come%20see%20my%20filtered%20image!&tw_p=tweetbutton&url=' + encodeURIComponent(url) + '&t=' + new Date().getTime();
            link.class = 'twitter-share-button';
            link.target = '_blank';
            link.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
        };
        upload_to_cloudinary(document.getElementById('new-img').src, callback);
    }
    else if (website === 'linkedin') {
        var callback = function(url) {
            var link = document.createElement('a');
            link.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url);
            link.target = '_blank';
            link.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
        };
        upload_to_cloudinary(document.getElementById('new-img').src, callback);
    }
}

// Toggles between #change-info's classes 'show' and 'hide', and how the #settings-btn looks
function toggle_settings() {
    var button = document.getElementById('settings-btn');
    var info = document.getElementById('change-info');
    if (info.className === 'show') {
        button.className = 'fa-cog icon';
        button.textContent = 'My Account';
        info.className = 'hide';
        $('.change-info input').each(function(){ this.value = ''; });
        document.getElementById('password-checkbox').checked = false;
        document.getElementById('change-password').type = 'password';
    }
    else {
        button.className = 'fa-close icon';
        button.textContent = 'Close';
        info.className = 'show';
    }
}

// Toggles between showing and hiding the typed value in the DOM input object @password
function toggle_password(password) {
    if (password.type === 'password')
        password.type = 'text';
    else
        password.type = 'password';
}
/*
  var test = 'data:image/gif;base64,R0lGODlhPQBEAPeoAJosM//AwO/AwHVYZ/z595kzAP/s7P+goOXMv8+fhw/v739/f+8PD98fH/8mJl+fn/9ZWb8/PzWlwv///6wWGbImAPgTEMImIN9gUFCEm/gDALULDN8PAD6atYdCTX9gUNKlj8wZAKUsAOzZz+UMAOsJAP/Z2ccMDA8PD/95eX5NWvsJCOVNQPtfX/8zM8+QePLl38MGBr8JCP+zs9myn/8GBqwpAP/GxgwJCPny78lzYLgjAJ8vAP9fX/+MjMUcAN8zM/9wcM8ZGcATEL+QePdZWf/29uc/P9cmJu9MTDImIN+/r7+/vz8/P8VNQGNugV8AAF9fX8swMNgTAFlDOICAgPNSUnNWSMQ5MBAQEJE3QPIGAM9AQMqGcG9vb6MhJsEdGM8vLx8fH98AANIWAMuQeL8fABkTEPPQ0OM5OSYdGFl5jo+Pj/+pqcsTE78wMFNGQLYmID4dGPvd3UBAQJmTkP+8vH9QUK+vr8ZWSHpzcJMmILdwcLOGcHRQUHxwcK9PT9DQ0O/v70w5MLypoG8wKOuwsP/g4P/Q0IcwKEswKMl8aJ9fX2xjdOtGRs/Pz+Dg4GImIP8gIH0sKEAwKKmTiKZ8aB/f39Wsl+LFt8dgUE9PT5x5aHBwcP+AgP+WltdgYMyZfyywz78AAAAAAAD///8AAP9mZv///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAKgALAAAAAA9AEQAAAj/AFEJHEiwoMGDCBMqXMiwocAbBww4nEhxoYkUpzJGrMixogkfGUNqlNixJEIDB0SqHGmyJSojM1bKZOmyop0gM3Oe2liTISKMOoPy7GnwY9CjIYcSRYm0aVKSLmE6nfq05QycVLPuhDrxBlCtYJUqNAq2bNWEBj6ZXRuyxZyDRtqwnXvkhACDV+euTeJm1Ki7A73qNWtFiF+/gA95Gly2CJLDhwEHMOUAAuOpLYDEgBxZ4GRTlC1fDnpkM+fOqD6DDj1aZpITp0dtGCDhr+fVuCu3zlg49ijaokTZTo27uG7Gjn2P+hI8+PDPERoUB318bWbfAJ5sUNFcuGRTYUqV/3ogfXp1rWlMc6awJjiAAd2fm4ogXjz56aypOoIde4OE5u/F9x199dlXnnGiHZWEYbGpsAEA3QXYnHwEFliKAgswgJ8LPeiUXGwedCAKABACCN+EA1pYIIYaFlcDhytd51sGAJbo3onOpajiihlO92KHGaUXGwWjUBChjSPiWJuOO/LYIm4v1tXfE6J4gCSJEZ7YgRYUNrkji9P55sF/ogxw5ZkSqIDaZBV6aSGYq/lGZplndkckZ98xoICbTcIJGQAZcNmdmUc210hs35nCyJ58fgmIKX5RQGOZowxaZwYA+JaoKQwswGijBV4C6SiTUmpphMspJx9unX4KaimjDv9aaXOEBteBqmuuxgEHoLX6Kqx+yXqqBANsgCtit4FWQAEkrNbpq7HSOmtwag5w57GrmlJBASEU18ADjUYb3ADTinIttsgSB1oJFfA63bduimuqKB1keqwUhoCSK374wbujvOSu4QG6UvxBRydcpKsav++Ca6G8A6Pr1x2kVMyHwsVxUALDq/krnrhPSOzXG1lUTIoffqGR7Goi2MAxbv6O2kEG56I7CSlRsEFKFVyovDJoIRTg7sugNRDGqCJzJgcKE0ywc0ELm6KBCCJo8DIPFeCWNGcyqNFE06ToAfV0HBRgxsvLThHn1oddQMrXj5DyAQgjEHSAJMWZwS3HPxT/QMbabI/iBCliMLEJKX2EEkomBAUCxRi42VDADxyTYDVogV+wSChqmKxEKCDAYFDFj4OmwbY7bDGdBhtrnTQYOigeChUmc1K3QTnAUfEgGFgAWt88hKA6aCRIXhxnQ1yg3BCayK44EWdkUQcBByEQChFXfCB776aQsG0BIlQgQgE8qO26X1h8cEUep8ngRBnOy74E9QgRgEAC8SvOfQkh7FDBDmS43PmGoIiKUUEGkMEC/PJHgxw0xH74yx/3XnaYRJgMB8obxQW6kL9QYEJ0FIFgByfIL7/IQAlvQwEpnAC7DtLNJCKUoO/w45c44GwCXiAFB/OXAATQryUxdN4LfFiwgjCNYg+kYMIEFkCKDs6PKAIJouyGWMS1FSKJOMRB/BoIxYJIUXFUxNwoIkEKPAgCBZSQHQ1A2EWDfDEUVLyADj5AChSIQW6gu10bE/JG2VnCZGfo4R4d0sdQoBAHhPjhIB94v/wRoRKQWGRHgrhGSQJxCS+0pCZbEhAAOw==';
*/
// Gets the number of images in the gallery with @id
function get_gallery_number_images(id) {
    return $('#'+id+' img').length;
}

// Appends the HTML of the galleries to the gallery section of home.html
function setup_galleries() {
    if (is_homepage()) {   // Only home.html has the galleries
        /*
        fetch('/galleries', {
            method: 'GET'
        }).then(function(res) { res.json(); })
            .then(function(data) {
                for (var i in data) {
                    var galleries = data;
                    var gallery_id = 'gallery'+i;
                    var gallery_html = '<div id="'+gallery_id+'" class="gallery"><div class="gallery-info column"><span class="gallery-name show">'+galleries[i]['album_name']+'</span><input class="gallery-name-input hide" type="text" maxlength="100" onfocusout="gallery_name_input($(this).closest(\'.gallery\').attr(\'id\'),\'hide\')"><span class="gallery-name-btn fa-pencil icon" onclick="gallery_name_input($(this).closest(\'.gallery\').attr(\'id\'),\'show\')"></span><span class="gallery-delete-btn fa-trash icon" onclick="delete_gallery($(this).closest(\'.gallery\').attr(\'id\'))"></span><div class="text">Number of images: <span class="gallery-number-images"></span></div></div><div class="gallery-box column">';
                    // Add each of the images in the current gallery to the HTML (in the .gallery-box div):
                    galleries[i]['images'].forEach(function(b64_string) {
                        // Format: <a><img src="foo"></a><a><img src="bar"></a> ...
                        gallery_html += '<a><img src="'+b64_string+'"></a>';
                    });
                    gallery_html += '</div></div>';
                    $('#gallery-section .inner-alt').append(gallery_html);
                    // Update Format: <a href="foo"><img src="foo"></a><a href="bar"><img src="bar"></a> ...
                    $('.gallery-box a').attr('href', this.children(':first').attr('src'));
                    // Add the number of images in each gallery to their respective HTML's:
                    $('#'+gallery_id+' .gallery-number-images').text(get_gallery_number_images(gallery_id));
                }
            }).catch(function(error) { console.error(error); });
        */
    }
}

// Checks if the gallery @name already exists
function gallery_name_exists(name) {
    var exists = false;
    $('.gallery-name').each(function() {
        if (this.textContent === name) {
            exists = true;
            return false;   // Break out of the each loop
        }
    });
    return exists;
}

/* Changes the gallery with @id from @old_name to @new_name
   if it is valid and doesn't already exist */
function change_gallery_name(id, old_name, new_name) {
    if (new_name === '' || old_name === new_name)
        ;   // Ignore empty name or same name
    else if (new_name.length > $GALLERY_NAME_LIMIT)
        alert('Gallery name can be at most ' +
              $GALLERY_NAME_LIMIT + ' characters long! Try again.');
    else if (gallery_name_exists(new_name))
        alert('That gallery name already exists! Try again.');
    else {
        // Change gallery @old_name in database to @new_name:
        /*var xhr = new XMLHttpRequest();
          xhr.open('POST', '/...', true);
          xhr.setRequestHeader('content-type',
          'application/x-www-form-urlencoded;charset=UTF-8');
          xhr.onreadystatechange = function() {
          if (xhr.readyState === 4 && xhr.status === 200) {
          console.log(xhr.responseText);
          }
          };
          // Add time to URL to keep AJAX call unique and not cached by browser
          xhr.send(... + '&t=' + new Date().getTime());*/
        $('#'+id+' .gallery-name').text(new_name);
    }
}

/* If @mode is 'hide', changes the gallery (with @id) name to what was typed into
   the input field, and then hides the input field and shows the new gallery name.
   Otherwise, hides the gallery name and shows the input field */
function gallery_name_input(id, mode) {
    var name = $('#'+id+' .gallery-name');
    var name_input = $('#'+id+' .gallery-name-input');
    if (mode === 'hide') {
        change_gallery_name(id, name.text(), name_input.val());
        name_input.removeClass('show').addClass('hide');
        name_input.val('');   // Clear the input field
        name_input.blur();
        name.removeClass('hide').addClass('show');
    }
    else {
        name.removeClass('show').addClass('hide');
        name_input.removeClass('hide').addClass('show');
        name_input.focus();
    }
}

/* Prompts the user for confirmation, and then deletes the gallery with @id */
function delete_gallery(id) {
    if (confirm('Are you sure? The action cannot be undone.')) {
        // Delete it from database ...
        $('#'+id).remove();
    }
}

// Configure key press functionality
document.addEventListener('keydown', function(event) {
    var element = event.target;
    if (event.which === 13) {   // New line was entered
        if (element.id === 'url-input')
            url_upload(element.value);
        else if (element.className.indexOf('gallery-name-input') !== -1)
            element.blur();
    }
}, true);

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

    /* Configure scrolling functionality
       Documentation at https://github.com/ajlkn/jquery.scrollex */
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

    /* Configure loading overlay functionality
       Documentation at https://gasparesganga.com/labs/jquery-loading-overlay */
    var loading_text = $('<div>', {
        'css' : {
            'color' : '#191970',
            'font-family' : 'Rockwell',
            'font-size' : '40px',
        },
        'text' : 'Loading...'
    });
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

        custom: loading_text,
        customAnimation: '',
        customAutoResize: true,
        customOrder: 1,
        // Proportion between the text element and the size parameter:
        customResizeFactor: 0.4
    });
    //$('#drop-area').LoadingOverlay('show');

    /* Configure image slider functionality
       Documentation at http://kenwheeler.github.io/slick */
    $('.img-slider').slick({
        dots: true,
        infinite: false,
        speed: 750,
        slidesToShow: 5,
        slidesToScroll: 5,

        responsive: [
            {
                breakpoint: 980,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 4
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3
                }
            }
        ]
    });
    /* Allow re-uploading of images that were recently uploaded or filtered
       by double clicking/tapping on an image in the slider */
    var timer = 0;
    $('.img-slider').on('click', 'img', function() {
        if (timer === 0) {
            timer = 1;
            // Second click/tap occurs within 600ms of first click/tap
            timer = setTimeout(function(){ timer = 0; }, 600);
        }
        else {   // Double click/tap code:
            var b64_string = $(this)[0].src;
            update_images(b64_string);
            timer = 0;
        }
    });

    /* Configure image gallery functionality
       Documentation at http://sachinchoolur.github.io/lightGallery/docs/api.html */
    setup_galleries();
    var galleries = $('.gallery-box');
    galleries.lightGallery({
        cssEasing: 'ease-in-out', // Type of easing used for css animations
        speed: 600, // Transition duration (in ms)
        backdropDuration: 250, // Backdrop transition duration (in ms)
        hideBarsDelay: 5000 // Delay for hiding gallery controls (in ms)
    });
    // Actions to perform just before opening a gallery:
    galleries.on('onBeforeOpen.lg', function(event) {
        $('#nav').css('display', 'none');   // Hide the navbar
    });
    // Actions to perform just before closing a gallery:
    galleries.on('onBeforeClose.lg', function(event) {
        $('#nav').css('display', 'block');   // Show the navbar
    });

});

function logout() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/logout', true);
    xhr.setRequestHeader('content-type',
                         'application/x-www-form-urlencoded;charset=UTF-8');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            ;
        }
    };
    xhr.send();
}
