function (doc) {
    if (doc.doc_type == 'outfit') {
        for(user_index in doc.liked_by) {
            user_id = doc.liked_by[user_index];
            if (doc.shirt_id !== '') {
                emit(user_id, doc.shirt_id);
            }
            if (doc.pants_id !== '') {
               emit(user_id, doc.pants_id); 
            }
            if (doc.shoes_id !== '') {
              emit(user_id, doc.shoes_id) ; 
            }
        }
    }
}