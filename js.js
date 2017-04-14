

var form = document.querySelector('div');
var btn = document.querySelector('#btn');

btn.addEventListener('click', function (event) {
    alert('btn is click');
}, false);


form.addEventListener('click', function (event) {
    console.log('form  is clicked');
    if (event.target != btn) {
        btn.click();
        event.preventDefault();
    }
}, true);