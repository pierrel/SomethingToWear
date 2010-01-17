function page_shared(context) {
    context.partial('templates/shared.template', {}, function(rendered) {
        $('#main-wrapper').html(rendered);
    });
}