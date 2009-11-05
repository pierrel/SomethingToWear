function user() {
    return $.cookie('somethingtowear-username');
}

function store_cookie(username, couchauth) {
    $.cookie('somethingtowear-username', username, { expires: 10 });
    $.cookie('somethingtowear-couchauth', couchauth, { expires: 10 });
}

function get_cookie() {
    return {username: $.cookie('somethingtowear-username'), couchauth: $.cookie('somethingtowear-couchauth')};
}

function clear_cookie() {
    $.cookie('somethingtowear-username', null);
    $.cookie('somethingtowear-couchauth', null);
}
