function(doc) {
    if (doc.doc_type == 'test-piece' && doc.placement && doc._attachments) { // make sure it is a piece and has an image
        
        if (doc.placement == 'tops') {
            type = 'shirt';
        } else if (doc.placement == 'bottoms') {
            type = 'pants';
        } else {
            type = 'shoes';
        }
        
        emit(type, doc._id);
        
    }
}