function (doc) {
    var described = function(doc) {
        descriptions = ['color', 'material', 'pattern', 'gender', 'style'];
        for (i in descriptions) {
            if (!doc.hasOwnProperty(descriptions[i])) {
                return false;
            }
        }
        return true;
    }
    
    if (doc.doc_type == 'test-piece' && !described(doc) && doc.mturk_state != 'describing') {
        emit(doc._id, doc);
    }
}