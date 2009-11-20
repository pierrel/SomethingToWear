// Functions dealing with scaling and positioning the pieces on the mannequin

// Returns the height of the image which
// maintains the ratio with the given width
function get_height(image, width) {
    ratio = (image.width/image.height);
    return width/ratio;
}

// position is a hash with keys pos_x, pos_y, width, and height
function min_maxes_from_position(position) {
    if (position) {
        return {
            min_x: position.x,
            min_y: position.y,
            max_x: position.x + position.width,
            max_y: position.y + position.height
        }
    }
}

// returns the min-maxes for the resize area
function resize_min_maxes(position) {
    return {
        min_x: position.x + position.width - 12,
        min_y: position.y + position.height - 12,
        max_x: position.x + position.width,
        max_y: position.y + position.height
    }
}

function close_min_maxes(position) {
    return {
        min_x: position.x,
        min_y: position.y,
        max_x: position.x + 13,
        max_y: position.y + 13
    }
}


function within_bounds(evt, bounds) {
    div_offset = absolute_offset($('#mannequin-canvas'));

    click_x = evt.pageX - div_offset[0] + 215; // again some crazy problem, not sure but this seems to work
    click_y = evt.pageY - div_offset[1];

    return (click_x > bounds.min_x && click_x < bounds.max_x && click_y > bounds.min_y && click_y < bounds.max_y)
}