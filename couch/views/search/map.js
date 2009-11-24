function(doc) {
    is_correct = function(doc) {
        var has_descriptors = true;
        for_search = ['materials', 'colors', 'pattern', 'styles'];
        for (var i in for_search) {
            part_name = for_search[i];
            has_descriptors = has_descriptors && doc[part_name] && doc[part_name].size != 0;
        }
        
        return has_descriptors && doc.detail_page_url && doc.name && doc.uncut_image_url;
    }
        
    if (doc.doc_type == 'piece' && doc.placement && doc._attachments) { // make sure it is a piece and has an image
        
        // convert from placement to type
        if (doc.placement == 'tops') {
            type = 'shoes';
        } else if (doc.placement == 'bottoms') {
            type = 'pants';
        } else {
            type = doc.placement; // it's shoes
        }
        
        // make sure it has enough information to be displayed
        if (is_correct(doc)) {
            // for all colors
            for (var index in doc.colors) {
                emit([type, doc.colors[index]], null);
            }
            
            // for all styles
            for (var index in doc.styles) {
                emit([type, doc.styles[index]], null);
            }
            
            // for the materials
            for (var index in doc.materials) {
                emit([type, doc.materials[index]], null);
            }
            
            for (var index in doc.pattern) {
                emit([type, doc.pattern[index]], null);
            }
            
            
            // for name
            emit([type, doc.name], null);
        }
        
    }
}