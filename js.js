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

sayHello();