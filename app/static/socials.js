// Uploads b64_string as an image to Cloudinary, and then invokes callback
// with the argument as the url of the uploaded image
function upload_to_cloudinary(b64_string, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://api.cloudinary.com/v1_1/filterx/upload', true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);
            callback(response.secure_url);
        }
    };
    var form_data = new FormData();
    form_data.append('upload_preset', 'unsigned-default');
    form_data.append('tags', 'browser_upload');
    form_data.append('file', b64_string);
    xhr.send(form_data);
}

function share_to(website) {
    if (document.getElementById('new-img').className == 'default') {
        alert('Upload an image before clicking the share button!');
        return false;
    }
    var callback;
    if (website == 'facebook') {
        callback = function(url) {
            var link = document.createElement('a');
            link.href = 'https://www.facebook.com/sharer/sharer.php?u=' +
                encodeURIComponent(url);
            link.target = '_blank';
            link.click();
        };
    }
    else if (website == 'twitter') {
        callback = function(url) {
            console.log('Twitter Share: ' + url);
        };
    }
    upload_to_cloudinary(document.getElementById('new-img').src, callback);
    // Allow anchor tag's href to follow through after function call
    return true;
}
