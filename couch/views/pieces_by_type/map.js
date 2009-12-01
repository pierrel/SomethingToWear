function(doc) {
    // !code lib/piece.js
    
    if (doc.doc_type == 'piece' && doc.placement && doc._attachments && ready_to_show(doc)) { // make sure it is a piece and has an image
        
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