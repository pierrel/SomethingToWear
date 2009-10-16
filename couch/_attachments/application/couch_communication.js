var couch_url = 'http://127.0.0.1:5984/wear';
var proxy_url = 'http://127.0.0.1:4567';

function couch(url) {
    return couch_url + '/' + url;
}

function couch_view(view_name) {
    return couch('_design/SomethingToWear/_view/' + view_name);
}

function couch_user_url(username) {
    return couch('user-' + username);
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

