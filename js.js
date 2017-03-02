var person1 = {
    toString: function(){
        return 'Jimmy';
    },

    toLocaleString: function(){
        return 'Jimmy';
    }
};

var person2 = {
    toString: function(){
        return 'Li';
    },

    toLocaleString: function(){
        return '李';
    }
};

var person = [person1, person2];
console.log(person);
console.log(person.toString());
console.log(person.valueOf());
console.log(person.toLocaleString());
