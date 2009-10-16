Couch = (function(){
    
    // return url for a given key value in our urls.json file. This contains
    // all the potentially changing URLs for the app in our convienient place
    // Do not use url_data; this should be private
    var url_data;
    var get_url_for = function(server_name) 
    {
        if (!url_data) {
            $.ajax({
                url: "urls.json",
                async: false,
                ifModified: true,
                dataType: 'json',
                success: function(data) {
                     url_data = data;
                },
                failure: function() {
                    throw new Error("CouchDB::get_url_for returned an error");
                }
            });
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

function get_piece(id) {
    $.ajax({
        url: Couch.url() + id,
        dataType: 'json',
        async: false,
        success: function(data) { return data; },
        error: function(msg) { throw new Error("get_piece failed"); }
    });
}

function update_piece(id, data, success_func) {
    //get the revision number
    $.ajax({
        url: Couch.url() + id,
        dataType: 'json',
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
                url: Couch.url() + id,
                dataType: 'json',
                data: JSON.stringify(reved_data),
                success: success_func,
                error: function(msg) { throw new Error('error, could not update ' + id + ": '" + JSON.stringify(msg) + "'"); }
            });
        },
        error: function(msg) { throw new Error('Error updating document ' + id + ": '" + JSON.stringify(msg) + "'"); }
    });
}