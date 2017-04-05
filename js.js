
var div = document.getElementById('div');
var btn = document.getElementById('button');
var text = document.getElementById('text');

eventUtil.addHandler(btn, 'custom', function (event) {
    console.log('custom.');
})


//var event = document.createEvent('MouseEvent');