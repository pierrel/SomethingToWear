function ready_to_show(doc) {
    var has_descriptors = true;
    for_search = ['materials', 'colors', 'pattern', 'styles'];
    for (var i in for_search) {
        part_name = for_search[i];
        has_descriptors = has_descriptors && doc[part_name] && doc[part_name].length >= 2;
    }
    
    return doc.placement && doc._attachments && has_descriptors && doc.name && doc.uncut_image_url && !doc.cut_wrong && (doc.available == null || doc.available);
    
};