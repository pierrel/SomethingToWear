function (doc) {
    if (doc.doc_type == 'piece' && doc.state == 'pending') {
        emit(doc._id, doc);
    }
}