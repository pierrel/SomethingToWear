var couch_url = 'http://127.0.0.1:5984/wear';
var proxy_url = 'http://127.0.0.1:4567';

function couch(url) {
    return couch_url + '/' + url;
}

function draw_mannequin(pieces_ids) {
    // Image stuff
    var canvas = document.getElementById('mannequin-canvas');
	var cont = canvas.getContext('2d');
	
	var shirt = new Image();
	var pant = new Image();
	var shoes = new Image();
	
	// Some constants
	var waistline_y = 250;
	var waistline_x = canvas.width/2;
	var waist_width = 75;
	var leg_length = 200;
	
	pant.onload = function() {
	    pant_info = get_piece(pieces_ids['pant_id']);
	    right_waist = pant_info['right_waist'];
	    left_waist = pant_info['left_waist']
		image_dimensions_ratio = pant.width/pant.height;
		
		// Calculate the appropriate size of the image
		image_waist_width = right_waist[0] - left_waist[0];
		
		width = waist_width * (pant.width/image_waist_width);
		height = width/image_dimensions_ratio
		
		image_width_translation_ratio = width/pant.width;
        image_height_translation_ratio = height/pant.height;
        
		// Calculate the appropriate position of the image
		image_waistline_y = (right_waist[1] - left_waist[1])/2 + left_waist[1];
		image_waistline_x = (image_waist_width)/2 + left_waist[0];
		
		translated_image_waistline_y = image_waistline_y * image_height_translation_ratio;
		translated_image_waistline_x = image_waistline_x * image_width_translation_ratio;
		
		image_y = waistline_y - translated_image_waistline_y;
		image_x = waistline_x - translated_image_waistline_x;
		
		cont.drawImage(pant, image_x, image_y, width, height);
	}

		
	shirt.onload = function() {
	    var shirt_info = get_piece(pieces_ids['shirt_id']);
	    
	    var left_shoulder = shirt_info['left_shoulder'];
	    var right_shoulder = shirt_info['right_shoulder'];
	    image_waist = shirt_info['waist'];
	    
		image_dimensions_ratio = shirt.width/shirt.height;
		waist_shoulder_ratio = 0.8; // pulled out of my ass
		
		// calculate image size
		image_shoulder_width = right_shoulder[0] - left_shoulder[0];
		translated_image_shoulder_width = waist_width/waist_shoulder_ratio;
		
		image_width = translated_image_shoulder_width * (shirt.width/image_shoulder_width);
		image_height = image_width/image_dimensions_ratio
		
		image_width_translation_ratio = image_width/shirt.width;
        image_height_translation_ratio = image_height/shirt.height;
        
        // calculated image location
        image_waistline_y = image_waist[1];
        image_waistline_x = left_shoulder[0] + image_shoulder_width/2;
        
        translated_image_waistline_y = image_waistline_y * image_height_translation_ratio;
        translated_image_waistline_x = image_waistline_x * image_width_translation_ratio;
        
        image_y = waistline_y - translated_image_waistline_y;
        image_x = waistline_x - translated_image_waistline_x;
		
		cont.drawImage(shirt, image_x, image_y, image_width, image_height);
	}

	
	shoes.onload = function() {
	    shoe_info = get_piece(pieces_ids['shoes_id']);
		image_dimensions_ratio = shoes.width/shoes.height;
		
		// set the dimensions
		image_width = waist_width*1.5;
		image_height = image_width/image_dimensions_ratio;
		
		image_width_translation_ratio = image_width/shoes.width;
        image_height_translation_ratio = image_height/shoes.height;
        
        // center the shoes under the "legs"
		image_center_y = Math.min(shoe_info['left_ankle'][1], shoe_info['right_ankle'][1]);
		image_center_x = (shoe_info['left_ankle'][0] - shoe_info['right_ankle'][0])/2 + shoe_info['right_ankle'][0];
		
		translated_image_center_x = image_center_x * image_width_translation_ratio;
		translated_image_center_y = image_center_y * image_height_translation_ratio;
		
		image_x = waistline_x - translated_image_center_x;
		image_y = waistline_y + leg_length - translated_image_center_y;
		
		cont.drawImage(shoes, image_x, image_y, image_width, image_height);
	}

    shoes.src = couch(pieces_ids['shoes_id']) + '/image';
	pant.src = couch(pieces_ids['pant_id']) + '/image';
    shirt.src = couch(pieces_ids['shirt_id']) + '/image';
	
	//boxes to make sure they are drawn correctly
	cont.strokeRect(waistline_x - waist_width/2, waistline_y, waist_width, leg_length);
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

function piece_image_url(id) {
    return couch(id) + "/image";
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

var app = $.sammy(function() { with(this) {
    element_selector = '#main';
    
    get('#/', function() { with(this) {
        pieces = {};
        pieces['shirt_id'] = '98a5df0ced33d5fa891b464926a5539c';
        pieces['pant_id'] = 'ff7b00dc50abd3e480532d1a1319b913';
        pieces['shoes_id'] = '18170179a9ce4ebcab91979881386f4c';
        
        draw_mannequin(pieces);
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
        // $('#piece-canvas').click(null);
        
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
    


