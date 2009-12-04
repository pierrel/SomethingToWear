function page_loading(context) {
    
    context.partial('templates/loading.html', {}, function(rendered) {
        $('#main-wrapper').html(rendered);
        
        var image_prefix = "static/images/";
        var images = ["loading_orange.gif", "instructions.png", "close_icon.png", "info_icon.png", "resize_icon.png"];
        var loaded_images = []

        $.each(images, function(i, image_name) {
            image = new Image();
            image.onload = function(image_name) {
                return function() {
                    if (image_name == "loading_orange.gif") {
                        $('#loading-spinner').append('<img src="' + image_prefix + image_name +'" />');
                    }
                    
                    loaded_images.push(image_name);
                    if (loaded_images.length == images.length) {
                        context.redirect('#/home');
                    }
                };
            }(image_name);
            image.src = image_prefix + image_name;
        });
        //context.redirect('#/home')
    });
}