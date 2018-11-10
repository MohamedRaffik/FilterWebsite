function upload_to_cloudinary(b64_string) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://api.cloudinary.com/v1_1/filterx/upload', true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);
            console.log('Secure URL: ' + response.secure_url);
            console.log('Public ID: ' + response.public_id);
            // Create a thumbnail of the uploaded image, with 150px width
            var tokens = response.secure_url.split('/');
            tokens.splice(-2, 0, 'w_150,c_scale');
            console.log('Thumbnail URL: ' + tokens.join('/'));
        }
    };
    var form_data = new FormData();
    form_data.append('upload_preset', 'unsigned-default');
    form_data.append('tags', 'browser_upload');
    form_data.append('file', b64_string);
    xhr.send(form_data);
}

function share(to_website) {
    if (document.getElementById('new-img').className == 'default') {
        alert('Upload an image before clicking the share button!');
        return false;
    }
    upload_to_cloudinary(document.getElementById('new-img').src);
    if (to_website == 'facebook') {
        console.log('Facebook Share');
    }
    else if (to_website == 'twitter') {
        console.log('Twitter Share');
    }
    // Allow anchor tag's href to follow through after function call
    return true;
}
