function random_outfit() {
    shirt_rows = get_view('pieces_by_type', {key: 'shirt', reduce: false})['rows'];
    pant_rows = get_view('pieces_by_type', {key: 'pants', reduce: false})['rows'];
    shoes_rows = get_view('pieces_by_type', {key: 'shoes', reduce: false})['rows'];
    
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
    rows = get_view('user_outfit_pieces_count', params)['rows']; // looks like [{'key': [user, type, id], 'value': count }, ...]
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

function piece_to_closet_part(context, ids, part_name) {
    var transform = {shirts: 'shirt_id', pants: 'pant_id', shoes: 'shoes_id'};
    
    // just return if there are no more ids
    if (ids.length == 0) {
        return true;
    }
    
    var id = ids.pop();
    context.partial('templates/closet_piece.template', {type: part_name, id: id}, function(id, ids, part_name) {
        return function(rendered) {
            $('#' + part_name).append(rendered);

            $('#' + part_name + '-' + id).click(function(evt) {
                // get the previous part for removing the background
                old_id = Mannequin[transform[part_name]];
        
                // add the new piece to the mannequin
                Mannequin[transform[part_name]] = id;
                Mannequin.draw();
        
                // change the background to show it's selected
                highlight_piece(part_name, id);
        
                // remove the old piece's background
                if (old_id != '' && $('#' + part_name + '-' + old_id)) {
                    unhighlight_piece(part_name, old_id);
                }
            });
        
            // grab the correct image and replace the loading icon
            // when the image is loaded
            var image = new Image();
            image.onload = function(part_name, id, ids) {
                return function() {
                    var piece_image = $('#' + part_name + '-' + id);
                    // if the piece is in the mannequin then highlight it
                    if (Mannequin[transform[part_name]] == id) {
                        highlight_piece(part_name, id);
                    }
                
                    // change the width of the part
                    var part = $('#' + part_name);
                    part.width((part.width() + parseInt(piece_image.css('width')) + 7) + 'px');
                
                    // call fill_closet_part on the rest of the ids
                    piece_to_closet_part(context, ids, part_name);
                };
            }(part_name, id, ids);
            image.src = piece_image_url(id);     
        }   
    }(id, ids, part_name));    
}

function fill_closet_part(context, ids, part_name) {
    
    // empty closet first 
    $('#' + part_name).empty();
    
    // change the width
    $('#' + part_name).width('0px');
    
    // the fill
    piece_to_closet_part(context, ids, part_name);
    
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
        limit = 15;
        rows = get_view('pieces_by_type', {key: piece_type, limit: limit, reduce: false})['rows'];
        ids = $.map(rows, function(row) { return row['id'] });
        
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

function highlight_piece(part, id) {
    $('#' + part + '-' + id).addClass('highlighted');
}

function unhighlight_piece(part, id) {
    $('#' + part + '-' + id).removeClass('highlighted');
}

function closet_search(context, piece_type, closet_part_name) {
    return function(evt) {
        var value = $(this).attr('value');
        var attributes = arr_select(comma_separate(value), select_function);

        search_and_update_closet(context, piece_type, closet_part_name, attributes);
    }
}