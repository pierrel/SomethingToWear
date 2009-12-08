function page_loading(context) {
    
    context.partial('templates/loading.html', {}, function(rendered) {
        $('#main-wrapper').html(rendered);
        
        if (!$.browser.msie) {
            var image_prefix = "static/images/";
            var images = ["loading_orange.gif", "instructions.png", "mannequin_instructions.png", "close_icon.png", "info_icon.png", "resize_icon.png"];
            var loaded_images = []

            $.each(images, function(i, image_name) {
                var image = new Image();
                image.onload = function(image_name) {
                    return function() {

                        // add the spinner to the loading page when it's loaded
                        if (image_name == "loading_orange.gif") {
                            $('#loading-spinner').append('<img src="' + image_prefix + image_name +'" />');
                        }

                        // add the icons to the Mannequin's cached_images
                        if (image_name.match("icon")) {
                            Mannequin.cached_images[image_name.replace('.png', '')] = {image: image};
                        }

                        // push the loaded image into the loaded_images array and check if
                        // a images have been loaded
                        loaded_images.push(image_name);
                        if (loaded_images.length == images.length) {
                            context.redirect('#/home');
                        }
                    };
                }(image_name);
                image.src = image_prefix + image_name;
            });
            context.redirect('#/home')
        } else {
            var image = new Image();
            image.onload = function() {
                context.partial('templates/sorry.html', {}, function(rendered) {
                    $('#main-wrapper').html(rendered);
                });
            };
            image.src = 'static/images/sorry.png';
        }
    });
}