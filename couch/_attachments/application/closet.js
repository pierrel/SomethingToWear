function fill_closet_part(context, ids, part_name) {
    // empty first closet
    $('#' + part_name).empty();
    
    $.each(ids, function(i, id) {
        context.partial('templates/closet_piece.template', {type: part_name, id: id}, function(rendered) {
            $('#' + part_name).append(rendered);
            $('.piece').draggable({helper: 'clone'});
        });
    });
    
    //find out part width
    part_width = 200;
    if (part_name == 'shoes') {
        part_width = 210;
    } else if (part_name == 'shirts') {
        part_width = 150;
    } else if (part_name == 'pants') {
        part_width = 100;
    }
    
    $('#' + part_name).width('' + ids.length*part_width + 'px');
    
}

function fill_closet(context) {
    
    // first the shirts
    $.get(Couch.view_url('pieces_by_type'), {'key':"\"shirt\""}, function(data, textStatus) {
        ids = $.map(data['rows'], function(row) {return row['id'];});
        
        fill_closet_part(context, ids, 'shirts');
        
    }, "json");
    
    // then pants
    $.get(Couch.view_url('pieces_by_type'), {'key':"\"pants\""}, function(data, textStatus) {
        ids = $.map(data['rows'], function(row) {return row['id'];});
        
        fill_closet_part(context, ids, 'pants');        
        
    }, "json");
    
    // then shoes
    $.get(Couch.view_url('pieces_by_type'), {'key':"\"shoes\""}, function(data, textStatus) {
        ids = $.map(data['rows'], function(row) {return row['id'];});
        
        fill_closet_part(context, ids, 'shoes');
        
    }, "json");
}

function search_and_update_closet(context, piece_type, closet_part_name, attributes) {
        
    if (attributes.length == 0 || (attributes.length == 1 && attributes[0] == "")) { // empty array or array with one empty string
        $.get(Couch.view_url('pieces_by_type'), {'key':"\"" + piece_type + "\""}, function(data, textStatus) {
            ids = $.map(data['rows'], function(row) {return row['id'];});

            fill_closet_part(context, ids, closet_part_name);

        }, "json");
    } else {
        
        keys = [];
        $.each(attributes, function(index, attr) {
            keys[index] = [piece_type, attr];
        });
        data = {keys: keys};
    
        $.post(Couch.view_url('search'), JSON.stringify(data), function(msg, status) {
        
            // get unique ids
            ids = unique($.map(msg['rows'], function(row) { return row['id'];}));
        
            // make hash of id -> list of searched tags
            id_attrs = {};
            for(index in msg['rows']) {
                tag = msg['rows'][index]['key'][1];
                id = msg['rows'][index]['id'];
                if (id in id_attrs) {
                       id_attrs[id].push(tag);
                } else {
                       id_attrs[id] = [];
                       id_attrs[id].push(tag);
                }
            }
                        
            var matching_ids = [];
            for (index in ids) {
                id = ids[index];
                if (id_attrs[id].length == attributes.length) { // then has all attributes
                    matching_ids.push(id);
                }
            }
                        
            fill_closet_part(context, matching_ids, closet_part_name);
        }, 'json');
    }    
}
