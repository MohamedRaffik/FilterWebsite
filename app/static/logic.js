function filter(filter_type) {
    if (filter_type == 'black_and_white') {
        ;
    }
    else if (filter_type == 'sepia') {
        ;
    }
    else if (filter_type == 'casper') {
        ;
    }
}

function upload(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(load_event) {
            var content = load_event.target.result;
            $('#old-img').attr('src', content);
            $('#new-img').attr('src', content);
        };
        // readAsDataURL represents the image as a base64 encoded string that
        // starts with the regexp 'data:*/*;base64,' so may need to remove:
        // var search_value = new RegExp('data:*/*;base64,');
        // console.log( content.substring(content.indexOf(',')+1) );
        reader.readAsDataURL(input.files[0]);
    }
}

function download() {
    var link = document.createElement('a');
    link.setAttribute('href', document.getElementById('new-img').src);
    link.setAttribute('download', 'filterx-download.jpg');
    document.body.appendChild(link);
    link.click();
    link.remove();
}
