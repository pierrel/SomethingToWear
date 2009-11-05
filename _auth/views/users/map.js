function(doc) {
    if (doc.doc_type == 'user') {
        id_array = doc._id.split('-')
        id_array.shift();
        name = id_array.join('-')
        emit(doc._id, {name: name, password_sha: doc.password, salt: "", secret: 'halloween', roles: ['user']});
    }
}