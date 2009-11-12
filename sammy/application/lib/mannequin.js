var Mannequin = new Object();

Mannequin.element_id = 'mannequin-canvas';

Mannequin.shirt_id = '';
Mannequin.pant_id = '';
Mannequin.shoes_id = '';

Mannequin.last_piece_hover = ''; // The last piece the mouse was over, to detect changes

Mannequin.shirt_position = {};  // Set in the draw() function for later highlighting
Mannequin.pant_position = {};   // keys are min_x, min_y, max_x, and max_y
Mannequin.shoes_position = {};  //

Mannequin.cached_images = {};   // hash of hashes for drawing images that have already been loaded
                                // first level key is the piece id
                                // second level keys are image, image_x, image_y, image_width, and image_height

Mannequin.element = function() {
    return $('#' + this.element_id);
}

Mannequin.piece_mousing_over = function(evt) {
    shirt = this.shirt_position;
    pant = this.pant_position;
    shoes = this.shoes_position;

    div_offset = absolute_offset($('#mannequin-canvas'));

    click_x = evt.pageX - div_offset[0] + 200; // again some crazy error, not sure but this seems to work
    click_y = evt.pageY - div_offset[1];

    if (click_x > shoes['min_x'] && click_x < shoes['max_x'] && click_y > shoes['min_y'] && click_y < shoes['max_y']) {
        return 'shoes';
    } else if (click_x > shirt['min_x'] && click_x < shirt['max_x'] && click_y > shirt['min_y'] && click_y < shirt['max_y']) {
        return 'shirt';
    } else if (click_x > pant['min_x'] && click_x < pant['max_x'] && click_y > pant['min_y'] && click_y < pant['max_y']) {
        return 'pants';
    } else {
        return 'none';
    }
    
}

Mannequin.draw_random_outfit = function() {
    outfit = random_outfit();
    
    this.shirt_id = outfit['shirt'];
    this.pant_id = outfit['pant'];
    this.shoes_id = outfit['shoes'];
    
    this.draw();
}

Mannequin.complete_outfit = function() {
    outfit = random_outfit();
    
    if (this.shirt_id == '') {
        this.shirt_id = outfit['shirt'];
    }
    if (this.pant_id == '') {
        this.pant_id = outfit['pant'];
    }
    if (this.shoes_id == '') {
        this.shoes_id = outfit['shoes'];
    }
    
    this.draw();
}

