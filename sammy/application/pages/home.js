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
            
            Mannequin.element().click(function(evt) {
                piece_over = Mannequin.piece_mousing_over(evt);
                
                if (piece_over != 'none') {
                    if (piece_over == 'shoes') {
                        Mannequin.shoes_id = '';
                        Mannequin.shoes_position = {};
                    } else if (piece_over == 'shirt') {
                        Mannequin.shirt_id = '';
                        Mannequin.shirt_position = {};
                    } else if (piece_over == 'pants') {
                        Mannequin.pant_id = '';
                        Mannequin.pant_id = {};
                    }                        
                    Mannequin.draw();
                }

            })
            
            Mannequin.element().mousemove(function(evt) {
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