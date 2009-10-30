function(doc) {   
    if (doc.doc_type == 'outfit') {
        shirt = doc.shirt_id;
        pants = doc.pants_id;
        shoes = doc.shoes_id;
    
        // emit the shirt with the rest first
        if (shirt !== '') {
            if (pants !== '') {
                emit(shirt, pants);
            }
            if (shoes !== '') {
                emit(shirt, shoes);
            }
        }
    
        // then emit the pants with the rest
        if (pants !== '') {
            if (shirt !== '') {
                emit(pants, shirt);
            }
            if (shoes !== '') {
                emit(pants, shoes)
            }
        }
    
        // finally the shoes with the rest
        if (shoes !== '') {
            if (shirt !== '') {
                emit(shoes, shirt);
            }
            if (pants !== '') {
                emit(shoes, pants);
            }
        }
    }
}