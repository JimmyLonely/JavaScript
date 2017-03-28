
function traversalStyle(id) {
    id = id.indexOf('#') == 0 ? id : '#' + id;
    var element = document.querySelector(id);

    var prop,
        value,
        i,
        len = element.style.length;

    for (i = 0, len = element.style.length; i < len; i++) {
        prop = element.style[i];
        value = element.style.getPropertyValue(prop);
        console.log(prop + ': ' + value);
    }
};