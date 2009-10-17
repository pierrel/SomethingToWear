function user() {
    return $.cookie('somethingtowear');
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

var point_number = 0;  // For adding clothes to the db
var point_pixels = []; //

var app = $.sammy(function() {
    this.element_selector = '#main-wrapper';
    this.use(Sammy.Template);
    
    this.get('#/', function(context) {
        
        // check that the user is logged in
        if($.cookie('somethingtowear') == null) {
            context.redirect('#/user/login');
            return false;
        }
        
        context.partial('templates/main.html', {}, function(rendered) {
            $('#main-wrapper').html(rendered);
            
            
            
            $('#main-wrapper').ready(function() {
                Mannequin.draw_random_outfit();
                fill_closet(context);
                
                $('#dress').click(function(evt) {
                    Mannequin.complete_outfit();
                })


                // set up mannequin-canvas interaction
                Mannequin.element().droppable({
                    drop: function(evt, ui) {
                        draggable_info = ui.draggable.attr('id').split("-");
                        type = draggable_info[0];
                        id = draggable_info[1];

                        if (type == 'shirts') {
                            Mannequin.shirt_id = id;
                        } else if (type == 'pants') {
                            Mannequin.pant_id = id;
                        } else if (type == 'shoes') {
                            Mannequin.shoes_id = id;
                        }

                        Mannequin.draw();
                    },
                    accept: '.piece',
                    activeClass: 'mannequin-canvas-dragging'
                });
                
                Mannequin.element().click(function(evt) {
                    piece_over = Mannequin.piece_mousing_over(evt);
                    
                    if (piece == 'shoes') {
                        Mannequin.shoes_id = '';
                        Mannequin.draw();
                    } else if (piece == 'shirt') {
                        Mannequin.shirt_id = '';
                        Mannequin.draw();
                    } else if (piece == 'pants') {
                        Mannequin.pant_id = '';
                        Mannequin.draw();
                    }
                })
                
                Mannequin.element().mousemove(function(evt) {
                    piece = Mannequin.piece_mousing_over(evt);
                    if(piece) {
                        if (piece != Mannequin.last_piece_hover) {
                            Mannequin.draw(piece);
                            Mannequin.last_piece_hover = piece;
                        }
                    }
                });
                
                // outfit saving stuff
                $('#like-link').click(function(evt) {
                    Mannequin.like_current_outfit($.cookie('somethingtowear'));
                });

                // search stuff
                $('.search').click(function(evt) {
                    this.select();
                });

                select_function = function(elt) { return elt != "" && elt != "and"}; // use this to select only non-empty strings as attributes
                $('#shirt-search').keyup(function(evt) {
                    var value = $(this).attr('value');
                    var attributes = arr_select(comma_separate(value), select_function);

                    search_and_update_closet(context, 'shirt', 'shirts', attributes);
                });

                $('#pants-search').keyup(function(evt) {
                    var value = $(this).attr('value');
                    var attributes = arr_select(comma_separate(value), select_function);

                    search_and_update_closet(context, 'pants', 'pants', attributes);
                });

                $('#shoes-search').keyup(function(evt) {
                    var value = $(this).attr('value');
                    var attributes = arr_select(comma_separate(value), select_function);

                    search_and_update_closet(context, 'shoes', 'shoes', attributes);
                });
            });
            
            
        });        
        
    });
    
    this.get('#/user/login', function(context) {
        context.partial('templates/login.html', {}, function(rendered) {
           $('#main-wrapper').html(rendered); 
           
           $('#login-form').ajaxForm(function() { // for some reason Sammy's post isn't working so hijack the form
                username = $('#username').val();
                password = $('#password').crypt({method: 'sha1'});

                if (user_authentic(username, password)) {
                    
                  $.cookie('somethingtowear', username, { expires: 10 });
                  context.redirect('#/');
                } else {
                  alert('username and password did not match');
                }
           });
        });
    });
    
    this.get('#/user/logout', function(context) {
        $.cookie('somethingtowear', null);
        context.redirect('#/user/login');
    });
    
    this.get('#/user/new', function(context) {
        context.partial('templates/new_user.html', {}, function(rendered) {
           $('#main-wrapper').html(rendered);
           
           $('#new-user-form').ajaxForm(function() {
               password = $('#password').val();
               password_check = $('#password_check').val();
               encrypted = $('#password').crypt({method: 'sha1'});
               username = $('#username').val();
               
               if (password.length == 0) {
                   alert('come on, put in a password.');
               } else if (password != password_check) {
                   alert('passwords do not match');
               } else if (username.length == 0) {
                   alert('come on, put in a username');
               } else {
                   new_user(username, encrypted, function(success_msg) {
                       $.cookie('somethingtowear', username, { expires: 10 });

                       context.redirect('#/');
                   },
                   function(error_msg) {                       
                       if (JSON.parse(error_msg['responseText'])['error'] == 'conflict') {
                           alert('Username already taken, sorry. Please try another.');
                       }
                   });
               }
           });
        });
    });    
    
    var id = '';
    this.get('#/piece/new', function(context) {
        form = $('#piece-image-upload-form');
        form.ajaxForm(null);
        new_piece(
            {}, 
            function(msg) {
                // show/hide the correct elements
                $('#piece-preview').hide();
                $('#pick-points-instructions').hide();
                $('#describe-piece-form').hide();
                $('#piece-image-upload').show();
                $('#all-done').hide();
                
                $('#add-clothes').dialog('open');
                
                $('#new-piece-id').attr('value', msg.id);
                $('#new-piece-revision').attr('value', msg.rev);
                
                id = msg.id;
                
                form.ajaxForm(function() {
                    context.redirect('#/piece/describe');
                });
                
            },
            function(msg) {
                alert('error: ' + JSON.stringify(msg));
            });
    });
    
    this.get('#/piece/describe', function(context) {
        // show/hide the correct elements
        $('#piece-preview').show();
        $('#pick-points-instructions').hide();
        $('#describe-piece-form').show();
        $('#piece-image-upload').hide();
        $('#all-done').hide();
        
        $('#add-clothes').dialog('open');
        
        //make sure the canvas isn't doing anything with mouse clicks
        $('#piece-canvas').click(null);
        
        // draw the piece for reference
        draw_new_piece(piece_image_url(id), 'piece-canvas');
                
        $('#describe-piece-form').ajaxForm(function() {
            //do stuff
            data = {};
            data['colors'] = comma_separate($('#colors').val());
            data['styles'] = comma_separate($('#styles').val());
            data['pattern'] = $('#pattern').val();
            data['material'] = $('#material').val();
            data['name'] = $('#name').val();
            data['type'] = $('#place :selected').val();
            
            update_piece(id, data, function(msg) {
                context.redirect('#/piece/pick_points/');
            });
        })
        
    });
    
    this.post('#/piece/describe', function(context) {

    });
    
    this.get('#/piece/pick_points/', function(context) {
        // show/hide the correct elements
        $('#piece-preview').show();
        $('#pick-points-instructions').show();
        $('#pick-points-instructions-shirt').hide();
        $('#pick-points-instructions-pants').hide();
        $('#pick-points-instructions-shoes').hide();
        $('#describe-piece-form').hide();
        $('#piece-image-upload').hide();
        $('#all-done').hide();
        
        // draw the image onto the canvas
        draw_new_piece(piece_image_url(id), 'piece-canvas');
        
        // get the piece information
        piece = get_piece(id);
        
        // set the listener on the canvas
        canvas = $('#piece-canvas');
        point_number = 0; //reset point number
        point_pixels = []; //reset pixels
        if (piece['type'] == 'shirt') {
            max_points = 3;
            $('#pick-points-instructions-shirt').show();
        } else if (piece['type'] == 'pants') {
            max_points = 2;
            $('#pick-points-instructions-pants').show();
        } else if (piece['type'] == 'shoes') {
            max_points = 2;
            $('#pick-points-instructions-shoes').show();
        }
        canvas.click(function (evt) {
            // selection is off by a few pixels, not sure why
            // 'add-clothes' element seems to give a closer position.
            // anyway, calculate the absolute position
            abs_off = absolute_offset($('#piece-preview')); 

            offsetX = evt.pageX - abs_off[0];
            offsetY = evt.pageY - abs_off[1] + 10; // not sure why it seems to be off by about 10

            // translate it to the original size of the image
            image_offsetX = offsetX * piece_width_translation_ratio;
            image_offsetY = offsetY * piece_height_translation_ratio;

            // put it in the array to be sent off
            point_pixels[point_number] = [image_offsetX, image_offsetY];

            if (point_number < max_points-1) {
                document.getElementById('piece-canvas').getContext('2d').strokeRect(offsetX - 5, offsetY - 5, 10, 10);
            } else { // it's equal to 2, don't draw just send
                data = {};
                if (piece['type'] == 'shirt') {
                    data['left_shoulder'] = point_pixels[0];
                    data['right_shoulder'] = point_pixels[1];
                    data['waist'] = point_pixels[2];
                } else if (piece['type'] == 'pants') {
                    data['left_waist'] = point_pixels[0];
                    data['right_waist'] = point_pixels[1];
                } else if (piece['type'] == 'shoes') {
                    data['left_ankle'] = point_pixels[0];
                    data['right_ankle'] = point_pixels[1];
                }
                update_piece(
                    id,
                   data,
                    function(msg) {
                        // show/hide the correct elements
                        $('#piece-preview').hide();
                        $('#pick-points-instructions').hide();
                        $('#describe-piece-form').hide();
                        $('#piece-image-upload').hide();
                        $('#all-done').show();


                        window.setTimeout('$(\'#add-clothes\').dialog(\'close\')', 2000);
                        context.redirect('#/');
                    }
                );
            }
            point_number += 1;
        });
        
        $('#add-clothes').dialog('open');
    });    
    
});
   
$(function() {
    app.run('#/');
});
    


