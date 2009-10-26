function random_outfit() {
    shirt_rows = get_view('pieces_by_type', {key: 'shirt'})['rows'];
    pant_rows = get_view('pieces_by_type', {key: 'pants'})['rows'];
    shoes_rows = get_view('pieces_by_type', {key: 'shoes'})['rows'];
    
    shirts = $.map(shirt_rows, function(row) { return row['id']});
    pants = $.map(pant_rows, function(row) { return row['id']});
    shoes = $.map(shoes_rows, function(row) { return row['id']});
    
    random_pieces = {
        shirt: shirts[Math.floor(Math.random()*shirts.length)],
        pant: pants[Math.floor(Math.random()*pants.length)],
        shoes: shoes[Math.floor(Math.random()*shoes.length)]
    }

    return random_pieces;
}

function most_liked_pieces(type, limit) {
    params = {startkey: [couch_username(user()), type, ''], endkey: [couch_username(user()), type, 'Z'], group: true};
    rows = get_view('user_outfit_pieces_count', params)['rows']; // looks like [{key: [user, type, id], value: count }, ...]
    id_count = {}; // want to look like {id: count, ...}
    $.each(rows, function(i, row) {
       id_count[row['key'][2]] = row['value']; 
    });
        
    largests = [];
    for (i = 0; i < limit; i++) {
        max_number = 0;
        max_piece = '';
        
        for (id in id_count) {
            count = id_count[id];
            if(count >= max_number) {
                max_number = count;
                max_piece = id;
                id_count[id] = -1;
            }
        }
        if (max_piece != '') {
          largests.push(max_piece);  
        }
        
    }
    
    return largests;
}

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
    search_and_update_closet(context, 'shirt', 'shirts', [])
    
    // then pants
    search_and_update_closet(context, 'pants', 'pants', []);
    
    // then shoes
    search_and_update_closet(context, 'shoes', 'shoes', []);
}

function search_and_update_closet(context, piece_type, closet_part_name, attributes) {
        
    if (attributes.length == 0 || (attributes.length == 1 && attributes[0] == "")) { // empty array or array with one empty string
        limit = 15
        best_ids = most_liked_pieces(piece_type, limit);
        if (best_ids.length < limit) {
            rows = get_view('pieces_by_type', {key: piece_type, limit: (limit + best_ids.length)})['rows'];
            other_ids = $.map(rows, function(row) { return row['id'] });
            best_ids = unique(best_ids.concat(other_ids));
        }
        
        ids = best_ids.slice(0, limit);
        
        fill_closet_part(context, ids, closet_part_name);

    } else {
        
        keys = [];
        $.each(attributes, function(index, attr) {
            keys[index] = [piece_type, attr];
        });
        data = {keys: keys};
    
        $.post(couch_view('search'), JSON.stringify(data), function(msg, status) {
        
            // get unique ids
            ids = unique($.map(msg['rows'], function(row) { return row['id']}));
        
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

function closet_search(context, piece_type, closet_part_name) {
    return function(evt) {
        var value = $(this).attr('value');
        var attributes = arr_select(comma_separate(value), select_function);

        search_and_update_closet(context, piece_type, closet_part_name, attributes);
    }
}