

function customerXHR() {

};


function createXHR() {
    if (typeof XMLHttpRequest != 'undefined') {
        return new XMLHttpRequest();
    } else {
        return new customerXHR();
    }
}

// overwrite function
function createXHRLazy() {
    if (typeof XMLHttpRequest != 'undefined') {
        createXHRLazyFunction = function () {
            return new XMLHttpRequest();
        }
    } else {
        createXHRLazyFunction = function () {
            return new customerXHR();
        }
    }

    return createXHRLazyFunction();
}


// closure
var createXHRClosure = (function () {
    if (typeof XMLHttpRequest != 'undefined') {
        return function () {
            return new XMLHttpRequest();
        }
    } else {
        return function () {
            return new customerXHR();
        }
    }
})();


