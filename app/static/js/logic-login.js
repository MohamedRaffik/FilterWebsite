function signin() {
    var cred = {
        "email": document.getElementById("signin-email").value,
        "password": document.getElementById("signin-password").value
    };
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/login', true);
    xhr.setRequestHeader('content-type',
                         'application/x-www-form-urlencoded;charset=UTF-8');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            if (xhr.responseText === 'none' || xhr.responseText === 'pass') {
                alert( (xhr.responseText === 'none') ?
                       'No account with this email.' : 'Incorrect password.');
                // Fail
            }
            else {
                window.location.href = xhr.responseURL;
                // Success
            }
        }
    };
    // Add time to URL to keep AJAX call unique and not cached by browser
    xhr.send('type=signin&email=' + cred['email'] + '&pass=' +
             cred['password'] + '&t=' + new Date().getTime());
}

function signup() {
    var cred = {
        "email": document.getElementById("signup-email").value,
        "username": document.getElementById("signup-name").value,
        "password": document.getElementById("signup-password").value,
        "confirm": document.getElementById("confirm-password").value
    };

    if (!valid_email(cred['email'])) {
        alert('Please enter a valid email.');
    }
    else if (cred['password'].length < 8) {
        alert('Password must be at least 8 characters long.');
    }
    else if (cred['password'] !== cred['confirm']) {
        alert('Passwords do not match.');
    }
    else {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/login', true);
        xhr.setRequestHeader('content-type',
                             'application/x-www-form-urlencoded;charset=UTF-8');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                if (xhr.responseURL === window.location.href) {
                    alert('This email is already associated with an account.');
                    // Fail
                }
                else {
                    window.location.href = xhr.responseURL;
                    // Success
                }
            }
        };
        // Add time to URL to keep AJAX call unique and not cached by browser
        xhr.send('type=signup&email=' + cred['email'] + '&user=' +
                 cred['username'] + '&pass=' + cred['password'] +
                 '&t=' + new Date().getTime());
    }
}

function valid_email(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
