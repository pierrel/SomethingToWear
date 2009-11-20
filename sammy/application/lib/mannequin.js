var Mannequin = new Object();

Mannequin.element_id = 'mannequin-canvas';

Mannequin.shirt_id = '';
Mannequin.pant_id = '';
Mannequin.shoes_id = '';

Mannequin.last_piece_hover = ''; // The last piece the mouse was over, to detect changes

Mannequin.cached_images = {};   // hash of hashes for drawing images that have already been loaded
                                // first level key is the piece id
                                // second level keys are image, x, y, width, and height

Mannequin.dragging = false // is the piece type when the user is dragging a piece

Mannequin.element = function() {
    return $('#' + this.element_id);
}

Mannequin.piece_mousing_over = function(evt) {
    shirt   = min_maxes_from_position(Mannequin.cached_images[Mannequin.shirt_id]);
    pant    = min_maxes_from_position(Mannequin.cached_images[Mannequin.pant_id]);
    shoes   = min_maxes_from_position(Mannequin.cached_images[Mannequin.shoes_id]);

    if (within_bounds(evt, shoes)) {
        return 'shoes';
    } else if (within_bounds(evt, shirt)) {
        return 'shirt';
    } else if (within_bounds(evt, pant)) {
        return 'pants';
    } else {
        return false;
    }
    
}

Mannequin.on_resize = function(evt) {
    if (this.last_piece_hover == 'shirt') {
        id = this.shirt_id
    } else if (this.last_piece_hover == 'pants') {
        id = this.pant_id;
    } else if (this.last_piece_hover == 'shoes') {
        id = this.shoes_id
    } else {
        return false;
    }
    bounds = resize_min_maxes(this.cached_images[id])
    if (within_bounds(evt, bounds)) {
        return id;
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
        cont.drawImage(cached_info['image'], cached_info['x'], cached_info['y'], cached_info['width'], cached_info['height']);
        if (highlight == 'pants') {
            cont.strokeRect(cached_info['x'], cached_info['y'], cached_info['width'], cached_info['height']);
        }
    } else if (pant_id != '') { // calculate the image info, cache it, and draw it
        pant.onload = function() {
            height = get_height(pant, default_pant_width);            
            cont.drawImage(pant, default_pant_pos_x, default_pant_pos_y, default_pant_width, height);
            if (highlight == 'pants') {
                cont.strokeRect(default_pant_pos_x, default_pant_pos_y, default_pant_width, height);
            }

            // cache it for later use
            Mannequin.cached_images[pant_id] = {image: pant, x: default_pant_pos_x, y: default_pant_pos_y, width: default_pant_width, height: height};

        }
        
        pant.src = couch(this.pant_id) + '/image';
        
    }

    if (shirt_id in cache) { // draw the cached image
        cached_info = cache[shirt_id];
        cont.drawImage(cached_info['image'], cached_info['x'], cached_info['y'], cached_info['width'], cached_info['height']);
        if (highlight == 'shirt') {
            cont.strokeRect(cached_info['x'], cached_info['y'], cached_info['width'], cached_info['height']);
        }
    } else if (shirt_id != ''){ // draw a new image when it loads
        shirt.onload = function() {
            height = get_height(shirt, default_shirt_width);
            
            cont.drawImage(shirt, default_shirt_pos_x, default_shirt_pos_y, default_shirt_width, height);
            if (highlight == 'pants') {
                cont.strokeRect(default_shirt_pos_x, default_shirt_pos_y, default_shirt_width, height);
            }

            // cache it for later use
            Mannequin.cached_images[shirt_id] = {image: shirt, x: default_shirt_pos_x, y: default_shirt_pos_y, width: default_shirt_width, height: height};

        }
        
        shirt.src = couch(this.shirt_id) + '/image';
        
    }

    if (shoes_id in cache) { // draw the cached image
        cached_info = cache[shoes_id];
        cont.drawImage(cached_info['image'], cached_info['x'], cached_info['y'], cached_info['width'], cached_info['height']);
        if (highlight == 'shoes') {
            cont.strokeRect(cached_info['x'], cached_info['y'], cached_info['width'], cached_info['height']);
        }
    } else if (shoes_id != ''){
        shoes.onload = function() {
            height = get_height(shoes, default_shoes_width);
            
            cont.drawImage(shoes, default_shoes_pos_x, default_shoes_pos_y, default_shoes_width, height);
            if (highlight == 'shoes') {
                cont.strokeRect(default_shoes_pos_x, default_shoes_pos_y, default_shoes_width, height);
            }

            // cache it for later use
            Mannequin.cached_images[shoes_id] = {image: shoes, x: default_shoes_pos_x, y: default_shoes_pos_y, width: default_shoes_width, height: height};

        }
        
        shoes.src = couch(this.shoes_id) + '/image';
        
    }
}