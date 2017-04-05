
var div = document.querySelector('#myDiv');
var myMenu = document.querySelector('#myMenu');

window.addEventListener('contextmenu', function (event) {
    event.preventDefault();
    myMenu.style.visibility = 'visible';
}, false);

document.addEventListener('click', function () {
    myMenu.style.visibility = 'hidden';
}, false);

window.addEventListener('beforeunload', function (event) {
    var message = 'Are you sure to leave the website ?'
    event.returnValue = message;
    return message;
}, false);