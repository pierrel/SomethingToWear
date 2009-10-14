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
        height_diff = piece.height - canvas.height;
                
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
