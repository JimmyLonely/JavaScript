function search(objString, searchChar){
    var postions = new Array();
    var pos  = objString.indexOf(searchChar) ;

    while(pos > -1){
        postions.push(pos);
        pos = objString.indexOf(searchChar, pos + 1);
    }

    console.log(postions);
}

search('Hello World! jimmy only.', 'o');

