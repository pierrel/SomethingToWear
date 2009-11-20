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
                
                if (piece_over) { // we're dragging or resizing a piece
                    if (Mannequin.on_resize(evt)) {
                        Mannequin.resizing = piece_over;
                    } else {
                        Mannequin.dragging = piece_over;
                    }
                    
                    // either way save the position
                    Mannequin.last_cursor_pos_x = evt.pageX;
                    Mannequin.last_cursor_pos_y = evt.pageY;
                }

            });
            
            Mannequin.element().click(function(evt) {
                piece_closing = Mannequin.on_close(evt);
               if (piece_closing) {
                   if (piece_closing == "pants") {
                       Mannequin.pant_id = "";
                   } else {
                       Mannequin[piece_closing + "_id"] = "";
                   }
                   Mannequin.draw();
               } 
            });
            
            Mannequin.element().mouseup(function(evt) {
               Mannequin.dragging = false;
               Mannequin.resizing = false;
            });
                        
            Mannequin.element().mousemove(function(evt) {
                if (Mannequin.handling()){
                    // grab the ∆ of the move
                    move_x = evt.pageX - Mannequin.last_cursor_pos_x;
                    move_y = evt.pageY - Mannequin.last_cursor_pos_y;
                    
                    // update the last cursor
                    Mannequin.last_cursor_pos_x = evt.pageX;
                    Mannequin.last_cursor_pos_y = evt.pageY;

                    if (Mannequin.handling() == 'shirt') {
                        id = Mannequin.shirt_id;
                    } else if (Mannequin.handling() == 'pants') {
                        id = Mannequin.pant_id;
                    } else if (Mannequin.handling() == 'shoes') {
                        id = Mannequin.shoes_id;
                    } else {
                        throw "Handling '" + Mannequin.dragging + "'";
                    }
                    
                    if (Mannequin.dragging) {
                        // update the piece position
                        image_info = Mannequin.cached_images[id];
                        Mannequin.cached_images[id] = {
                            image: image_info.image,
                            x: image_info.x + move_x,
                            y: image_info.y + move_y,
                            width: image_info.width,
                            height: image_info.height
                        };                                            
    
                    } else if (Mannequin.resizing) {
                        // update the piece dimensions
                        image_info = Mannequin.cached_images[id];
                        Mannequin.cached_images[id] = {
                            image: image_info.image,
                            x: image_info.x,
                            y: image_info.y,
                            width: image_info.width + move_x,
                            height: image_info.height + move_y
                        };                                            
                    }
                    
                    Mannequin.draw(Mannequin.handling());
                } else {
                    piece = Mannequin.piece_mousing_over(evt);

                    if (piece != Mannequin.last_piece_hover) {
                        Mannequin.draw(piece);
                        Mannequin.last_piece_hover = piece;
                    }

                    if (piece) {
                        $('#mannequin:hover').css('cursor', 'move');
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
