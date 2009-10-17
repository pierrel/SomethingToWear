var couch_url = 'http://127.0.0.1:5984/wear';
var proxy_url = 'http://127.0.0.1:4567';

function couch(url) {
    return couch_url + '/' + url;
}

function couch_view(view_name) {
    return couch('_design/SomethingToWear/_view/' + view_name);
}

function couch_username(username) {
    return 'user-' + username;
}

function normal_username(couch_username) {
    split = couch_username.split('-');
    user_dash = split.shift();
    return split.join('-');
}

function couch_user_url(username) {
    return couch(couch_username(username));
}

function piece_image_url(id) {
    return couch(id) + "/image";
}

function new_piece(data, success_func, error_func) {
    typed_data = data;
    typed_data['doc_type'] = 'piece';
    $.ajax({
        type: "POST",
        url: couch(''),
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify(typed_data),
        success: success_func,
        error: error_func
    });
}

function new_outfit(shirt_id, pants_id, shoes_id, username, success_func) {
    data = {
        shirt_id: shirt_id,
        pants_id: pants_id,
        shoes_id: shoes_id,
        doc_type: 'outfit',
        liked_by: [couch_username(username)]};
    $.ajax({
        type: "POST",
        url: couch(''),
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: success_func
    })
}

function new_user(username, password, success_func, error_func) {
    data = {password: password, doc_type: 'user'};
    $.ajax({
        type: "PUT",
        url: couch_user_url(username),
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: success_func,
        error: error_func
    });
}

function user_authentic(username, password) {
    doc = get_piece('user-' + username);
    return doc['password'] == password;
}

function get_piece(id) {
    to_return = null;
    $.ajax({
        type: "GET",
        url: couch(id),
        dataType: 'json',
        async: false,
        success: function(msg) {
            to_return = msg;
        },
        error: function(msg) {
            alert('There was an error retrieving ' + id);
        }
    });
    return to_return;
}

// MUST BE CHANGED TO HANDLE CONFLICTS
function update_piece(id, data, success_func) {
    //get the revision number
    $.ajax({
        type: "GET",
        url: couch(id),
        dataType: 'json',
        contentType: 'application/json',
        success: function(msg) {            
            // get the old attributes
            reved_data = msg;
            
            // replace any that should be updated
            $.each(data, function(key, value) {
                reved_data[key] = value;
            });
            
            // Send the updated doc
            $.ajax({
                type: "PUT",
                url: couch(id),
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify(reved_data),
                success: success_func,
                error: function(msg) {
                    alert('error, could not update ' + id + ": '" + JSON.stringify(msg) + "'");
                }
            })
        },
        error: function(msg) {
            alert('Error updating document ' + id + ": '" + JSON.stringify(msg) + "'");
        }
    });
}

function get_view(view_name, params) {
    var to_return = null;
    var url_params = [];
    
    for (key in params) {
        url_params.push(key + '=' + JSON.stringify(params[key]));
    }
    url_params = url_params.join('&');
    
    $.ajax({
        type: "GET",
        url: couch_view(view_name),
        data: url_params,
        dataType: 'json',
        async: false,
        success: function(msg) {
            to_return = msg;
        },
        error: function(msg) {
            alert('There was an error getting information for view ' + view_name);
            alert('error: ' + JSON.stringify(msg));
        }
    });
    return to_return;
}