Mannequin.draw = function(highlight) {

    // Image stuff
    var canvas = document.getElementById(this.element_id);
    var cont = canvas.getContext('2d');
    var cache = this.cached_images;

    // First clear the canvas
    cont.clearRect(0, 0, canvas.width, canvas.height);
    
    var pant_id = this.pant_id;
    var shirt_id = this.shirt_id;
    var shoes_id = this.shoes_id;    
    
    var shirt = new Image();
    var pant = new Image();
    var shoes = new Image();
    
    // Some constants
    var waistline_y = 200;
    var waistline_x = canvas.width/2;
    var waist_width = 75;
    var leg_length = 210;
    
    
    if (pant_id in cache) { // draw the cached image
        cached_info = cache[pant_id];
        Mannequin.pant_position = {min_x: cached_info['image_x'], min_y: cached_info['image_y'], max_x: cached_info['image_x'] + cached_info['image_width'], max_y: cached_info['image_y'] + cached_info['image_height']};
        cont.drawImage(cached_info['image'], cached_info['image_x'], cached_info['image_y'], cached_info['image_width'], cached_info['image_height']);
        if (highlight == 'pants') {
            cont.strokeRect(cached_info['image_x'], cached_info['image_y'], cached_info['image_width'], cached_info['image_height']);
        }
    } else if (pant_id != '') { // calculate the image info, cache it, and draw it
        pant.onload = function() {
            var pant_points = get_piece(pant_id)
            
            right_waist = pant_points['right_waist'];
            left_waist = pant_points['left_waist']
            image_dimensions_ratio = pant.width/pant.height;

            // Calculate the appropriate size of the image for the canvas
            image_waist_width = right_waist[0] - left_waist[0];

            image_width = waist_width * (pant.width/image_waist_width);
            image_height = image_width/image_dimensions_ratio

            image_width_translation_ratio = image_width/pant.width;
            image_height_translation_ratio = image_height/pant.height;

            // Calculate the appropriate position of the image in the canvas
            image_waistline_y = (right_waist[1] - left_waist[1])/2 + left_waist[1];
            image_waistline_x = (image_waist_width)/2 + left_waist[0];

            translated_image_waistline_y = image_waistline_y * image_height_translation_ratio;
            translated_image_waistline_x = image_waistline_x * image_width_translation_ratio;

            image_y = waistline_y - translated_image_waistline_y;
            image_x = waistline_x - translated_image_waistline_x;            
            
            Mannequin.pant_position = {min_x: image_x, min_y: image_y, max_x: image_x + image_width, max_y: image_y + image_height};
            cont.drawImage(pant, image_x, image_y, image_width, image_height);
            if (highlight == 'pants') {
                cont.strokeRect(image_x, image_y, image_width, image_height);
            }

            // cache it for later use
            Mannequin.cached_images[pant_id] = {image: pant, image_x: image_x, image_y: image_y, image_width: image_width, image_height: image_height};

        }
        
        pant.src = couch(this.pant_id) + '/image';
        
    }

    if (shirt_id in cache) { // draw the cached image
        cached_info = cache[shirt_id];
        cont.drawImage(cached_info['image'], cached_info['image_x'], cached_info['image_y'], cached_info['image_width'], cached_info['image_height']);
        Mannequin.shirt_position = {min_x: cached_info['image_x'], min_y: cached_info['image_y'], max_x: cached_info['image_x'] + cached_info['image_width'], max_y: cached_info['image_y'] + cached_info['image_height']};
        if (highlight == 'shirt') {
            cont.strokeRect(cached_info['image_x'], cached_info['image_y'], cached_info['image_width'], cached_info['image_height']);
        }
    } else if (shirt_id != ''){ // draw a new image when it loads
        shirt.onload = function() {

            var shirt_info = get_piece(shirt_id);

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

            Mannequin.shirt_position = {min_x: image_x, min_y: image_y, max_x: image_x + image_width, max_y: image_y + image_height};
            cont.drawImage(shirt, image_x, image_y, image_width, image_height);
            if (highlight == 'shirt') {
                cont.strokeRect(image_x, image_y, image_width, image_height);
            }

            // cache it for later use
            Mannequin.cached_images[shirt_id] = {image: shirt, image_x: image_x, image_y: image_y, image_width: image_width, image_height: image_height};
        }
        
        shirt.src = couch(this.shirt_id) + '/image';
        
    }

    if (shoes_id in cache) { // draw the cached image
        cached_info = cache[shoes_id];
        cont.drawImage(cached_info['image'], cached_info['image_x'], cached_info['image_y'], cached_info['image_width'], cached_info['image_height']);
        Mannequin.shoes_position = {min_x: cached_info['image_x'], min_y: cached_info['image_y'], max_x: cached_info['image_x'] + cached_info['image_width'], max_y: cached_info['image_y'] + cached_info['image_height']};
        if (highlight == 'shoes') {
            cont.strokeRect(cached_info['image_x'], cached_info['image_y'], cached_info['image_width'], cached_info['image_height']);
        }
    } else if (shoes_id != ''){
        shoes.onload = function() {
            shoe_info = get_piece(shoes_id);
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

            Mannequin.shoes_position = {min_x: image_x, min_y: image_y, max_x: image_x + image_width, max_y: image_y + image_height};
            cont.drawImage(shoes, image_x, image_y, image_width, image_height);
            if (highlight == 'shoes') {
                cont.strokeRect(image_x, image_y, image_width, image_height);
            }
            
            // cache it for later use
            Mannequin.cached_images[shoes_id] = {image: shoes, image_x: image_x, image_y: image_y, image_width: image_width, image_height: image_height};
        }
        
        shoes.src = couch(this.shoes_id) + '/image';
        
    }
}