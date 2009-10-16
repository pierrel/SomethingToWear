var Mannequin = new Object();

Mannequin.element_id = 'mannequin-canvas';

Mannequin.shirt_id = '';
Mannequin.pant_id = '';
Mannequin.shoes_id = '';

Mannequin.shirt_position = {};
Mannequin.pant_position = {};
Mannequin.shoes_position = {};

Mannequin.element = function() {
    return $('#' + this.element_id);
}


Mannequin.draw = function () {

    // Image stuff
    var canvas = document.getElementById(this.element_id);
    var cont = canvas.getContext('2d');

    // First clear the canvas
    cont.clearRect(0, 0, canvas.width, canvas.height);

    var shirt = new Image();
    var pant = new Image();
    var shoes = new Image();

    var pant_id = this.pant_id;
    var shirt_id = this.shirt_id;
    var shoes_id = this.shoes_id;

    // Some constants
    var waistline_y = 200;
    var waistline_x = canvas.width/2;
    var waist_width = 75;
    var leg_length = 210;

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
    }


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
    }


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
    }

    shoes.src = couch(this.shoes_id) + '/image';
    pant.src = couch(this.pant_id) + '/image';
    shirt.src = couch(this.shirt_id) + '/image'; 
}