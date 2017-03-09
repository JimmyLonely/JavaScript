

function hasPlugin(name) {
    name = name.toLowerCase();

    for (var index = 0; index < navigator.plugins.length; index++) {
        var plugin = navigator.plugins[index];
        if (plugin.name.toLowerCase().indexOf(name) > -1) {
            return true
        }

    }

    return false;
}


