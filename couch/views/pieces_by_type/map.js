function(doc) {
    if (doc.doc_type == 'piece' && doc.type && doc._attachments) { // make sure it is a piece and has an image
        
        // make sure it has enough information to be displayed
        if (doc.type == 'shirt' && doc.right_shoulder && doc.left_shoulder && doc.waist) {
            emit(doc.type, doc._id);
        } else if (doc.type == 'pants' && doc.right_waist && doc.left_waist) {
            emit(doc.type, doc._id);
        } else if (doc.type == 'shoes' && doc.right_ankle && doc.left_ankle) {
            emit(doc.type, doc._id);
        }
        
    }
}