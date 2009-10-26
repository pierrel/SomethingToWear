Couch = (function(){
    
    // return url for a given key value in our urls.json file. This contains
    // all the potentially changing URLs for the app in our convienient place
    // Do not use url_data; this should be private
    var url_data;
    var get_url_for = function(server_name) 
    {
        if (!url_data) {
            url_data = JSON.parse($.ajax({
                type: "GET",
                url: "urls.json",
                async: false, // blocks
                ifModified: true,
                dataType: 'json',
                failure: function() {
                    throw new Error("CouchDB::get_url_for returned an error");
                }
            }).responseText);
        }
        return url_data[server_name];
    };
    
    // called via Couch.url()
    var url = function()
    {
        return get_url_for('couchdb') + "/";
    };
    
    var view_url = function(view_name)
    {
        var host = get_url_for('couchdb');
        var views = get_url_for('views');
        if (!host || !views) {
            throw new Error("view_url: Couldn't retrieve host or view key");
        }
        return host + "/" + views + view_name;
    };
    
    var image_url = function()
    {
        var image;
        if (!(image = get_url_for('image'))) throw new Error("image_url: unknown key 'image'");
        return image;
    };
    
    var proxy_url = function()
    {
        var proxy;
        if (!(proxy = get_url_for('proxy'))) throw new Error("proxy_url: unknown key 'proxy");
        return proxy;
    };
    
    return {
        url: url,
        view_url: view_url,
        proxy_url: proxy_url,
        image_url: image_url
    };
})();

function couch(url) {
    return Couch.url() + url;
}

function couch_view(view_name) {
    return couch('_design/SomethingToWear/_view/' + view_name);
}

function couch_username(username) {
    return 'user-' + username;
}

function normal_username(couch_username) {
    split = couch_username.split('-');
    split.shift(); // the first element looks like "user", so remove it
    return split.join('-'); // join with dashes in case there were dashes in the actual username
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