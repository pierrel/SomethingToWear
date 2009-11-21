function (doc) {
    if (doc.store_id) {
        emit(doc.store_id, doc)
    }
}