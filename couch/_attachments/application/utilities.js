function comma_separate(string) {
    return $.map(string.split(','), function(elt, index) {
        return $.trim(elt);
    });
};

function unique(arr) {
    new_arr = [];
    seen = {};
    for(index in arr) {
        if (seen[arr[index]] != 1) {
            seen[arr[index]] = 1;
            new_arr.push(arr[index]);
        }
    }
    return new_arr;
}

function arr_select(arr, bool_function) {
    var new_arr = [];
    $.each(arr, function(index, elt) {
        if (bool_function(elt)) {
            new_arr.push(elt);
        }
    });
    return new_arr;
}