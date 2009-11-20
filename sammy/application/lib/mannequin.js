var Mannequin = new Object();

Mannequin.element_id = 'mannequin-canvas';

Mannequin.shirt_id = '';
Mannequin.pant_id = '';
Mannequin.shoes_id = '';

Mannequin.last_piece_hover = ''; // The last piece the mouse was over, to detect changes

Mannequin.cached_images = {};   // hash of hashes for drawing images that have already been loaded
                                // first level key is the piece id
                                // second level keys are image, x, y, width, and height

Mannequin.dragging = false; // is the piece type when the user is dragging a piece
Mannequin.resizing = false; // is the piece type when the user is resizing a piece

Mannequin.element = function() {
    return $('#' + this.element_id);
}

Mannequin.handling = function() {
    if (Mannequin.dragging) {
        return Mannequin.dragging;
    } else if (Mannequin.resizing) {
        return Mannequin.resizing;
    } else {
        return false;
    }
}

Mannequin.piece_mousing_over = function(evt) {
    shirt   = min_maxes_from_position(Mannequin.cached_images[Mannequin.shirt_id]);
    pant    = min_maxes_from_position(Mannequin.cached_images[Mannequin.pant_id]);
    shoes   = min_maxes_from_position(Mannequin.cached_images[Mannequin.shoes_id]);

    pieces_over = [];
    if (within_bounds(evt, shoes)) {
        pieces_over.push('shoes');
    }
    if (within_bounds(evt, shirt)) {
        pieces_over.push('shirt');
    }
    if (within_bounds(evt, pant)) {
        pieces_over.push('pants');
    }
    
    // give precedence to the piece that the cursor is currently over
    if (pieces_over.indexOf(this.last_piece_hover) != -1) {
        return this.last_piece_hover;
    } else if (pieces_over.size == 0){
        return false;
    } else {
        return pieces_over[0];
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

Mannequin.draw_resize_icon = function(cont, piece_id) {
    var resize_info = this.cached_images.resize_info;
    var piece_info = this.cached_images[piece_id];
    
    if (resize_info) {
        cont.drawImage(
            resize_info.image,
            piece_info.x + piece_info.width - 12,
            piece_info.y + piece_info.height - 12,
            12,
            12);
    } else {
        var image = new Image();
        image.onload = function() {
            Mannequin.cached_images['resize_info'] = {image: image};
            Mannequin.draw_resize_icon(cont, piece_id);
        };
        image.src = "static/images/resize_icon.png";
        
    }
}

Mannequin.draw_info_icon = function(cont, piece_id) {
    var icon_info = this.cached_images['info_icon'];
    var piece_info = this.cached_images[piece_id];
    
    if (icon_info) { // it's in the cache
        cont.drawImage(
            icon_info.image,
            piece_info.x + 2,
            piece_info.y + piece_info.height - 18,
            16,
            16);
    } else {
        var image = new Image();
        image.onload = function() {
            Mannequin.cached_images['info_icon'] = {image: image};
            Mannequin.draw_info_icon(cont, piece_id);
        };
        image.src = "static/images/info_icon.png";
        
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
    cont.strokeStyle = "#ff704b";
    
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
            this.draw_resize_icon(cont, pant_id);
            this.draw_info_icon(cont, pant_id);
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
            this.draw_resize_icon(cont, shirt_id);
            this.draw_info_icon(cont, shirt_id);
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
            this.draw_resize_icon(cont, shoes_id);
            this.draw_info_icon(cont, shoes_id);
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