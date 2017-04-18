var jsUtil = {
    getCookies: function () {
        var cookies = document.cookie.trim().split(';');
        var keyIndex = -1;

        var result = cookies.map(function (item, index, array) {
            keyIndex = item.indexOf('=');
            return {
                key: item.substring(0, keyIndex),
                value: item.substring(keyIndex+1)
            };

        })

        return result;
    }
}