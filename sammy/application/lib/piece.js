// Returns the height of the image which
// maintains the ratio with the given width
function get_height(image, width) {
    ratio = (image.width/image.height);
    return width/ratio;
}