function(doc) {
    if (doc.doc_type == 'outfit') {
        for(i in doc.liked_by) {
            user = doc.liked_by[i];
            if (doc.shirt_id != '') {
                emit([user, 'shirt', doc.shirt_id], 1);
            }
            if (doc.pants_id != '') {
                emit([user, 'pants', doc.pants_id], 1);
            }
            if (doc.shoes_id != '') {
                emit([user, 'shoes', doc.shoes_id], 1);
            }
        }
    }
}