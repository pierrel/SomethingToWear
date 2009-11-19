function (doc) {
    if (doc.hasOwnProperty("mturk_id")) {
        emit(doc.mturk_id, doc._id)
    }
    if (doc.hasOwnProperty("mturk_describe_id")) {
        emit(doc.mturk_describe_id, doc._id)
    }
}