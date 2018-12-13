function signin() {
    fetch('/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            "email": document.getElementById("signin-email").value,
            "pass": document.getElementById("signin-password").value,
            "type": "signin",
        }),
        redirect: 'follow'
    }).then(res => {
        if (res.status === 299) { alert('Incorrect password'); }
        else if (res.status === 298) { alert('No account with this email'); }
        else { window.location.href = res.url; }
    }).catch(error => console.error(error));
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
        fetch('/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "pass": cred['password'],
                "user": cred['username'],
                "email": cred['email'],
                "type": "signup"
            }),
            redirect: 'follow'
        }).then(res => {
            if (res.status === 299) { alert('This email is already associated with an account.'); }
            else { window.location.href = res.url; }
        }).catch(error => console.error(error));
    }
}

function valid_email(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
