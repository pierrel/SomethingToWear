function(doc) {
    is_correct = function(doc) {
        return (doc.type == 'shirt' && doc.right_shoulder && doc.left_shoulder && doc.waist) || (doc.type == 'pants' && doc.right_waist && doc.left_waist) || (doc.type == 'shoes' && doc.right_ankle && doc.left_ankle);
    }
    
    if (doc.doc_type == 'piece' && doc.type && doc._attachments) { // make sure it is a piece and has an image
        
        // make sure it has enough information to be displayed
        if (is_correct(doc)) {
            // for all colors
            for (var index in doc.colors) {
                emit([doc.type, doc.colors[index]], null);
            }
            
            // for all styles
            for (var index in doc.styles) {
                emit([doc.type, doc.styles[index]], null);
            }
            
            // for the material
            emit([doc.type, doc.material], null);
            
            // for name
            emit([doc.type, doc.name], null);
        }
        
    }
}