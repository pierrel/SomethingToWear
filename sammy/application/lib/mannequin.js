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

// Position of pieces when first put on Mannequin (before cache)
Mannequin.default_positions = {
    shirt: {
        x: 20,
        y: 20,
        width: 150
    },
    pant: {
        x: 50,
        y: 200,
        width: 100
    },
    shoes: {
        x: 70,
        y: 300,
        width: 100
    }
};

Mannequin.element = function() {
    return $('#' + this.element_id);
}

Mannequin.share_outfit = function() {
    // first grab the info about the mannequin
    top_info = this.cached_images[this.shirt_id];
    bottom_info = this.cached_images[this.pant_id];
    shoe_info = this.cached_images[this.shoes_id];
    var url_info = {
        topid: this.shirt_id,
        topx: top_info.x,
        topy: top_info.y,
        topwidth: top_info.width,
        topheight: top_info.height,
        
        bottomid: this.pant_id,
        bottomx: bottom_info.x,
        bottomy: bottom_info.y,
        bottomwidth: bottom_info.width,
        bottomheight: bottom_info.height,
        
        shoeid: this.shoes_id,
        shoex: shoe_info.x,
        shoey: shoe_info.y,
        shoewidth: shoe_info.width,
        shoeheight: shoe_info.height
    };
        
    var id = 'share-outfit-dialog';
    var rendered = "Copy this: " + window.location.href + 'shared?' + $.param(url_info);
    var dialog = $('#' + id)
    
    if (dialog.html()) {
        dialog.html(rendered);
        dialog.dialog('open');
    } else {
        dialog = $('<div id="' + id + '"></div>');
        dialog.html(rendered);
        dialog.dialog({
            autoOpen: true,
            modal: true,
            width: 500,
            height: 50,
            dialogClass: 'dialog',
            closeOnEscape: true,
        });
    }
    
}

// the user is 'handling' if they are
// dragging or resizing
Mannequin.handling = function() {
    if (Mannequin.dragging) {
        return Mannequin.dragging;
    } else if (Mannequin.resizing) {
        return Mannequin.resizing;
    } else {
        return false;
    }
}

// returns the piece the user is mousing over
Mannequin.piece_mousing_over = function(evt) {
    shirt   = min_maxes_from_position(Mannequin.cached_images[Mannequin.shirt_id]);
    pant    = min_maxes_from_position(Mannequin.cached_images[Mannequin.pant_id]);
    shoes   = min_maxes_from_position(Mannequin.cached_images[Mannequin.shoes_id]);

    pieces_over = [];
    if (shoes && within_bounds(evt, shoes)) {
        pieces_over.push('shoes');
    }
    if (shirt && within_bounds(evt, shirt)) {
        pieces_over.push('shirt');
    }
    if (pant && within_bounds(evt, pant)) {
        pieces_over.push('pants');
    }
    
    // give precedence to the piece that the cursor is currently over, if any
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

Mannequin.on_info = function(evt) {
    if (this.last_piece_hover == 'shirt') {
        id = this.shirt_id
    } else if (this.last_piece_hover == 'pants') {
        id = this.pant_id;
    } else if (this.last_piece_hover == 'shoes') {
        id = this.shoes_id
    } else {
        return false;
    }
    
    bounds = info_min_maxes(this.cached_images[id]);
    if (within_bounds(evt, bounds)) {
        return id;
    } else {
        return false;
    }
}


Mannequin.on_close = function(evt) {
    if (this.last_piece_hover == 'shirt') {
        id = this.shirt_id
    } else if (this.last_piece_hover == 'pants') {
        id = this.pant_id;
    } else if (this.last_piece_hover == 'shoes') {
        id = this.shoes_id
    } else {
        return false;
    }
    
    bounds = close_min_maxes(this.cached_images[id]);
    if (within_bounds(evt, bounds)) {
        return this.last_piece_hover;
    } else {
        return false;
    }
}

Mannequin.draw_resize_icon = function(cont, piece_id) {
    var resize_info = this.cached_images.resize_icon;
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
            Mannequin.cached_images.resize_icon = {image: image};
            Mannequin.draw_resize_icon(cont, piece_id);
        };
        image.src = "static/images/resize_icon.png";
        
    }
}

Mannequin.draw_info_icon = function(cont, piece_id) {
    var icon_info = this.cached_images.info_icon;
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
            Mannequin.cached_images.info_icon = {image: image};
            Mannequin.draw_info_icon(cont, piece_id);
        };
        image.src = "static/images/info_icon.png";
        
    }    
}

