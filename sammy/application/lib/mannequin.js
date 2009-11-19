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

Mannequin.dragging = false // is the piece type when the user is dragging a piece

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
        return false;
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
    var default_shirt_pos_x = 20;
    var default_shirt_pos_y = 20;
    var default_shirt_width = 150;
    
    var default_pant_pos_x = 50;
    var default_pant_pos_y = 200;
    var default_pant_width = 100;
    
    var default_shoes_pos_x = 70;
    var default_shoes_pos_y = 400;
    var default_shoes_width = 100;
    
    
    if (pant_id in cache) { // draw the cached image
        cached_info = cache[pant_id];
        Mannequin.pant_position = {min_x: cached_info['image_x'], min_y: cached_info['image_y'], max_x: cached_info['image_x'] + cached_info['image_width'], max_y: cached_info['image_y'] + cached_info['image_height']};
        cont.drawImage(cached_info['image'], cached_info['image_x'], cached_info['image_y'], cached_info['image_width'], cached_info['image_height']);
        if (highlight == 'pants') {
            cont.strokeRect(cached_info['image_x'], cached_info['image_y'], cached_info['image_width'], cached_info['image_height']);
        }
    } else if (pant_id != '') { // calculate the image info, cache it, and draw it
        pant.onload = function() {
            height = get_height(pant, default_pant_width);
            Mannequin.pant_position = {
                min_x: default_pant_pos_x,
                min_y: default_pant_pos_y,
                max_x: default_pant_pos_x + default_pant_width, 
                max_y: default_pant_pos_y + height
            };
            
            cont.drawImage(pant, default_pant_pos_x, default_pant_pos_y, default_pant_width, height);
            if (highlight == 'pants') {
                cont.strokeRect(default_pant_pos_x, default_pant_pos_y, default_pant_width, height);
            }

            // cache it for later use
            Mannequin.cached_images[pant_id] = {image: pant, image_x: default_pant_pos_x, image_y: default_pant_pos_y, image_width: default_pant_width, image_height: height};

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
            height = get_height(shirt, default_shirt_width);
            Mannequin.shirt_position = {
                min_x: default_shirt_pos_x,
                min_y: default_shirt_pos_y,
                max_x: default_shirt_pos_x + default_shirt_width, 
                max_y: default_shirt_pos_y + height
            };
            
            cont.drawImage(shirt, default_shirt_pos_x, default_shirt_pos_y, default_shirt_width, height);
            if (highlight == 'pants') {
                cont.strokeRect(default_shirt_pos_x, default_shirt_pos_y, default_shirt_width, height);
            }

            // cache it for later use
            Mannequin.cached_images[shirt_id] = {image: shirt, image_x: default_shirt_pos_x, image_y: default_shirt_pos_y, image_width: default_shirt_width, image_height: height};

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
            height = get_height(shoes, default_shoes_width);
            Mannequin.shoes_position = {
                min_x: default_shoes_pos_x,
                min_y: default_shoes_pos_y,
                max_x: default_shoes_pos_x + default_shoes_width, 
                max_y: default_shoes_pos_y + height
            };
            
            cont.drawImage(shoes, default_shoes_pos_x, default_shoes_pos_y, default_shoes_width, height);
            if (highlight == 'shoes') {
                cont.strokeRect(default_shoes_pos_x, default_shoes_pos_y, default_shoes_width, height);
            }

            // cache it for later use
            Mannequin.cached_images[shoes_id] = {image: shoes, image_x: default_shoes_pos_x, image_y: default_shoes_pos_y, image_width: default_shoes_width, image_height: height};

        }
        
        shoes.src = couch(this.shoes_id) + '/image';
        
    }
}