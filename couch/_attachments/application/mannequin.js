var Mannequin = new Object();

Mannequin.element_id = 'mannequin-canvas';

Mannequin.shirt_id = '';
Mannequin.pant_id = '';
Mannequin.shoes_id = '';

Mannequin.last_piece_hover = ''

Mannequin.shirt_position = {};
Mannequin.pant_position = {};
Mannequin.shoes_position = {};

Mannequin.cached_images = {};

Mannequin.element = function() {
    return $('#' + this.element_id);
}

Mannequin.like_confirmation = function() {
    div = $('#like-feedback');
    div.show();
    setTimeout("div.fadeOut('slow')", 2000);
}


Mannequin.like_current_outfit = function (username) {
        
    // check if the outfit exists
    msg = get_view('outfits_by_pieces', {key: [this.shirt_id, this.pant_id, this.shoes_id]});

    if (msg['rows'].length == 0) { // outfit doesn't exist, create it
        outfit = new_outfit(this.shirt_id, this.pant_id, this.shoes_id, username, function(msg) {
            Mannequin.like_confirmation();
        });

    } else { // it exists, so add the user to it's liked_by array
        users = msg['rows'][0]['value'];    // there should only be one.
        outfit_id = msg['rows'][0]['id'];   //
                
        // check to see if the user has already liked the outfit
        user_in = arr_select(users, function(user) { return normal_username(user) == username });

        if (user_in.length == 0) {
            // if not then add the user
            users.push(couch_username(username));            
            update_piece(outfit_id, {liked_by: users}, function(msg) {
                Mannequin.like_confirmation();
            });
        } else {
            Mannequin.like_confirmation();
        }
    }
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
    
    if (cache[this.shirt_id] != null) {
        shirt = cache[shirt_id]['image'];
    }
    if (cache[this.pant_id] != null) {
        pant = cache[pant_id]['image'];
    }
    if (cache[this.shoes_id] != null) {
        shoes = cache[shoes_id]['image'];
    }

    // Some constants
    var waistline_y = 200;
    var waistline_x = canvas.width/2;
    var waist_width = 75;
    var leg_length = 210;
    
    if (cache[pant_id]) { // draw the cached image
        cached_info = cache[pant_id];
        cont.drawImage(cached_info['image'], cached_info['image_x'], cached_info['image_y'], cached_info['image_width'], cached_info['image_height']);
        if (highlight == 'pants') {
            cont.strokeRect(cached_info['image_x'], cached_info['image_y'], cached_info['image_width'], cached_info['image_height']);
        }
    } else {
        pant.onload = function() {
            pant_info = get_piece(pant_id);
            right_waist = pant_info['right_waist'];
            left_waist = pant_info['left_waist']
            image_dimensions_ratio = pant.width/pant.height;

            // Calculate the appropriate size of the image
            image_waist_width = right_waist[0] - left_waist[0];

            image_width = waist_width * (pant.width/image_waist_width);
            image_height = image_width/image_dimensions_ratio

            image_width_translation_ratio = image_width/pant.width;
            image_height_translation_ratio = image_height/pant.height;

            // Calculate the appropriate position of the image
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
        
    }

    if (cache[shirt_id]) { // draw the cached image
        cached_info = cache[shirt_id];
        cont.drawImage(cached_info['image'], cached_info['image_x'], cached_info['image_y'], cached_info['image_width'], cached_info['image_height']);
        if (highlight == 'shirt') {
            cont.strokeRect(cached_info['image_x'], cached_info['image_y'], cached_info['image_width'], cached_info['image_height']);
        }
    } else { // draw a new image when it loads
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
        
    }

    if (cache[shoes_id]) { // draw the cached image
        cached_info = cache[shoes_id];
        cont.drawImage(cached_info['image'], cached_info['image_x'], cached_info['image_y'], cached_info['image_width'], cached_info['image_height']);
        if (highlight == 'shoes') {
            cont.strokeRect(cached_info['image_x'], cached_info['image_y'], cached_info['image_width'], cached_info['image_height']);
        }
    } else {
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
        
    }
    if (!(shoes_id in cache)) {
        shoes.src = couch(this.shoes_id) + '/image';
    }
    if (!(pant_id in cache)) {
        pant.src = couch(this.pant_id) + '/image';
    }
    if (!(shirt_id in cache)) {
       shirt.src = couch(this.shirt_id) + '/image';  
    }
    
}