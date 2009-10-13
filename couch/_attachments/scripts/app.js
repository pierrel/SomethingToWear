var couch_url = 'http://127.0.0.1:5984/wear';
var proxy_url = 'http://127.0.0.1:4567';

function couch(url) {
    return couch_url + url;
}

function draw_mannequin() {
	var cont = document.getElementById('mannequin-canvas').getContext('2d');
	var shirt = new Image();
	var pant = new Image();
	var shoes = new Image();

	shirt.onload = function() {
		ratio = shirt.width/shirt.height;
		width = 150;
		cont.drawImage(shirt, 30, 60, width, width/ratio);
	}

	pant.onload = function() {
		ratio = pant.width/pant.height;
		width = 110;
		cont.drawImage(pant, 60, 235, width, width/ratio);
	}

	shoes.onload = function() {
		ratio = shoes.width/shoes.height;
		height = 50;
		cont.drawImage(shoes, 55, 439, height*ratio, height);
	}

	shoes.src = 'images/shoes2.png';
	pant.src = 'images/pant2.png';
	shirt.src = 'images/shirt1.png';
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

function comma_separate(string) {
    return $.map(string.split(','), function(elt, index) {
        return $.trim(elt);
    });
}

function get_piece(id) {
    to_return = null;
    $.ajax({
        type: "GET",
        url: couch('/' + id),
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
        url: couch('/' + id),
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
                url: couch('/' + id),
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

function piece_image_url(id) {
    return couch('/' + id) + "/image";
}

var piece_width_translation_ratio = 0; // These are needed to translate important points on the picture
var piece_height_translation_ration = 0;
function draw_new_piece(image_url, canvas_id) {
    var canvas = document.getElementById(canvas_id);
    var context = canvas.getContext('2d');
    
    // clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    var piece = new Image();
    
    piece.onload = function() {
        
        // get image and canvas size differences
        width_diff = piece.width - canvas.width;
        height_diff = piece.width - canvas.width;
                
        // image dimension ratio
        ratio = piece.width/piece.height;
        
        // Assuming the picture is larger than the canvas
        if (width_diff >= height_diff) { // then the width is the limiting length
            context.drawImage(piece, 0, 0, canvas.width, canvas.width/ratio);
            
            // need this only for translating pixels from the canvas to the image
            piece_width_translation_ratio = piece.width/canvas.width;
            piece_height_translation_ratio = piece.height/(canvas.width/ratio);
        } else { // then the height is the limiting width
            context.drawImage(piece, 0, 0, canvas.height*ratio, canvas.height);
            
            // ditto
            piece_width_translation_ratio = piece.width/(canvas.height*ratio);
            piece_height_translation_ratio = piece.height/canvas.height;
        }   
    }
    piece.src = image_url;
}

function absolute_offset(element) {
    var offX = 0;
    var offY = 0;
    while( element.parent().length != 0 ) {
        offY += element.position().top;
        offX += element.position().left;
        element = $(element.parent().get(0));
    }
    return [offX, offY];
}

var point_number = 0;
var point_pixels = [];
function piece_points(evt) {

       
}

var app = $.sammy(function() { with(this) {
    element_selector = '#main';
        
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
    


