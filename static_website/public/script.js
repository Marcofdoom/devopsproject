function getall() {
    console.log("getAll");

    let req = new XMLHttpRequest();
    req.onload = function () {
        let accountArray = JSON.parse(req.response);
        console.log(accountArray);    
    }   

    req.open('GET', 'http://51.140.121.39:8084/getAllAccounts');
    req.send();
}

function create() {
    let account = {
    firstName: document.getElementById("first_name").value,
    lastName: document.getElementById("last_name").value,
    }

    let test = JSON.stringify(account);
console.log(account);
console.log(test);

    let req = new XMLHttpRequest();
    req.onload = function () {
         console.log("created");
    }

    req.open('POST', 'http://51.140.121.39:8084/addAccount');
    req.send(JSON.stringify(account));
}
