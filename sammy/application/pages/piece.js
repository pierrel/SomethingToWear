var point_number = 0;  // For adding clothes to the db
var point_pixels = []; //
var username = "";
var password = "";

// #/edit
function page_piece_new(context)
{
    var form = $('#piece-image-upload-form');
    // run this on success
    form.ajaxForm(null);
    form.ajaxForm(function() {
        App.redirect('#/piece/describe/' + msg.id);
    });
        
    // Update fields in the form, implicitly creating a new document. 
    $.ajax({
        type: "POST",
        url: Couch.url(),
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify({"doc_type":"piece"}),
        success: function(msg) {
            $('#new-piece-id').attr('value', msg.id);
            $('#new-piece-revision').attr('value', msg.rev);
            page_piece_describe();
        },
        error: function(req,status,error) { throw new Error("page_piece_new couldn't execute: "+status+", "+error);}
    });    
}

// #/piece/describe
function page_piece_describe(ctx)
{
    //do stuff
    data = {};
    data['colors'] = comma_separate(params['colors']);
    data['styles'] = comma_separate(params['styles']);
    data['pattern'] = params['pattern'];
    data['material'] = params['material'];
    data['name'] = params['name'];
    data['type'] = params['type'];
    
    update_piece(params['piece-description-id'], data, function(msg) {
        context.redirect('#/piece/pick_points/' + params['piece-description-id']);
    });
}

// #/piece/describe/:id
function page_piece_describe_id(context)
{
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
}

// #/piece/pick_points/:id
function page_piece_pick_points_id(ctx)
{
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
}
