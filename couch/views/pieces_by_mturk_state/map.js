function (doc) {
    if (doc.mturk_state) {
        emit(doc.mturk_state, doc)
    }
}