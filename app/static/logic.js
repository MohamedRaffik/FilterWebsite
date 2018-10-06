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
            $('#old-img').attr('src', load_event.target.result);
        };
        reader.readAsDataURL(input.files[0]);
        //var old_img = document.getElementById('old-img');
        //old_img.height = 300;
        //old_img.width = 300;
    }
}

function download() {
    ;
}
