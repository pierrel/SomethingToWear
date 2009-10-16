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
    $.get(couch_view('pieces_by_type'), {'key':"\"shirt\""}, function(data, textStatus) {
        ids = $.map(data['rows'], function(row) {return row['id']});
        
        fill_closet_part(context, ids, 'shirts');
        
    }, "json");
    
    // then pants
    $.get(couch_view('pieces_by_type'), {'key':"\"pants\""}, function(data, textStatus) {
        ids = $.map(data['rows'], function(row) {return row['id']});
        
        fill_closet_part(context, ids, 'pants');        
        
    }, "json");
    
    // then shoes
    $.get(couch_view('pieces_by_type'), {'key':"\"shoes\""}, function(data, textStatus) {
        ids = $.map(data['rows'], function(row) {return row['id']});
        
        fill_closet_part(context, ids, 'shoes');
        
    }, "json");
}

function search_and_update_closet(context, piece_type, closet_part_name, attributes) {
        
    if (attributes.length == 0 || (attributes.length == 1 && attributes[0] == "")) { // empty array or array with one empty string
        $.get(couch_view('pieces_by_type'), {'key':"\"" + piece_type + "\""}, function(data, textStatus) {
            ids = $.map(data['rows'], function(row) {return row['id']});

            fill_closet_part(context, ids, closet_part_name);

        }, "json");
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

var point_number = 0;  // For adding clothes to the db
var point_pixels = []; //

var app = $.sammy(function() { with(this) {
    element_selector = '#main';
    
    get('#/', function() { with(this) {
        var context = this;
        
        Mannequin.shirt_id = '98a5df0ced33d5fa891b464926a5539c';
        Mannequin.pant_id = '4ab8eb6901ee17def7dc670dcc4ffdaf';
        Mannequin.shoes_id = '18170179a9ce4ebcab91979881386f4c';
        
        // check that the user is logged in
        if($.cookie('somethingtowear') == null) {
            redirect('#/user/login');
        }
        
        partial('templates/main.html', {}, function(rendered) {
            $('#body').html(rendered);
            
            
            
            $('#main').ready(function() {
                Mannequin.draw();
                fill_closet(context);


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
                    shirt = Mannequin.shirt_position;
                    pant = Mannequin.pant_position;
                    shoes = Mannequin.shoes_position;

                    div_offset = absolute_offset($('#mannequin-canvas'));

                    click_x = evt.pageX - div_offset[0] + 200; // again some crazy error, not sure but this seems to work
                    click_y = evt.pageY - div_offset[1];

                    // to remove
                    context = document.getElementById(Mannequin.element_id).getContext('2d');

                    if (click_x > shoes['min_x'] && click_x < shoes['max_x'] && click_y > shoes['min_y'] && click_y < shoes['max_y']) {
                        Mannequin.shoes_id = '';
                        Mannequin.draw();
                    } else if (click_x > shirt['min_x'] && click_x < shirt['max_x'] && click_y > shirt['min_y'] && click_y < shirt['max_y']) {
                        Mannequin.shirt_id = '';
                        Mannequin.draw();
                    } else if (click_x > pant['min_x'] && click_x < pant['max_x'] && click_y > pant['min_y'] && click_y < pant['max_y']) {
                        Mannequin.pant_id = '';
                        Mannequin.draw();
                    }
                })
                



                // search stuff
                $('.search').click(function(evt) {
                    this.select();
                });

                select_function = function(elt) { return elt != "" }; // use this to select only non-empty strings as attributes
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
        
    }});
    
    get('#/user/login', function() { with(this) {
        partial('templates/login.html', {}, function(rendered) {
           $('#body').html(rendered); 
           
           $('#login-button').click(function() {
              username = $('#username').val();
              password = $('#password').crypt({method: 'sha1'});
              
              if (user_authentic(username, password)) {
                  $.cookie('somethingtowear', username, { expires: 10 });
                  redirect('#/');
              } else {
                  alert('username and password did not match');
              }
           });
        });
    }});
    
    get('#/user/logout', function() {with (this) {
        $.cookie('somethingtowear', null);
        redirect('#/user/login');
    }});
    
    get('#/user/new', function() { with(this) {
        partial('templates/new_user.html', {}, function(rendered) {
           $('#body').html(rendered);
           
           $('#new-user-button').click(function() {
               password = $('#password').val();
               password_check = $('#password_check').val();
               username = $('#username').val();
               
               if (password.length == 0) {
                   alert('come on, put in a password.');
               } else if (password != password_check) {
                   alert('passwords do not match');
               } else if (username.length == 0) {
                   alert('come on, put in a username');
               } else {
                   alert('all ok')
                   encrypted = $().crypt({method: 'sha1', source: password});
                   alert('encrypted ' + encrypted);
                   alert('user ' + username);
                   new_user(username, encrypted, function(success_msg) {
                       $.cookie('somethingtowear', username, { expires: 10 });

                       redirect('#/');
                   },
                   function(error_msg) {
                       if (error_msg['error'] == 'conflict') {
                           alert('Username already taken, sorry. Please try another.');
                       }
                   });
               }
           });
        });
    }});    
    
    
    
    
    
    
    get('#/rate', function() { with(this) {
        $("#fashion").dialog('open');
    }});
        
    get('#/piece/new', function() { with(this) {
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
                
                form.ajaxForm(function() {
                    redirect('#/piece/describe/' + msg.id);
                });
                
            },
            function(msg) {
                alert('error: ' + JSON.stringify(msg));
            });
    }});
    
    get('#/piece/describe/:id', function() { with(this) {
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
        draw_new_piece(piece_image_url(params['id']), 'piece-canvas');
        
        $('#piece-description-id').attr('value', params['id']);
        
        //clear the form
        
    }});
    
    post('#/piece/describe', function() { with(this) {
        //do stuff
        data = {};
        data['colors'] = comma_separate(params['colors']);
        data['styles'] = comma_separate(params['styles']);
        data['pattern'] = params['pattern'];
        data['material'] = params['material'];
        data['name'] = params['name'];
        data['type'] = params['type'];
        
        update_piece(params['piece-description-id'], data, function(msg) {
            redirect('#/piece/pick_points/' + params['piece-description-id']);
        });
    }});
    
    get('#/piece/pick_points/:id', function() { with(this) {
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
        draw_new_piece(piece_image_url(params['id']), 'piece-canvas');
        
        // get the piece information
        piece = get_piece(params['id']);
        
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
                    params['id'],
                   data,
                    function(msg) {
                        // show/hide the correct elements
                        $('#piece-preview').hide();
                        $('#pick-points-instructions').hide();
                        $('#describe-piece-form').hide();
                        $('#piece-image-upload').hide();
                        $('#all-done').show();


                        window.setTimeout('$(\'#add-clothes\').dialog(\'close\')', 2000);
                        redirect('#/');
                    }
                );
            }
            point_number += 1;
        });
        
        $('#add-clothes').dialog('open');
    }});    
    
}});
   
$(function() {
    app.run('#/');
});
    


