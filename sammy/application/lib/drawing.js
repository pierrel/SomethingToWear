var piece_width_translation_ratio = 0; // These are needed to translate important points on the picture
var piece_height_translation_ration = 0;
function draw_new_piece(image_url, canvas_id) {
    var canvas = document.getElementById(canvas_id);
    var context = canvas.getContext('2d');
    
    // clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    var piece = new Image();
    
    piece.onload = function() {
        
        // get image and canvas size differences
        width_diff = piece.width - canvas.width;
        height_diff = piece.height - canvas.height;
                
        // image dimension ratio
        ratio = piece.width/piece.height;
        
        // Assuming the picture is larger than the canvas
        if (width_diff >= height_diff) { // then the width is the limiting length
            context.drawImage(piece, 0, 0, canvas.width, canvas.width/ratio);
            
            // need this only for translating pixels from the canvas to the image
            piece_width_translation_ratio = piece.width/canvas.width;
            piece_height_translation_ratio = piece.height/(canvas.width/ratio);
        } else { // then the height is the limiting width
            context.drawImage(piece, 0, 0, canvas.height*ratio, canvas.height);
            
            // ditto
            piece_width_translation_ratio = piece.width/(canvas.height*ratio);
            piece_height_translation_ratio = piece.height/canvas.height;
        }   
    }
    piece.src = image_url;
}

function absolute_offset(element) {
    var offX = 0;
    var offY = 0;
    while( element.parent().length != 0 ) {
        offY += element.offset().top;
        offX += element.offset().left;
        element = $(element.parent().get(0));
    }
    return [offX, offY];
}
