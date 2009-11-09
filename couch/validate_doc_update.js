function (newDoc, oldDoc, user) {
    // !code lib/validate.js 
    
    var type = newDoc.doc_type; // so that it doesn't need to be accessed a bunch of times
    
    if (!isAdmin(user)) {
        // TODO: Make validations    
    }    
}