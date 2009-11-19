// Functions dealing with scaling and positioning the pieces on the mannequin

// Returns the height of the image which
// maintains the ratio with the given width
function get_height(image, width) {
    ratio = (image.width/image.height);
    return width/ratio;
}

// position is a hash with keys pos_x, pos_y, width, and height
function min_maxes_from_position(position) {
    return {
        min_x: position.x,
        min_y: position.y,
        max_x: position.x + position.width,
        max_y: position.y + position.height
    }
}