Mannequin.draw_close_icon = function(cont, piece_id) {
    var icon_info = this.cached_images.close_icon;
    var piece_info = this.cached_images[piece_id];
    
    if (icon_info) { // it's in the cache
        cont.drawImage(
            icon_info.image,
            piece_info.x + 2,
            piece_info.y + 2,
            13,
            13);
    } else {
        var image = new Image();
        image.onload = function() {
            Mannequin.cached_images['close_icon'] = {image: image};
            Mannequin.draw_close_icon(cont, piece_id);
        };
        image.src = "static/images/close_icon.png";
        
    }
}

Mannequin.draw_random_outfit = function() {
    outfit = random_outfit();
    
    this.shirt_id = outfit['shirt'];
    this.pant_id = outfit['pant'];
    this.shoes_id = outfit['shoes'];
    
    this.draw();
}

// draws a random outfit after loading all icons
// and then removes the loading icon
Mannequin.draw_first_outfit = function() {
    var image_prefix = "static/images/";
    var outfit = random_outfit();
    var images = ["mannequin_instructions.png", "close_icon.png", "info_icon.png", "resize_icon.png", "instructions.png"];
    var loaded_images = [];
    
    this.shirt_id = outfit['shirt'];
    this.pant_id = outfit['pant'];
    this.shoes_id = outfit['shoes'];
    
    images.push(outfit.shirt);
    images.push(outfit.pant);
    images.push(outfit.shoes);
    
    // hide the mannequin so that nothing happens
    // when a user mouses over or clicks/drags
    $("#mannequin-canvas").hide();
    $('#mannequin-instructions-image').hide();
    
    $.each(images, function(i, image_name) {
        var image = new Image();
        image.onload = function(image_name) {
            return function() {
                
                if (image_name.match("\\.")) { // it's a static image
                    // add instructions as they're loaded
                    if (image_name == "instructions.png") {
                        $('#instructions-image').attr("src", image_prefix + image_name);
                    }



                    // add the icons to the Mannequin's cached_images
                    if (image_name.match("icon")) {
                        Mannequin.cached_images[image_name.replace('.png', '')] = {image: image};
                    }
                }

                // push the loaded image into the loaded_images array and check if
                // all images have been loaded
                loaded_images.push(image_name);
                if (loaded_images.length == images.length) {
                    $('#loading-icon').remove();
                    Mannequin.draw();
                    $("#mannequin-canvas").show();
                    $('#mannequin-instructions-image').attr("src", image_prefix + "mannequin_instructions.png");
                    $('#mannequin-instructions-image').show();
                }
            };
        }(image_name);
        if (image_name.match("\\.")) {
            image.src = image_prefix + image_name;
        } else {

            image.src = piece_image_url(image_name);
        }
        
    });
    
    
    
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
    cont.strokeStyle = "#ff704b"; // orange, the highlight color
    
    var ids = {
        pant: this.pant_id,
        shirt: this.shirt_id,
        shoes: this.shoes_id
    };
    
    var images = {
        pant: new Image(),
        shirt: new Image(),
        shoes: new Image()
    };
    
    // Some constants
    var positions = this.default_positions;
    
    // makes sure that the highlighted piece gets drawn last
    // and so shows up on top of the rest.
    order = []
    if (!highlight || highlight == 'shoes') {
        order = ['pant', 'shirt', 'shoes'];
    } else if (highlight == 'pants') {
        order = ['shirt', 'shoes', 'pant'];
    } else if (highlight == 'shirt') {
        order = ['pant', 'shoes', 'shirt'];
    }
    
    for (piece_ind in order) {
        var piece = order[piece_ind];
                
        if (ids[piece] in cache) { // draw the cached image
            cached_info = cache[ids[piece]];
            
            cont.drawImage(cached_info.image, cached_info.x, cached_info.y, cached_info.width, cached_info.height);
            if (highlight && highlight == piece || highlight == piece + "s") { // it's the one being highlighted
                cont.strokeRect(cached_info.x, cached_info.y, cached_info.width, cached_info.height);
                this.draw_resize_icon(cont, ids[piece]);
                this.draw_info_icon(cont, ids[piece]);
                this.draw_close_icon(cont, ids[piece]);
            }
        } else if (ids[piece] != '') { // 
            images[piece].onload = function(id, image, position) {
                return function() {
                    var height = get_height(image, position.width);

                    cont.drawImage(image, position.x, position.y, position.width, height);
                    Mannequin.cached_images[id] = {
                        image: image,
                        x: position.x,
                        y: position.y,
                        width: position.width,
                        height: height
                    };
                    
                };
            }(ids[piece], images[piece], positions[piece]);
            
            images[piece].src = couch(ids[piece]) + '/image'
        }
    }    
}