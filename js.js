var me = [1, 2, 3, 4, 5, 6];

var sum = me.reduce(function (pre, cur, index, arry) {
    return pre + cur;
}, 21);

console.log(sum);