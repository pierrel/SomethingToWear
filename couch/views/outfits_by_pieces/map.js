function(doc) {
    if (doc.doc_type == 'outfit') {
        emit([doc.shirt_id, doc.pants_id, doc.shoes_id], doc.liked_by);
    }
}