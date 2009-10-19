function page_home(context) {
    // check that the user is logged in
    if($.cookie('somethingtowear') == null) {
        context.redirect('#/user/login');
        return false;
    }
    
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
                
                if (piece == 'shoes') {
                    Mannequin.shoes_id = '';
                    Mannequin.draw();
                } else if (piece == 'shirt') {
                    Mannequin.shirt_id = '';
                    Mannequin.draw();
                } else if (piece == 'pants') {
                    Mannequin.pant_id = '';
                    Mannequin.draw();
                }                        

            })
            
            Mannequin.element().mousemove(function(evt) {
                piece = Mannequin.piece_mousing_over(evt);
                
                if(piece) {
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
            
            // outfit saving stuff
            $('#like-link').click(function(evt) {
                Mannequin.like_current_outfit($.cookie('somethingtowear'));
            });

            // search stuff
            $('.search').click(function(evt) {
                this.select();
            });

            select_function = function(elt) { return elt != "" && elt != "and"}; // use this to select only non-empty strings as attributes
            $('#shirt-search').keyup(function(evt) {
                var value = $(this).attr('value');
                var attributes = arr_select(comma_separate(value), select_function);

                search_and_update_closet(context, 'shirt', 'shirts', attributes);
            });        
        });
    });
}
