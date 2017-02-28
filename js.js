function sayHello() {
    var i = 12;

    switch (i) {
        case 1:
            console.log(1);
            break;
        case "12":
            console.log(12);
        default:
            console.log('Default');
    }
}

function doAdd() {
    'use strict'
    switch (arguments.length) {
        case 1:
            console.log(arguments[0]);
            break;
        case 2:
            console.log(arguments[0] + arguments[1]);
            break;
        case 3:
            console.log(arguments[0] + arguments[1] + arguments[2]);
            break;
        case 4:
            console.log(arguments[0] + arguments[1] + arguments[2] + arguments[3]);
            break;
    }
}