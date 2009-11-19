function page_home(context) {

    context.partial('templates/main.html', {}, function(rendered) {
        $('#main-wrapper').html(rendered);
        
        $('#main-wrapper').ready(function() {
            Mannequin.draw_random_outfit();
            fill_closet(context);
            
            $('#dress').click(function(evt) {
                Mannequin.complete_outfit();
            })


            // set up mannequin-canvas interaction
            Mannequin.element().droppable({
                drop: function(evt, ui) {
                    draggable_info = ui.draggable.attr('id').split("-");
                    type = draggable_info[0];
                    id = draggable_info[1];

                    if (type == 'shirts') {
                        Mannequin.shirt_id = id;
                    } else if (type == 'pants') {
                        Mannequin.pant_id = id;
                    } else if (type == 'shoes') {
                        Mannequin.shoes_id = id;
                    }

                    Mannequin.draw();
                },
                accept: '.piece',
                activeClass: 'mannequin-canvas-dragging'
            });
            
            Mannequin.element().mousedown(function(evt) {
                piece_over = Mannequin.piece_mousing_over(evt);
                
                if (piece_over) { // we're dragging a piece
                    Mannequin.dragging = piece_over;
                    Mannequin.last_cursor_pos_x = evt.pageX;
                    Mannequin.last_cursor_pos_y = evt.pageY;
                }

            });
            
            Mannequin.element().mouseup(function(evt) {
                if (Mannequin.dragging) {
                    alert("we've stopped dragging");  
                }
               Mannequin.dragging = false;
            });
                        
            Mannequin.element().mousemove(function(evt) {
                if (Mannequin.dragging){
                    // grab the ∆ of the move
                    move_x = evt.pageX - Mannequin.last_cursor_pos_x;
                    move_y = evt.pageY - Mannequin.last_cursor_pos_y;
                    
                    // update the last cursor
                    Mannequin.last_cursor_pos_x = evt.pageX;
                    Mannequin.last_cursor_pos_y = evt.pageY;
                    
                    // update the piece position
                    if (Mannequin.dragging == 'shirt') {
                        id = Mannequin.shirt_id;
                        image = Mannequin.cached_images[id];
                        Mannequin.cached_images[id] = {
                            image: image.image,
                            image_x: image.image_x + move_x,
                            image_y: image.image_y + move_y,
                            image_width: image.image_width,
                            image_height: image.image_height
                        };
                    }
                    Mannequin.draw();
                    
                } else {
                    piece = Mannequin.piece_mousing_over(evt);

                    if (piece != Mannequin.last_piece_hover) {
                        Mannequin.draw(piece);
                        Mannequin.last_piece_hover = piece;
                    }

                    if (piece != 'none') {
                        $('#mannequin:hover').css('cursor', 'pointer');
                    } else {
                        $('#mannequin:hover').css('cursor', 'default');
                    }
                }
            });
            
            // search stuff
            $('.search').click(function(evt) {
                this.select();
            });

            select_function = function(elt) { return elt != "" && elt != "and"}; // use this to select only non-empty strings as attributes
            $('#shirt-search').keyup(closet_search(context, 'shirt', 'shirts'));
            $('#pants-search').keyup(closet_search(context, 'pants', 'pants'));
            $('#shoes-search').keyup(closet_search(context, 'shoes', 'shoes')); 
        });
    });
}
