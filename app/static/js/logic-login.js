function signin() {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/login', true);
    xhr.setRequestHeader('content-type',
                         'application/x-www-form-urlencoded;charset=UTF-8');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log(xhr.responseURL);
                window.location.href = xhr.responseURL;
            }
            else if (xhr.status === 299)
                alert('Incorrect password.');
            else if (xhr.status === 298)
                alert('No account with this email.');
        }
    };
    xhr.send('type=signin&email='+document.getElementById('signin-email').value+
             '&pass='+document.getElementById('signin-password').value);
}

function signup() {
    var cred = {
        'email': document.getElementById('signup-email').value,
        'username': document.getElementById('signup-name').value,
        'password': document.getElementById('signup-password').value,
        'confirm': document.getElementById('confirm-password').value
    };

    if (!valid_email(cred['email']))
        alert('Please enter a valid email.');
    else if (cred['password'].length < 8)
        alert('Password must be at least 8 characters long.');
    else if (cred['password'] !== cred['confirm'])
        alert('Passwords do not match.');
    else {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/login', true);
        xhr.setRequestHeader('content-type',
                             'application/x-www-form-urlencoded;charset=UTF-8');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200)
                    
                else if (xhr.status === 299)
                    alert('Account with this email already exists.');
            }
        };
        xhr.send('type=signup&pass='+cred['password']+'&user='+
                 cred['username']+'&email='+cred['email']);
    }
}

function valid_email(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
