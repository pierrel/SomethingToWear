function(doc) {
    if (doc.doc_type == 'user') {
        emit(doc._id, {password_sha: doc.password, salt: "", secret: 'halloween', roles: ['_admin']});
    }
}