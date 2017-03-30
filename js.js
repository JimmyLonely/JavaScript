

var btn = document.querySelector('button');

window.addEventListener('load', function (event) {
    var image = document.createElement('img');

    document.body.appendChild(image);
    image.src = '/asset/img/png.png';
    image.addEventListener('load', function (event) {
        console.log(event.target);
    }, false);
}, false);

window.addEventListener('load', function (event) {
    var js = document.createElement('script');
    js.addEventListener('load', function (event) {
        console.log(event.target);
    }, false);

    document.body.appendChild(js);
    js.src = '/asset/js/example.js';
}, false);

window.addEventListener('load', function (event) {
    var link = document.createElement('link');
    link.type = "text/css";
    link.rel = "stylesheet";

    link.addEventListener('load', function (event) {
        console.log(event.target);
    }, false);

    document.querySelector('head').appendChild(link);
    link.href = '/asset/css/example.css';
}, false);