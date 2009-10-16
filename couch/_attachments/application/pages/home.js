function page_home(context) {
    Mannequin.shirt_id = '98a5df0ced33d5fa891b464926a5539c';
    Mannequin.pant_id = '4ab8eb6901ee17def7dc670dcc4ffdaf';
    Mannequin.shoes_id = '18170179a9ce4ebcab91979881386f4c';

    Mannequin.draw();

    fill_closet(context);

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


    $('.search').click(function(evt) {
        this.select();
    });

    var select_function = function(elt) { return elt != ""; }; // use this to select only non-empty strings as attributes
    $('#shirt-search').keyup(function(evt) {
        var value = $(this).attr('value');
        var attributes = arr_select(comma_separate(value), select_function);

        search_and_update_closet(context, 'shirt', 'shirts', attributes);
    });

    $('#pants-search').keyup(function(evt) {
        var value = $(this).attr('value');
        var attributes = arr_select(comma_separate(value), select_function);

        search_and_update_closet(context, 'pants', 'pants', attributes);
    });

    $('#shoes-search').keyup(function(evt) {
        var value = $(this).attr('value');
        var attributes = arr_select(comma_separate(value), select_function);

        search_and_update_closet(context, 'shoes', 'shoes', attributes);
    });
}
