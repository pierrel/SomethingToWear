function(doc) {
    // !code lib/piece.js
    
    if (doc.doc_type == 'piece' && ready_to_show(doc)) { // make sure it is ready to show
        
        if (doc.placement == 'tops') {
            type = 'shirt';
        } else if (doc.placement == 'bottoms') {
            type = 'pants';
        } else {
            type = 'shoes';
        }
        
        emit(type, 1);
        
    }
}