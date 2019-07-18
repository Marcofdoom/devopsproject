function getall() {
    let req = new XMLHttpRequest();
    req.onload = function () {
        let accountArray = JSON.parse(req.response);
        console.log(accountArray);    
    }   

    req.open('GET', 'http://51.140.121.39:8084/getAllAccounts');
    req.send();
}
