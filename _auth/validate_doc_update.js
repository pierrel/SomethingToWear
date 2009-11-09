function (newDoc, oldDoc, user) {
    // !code lib/validate.js 
    
    var type = newDoc.doc_type; // so that it doesn't need to be accessed a bunch of times
    
    if (!isAdmin(user)) {
        // must be a user to do anything
        var isUser = false;
        for (i in user.roles) {
            if (user.roles[i] == 'user') {
                isUser = true;
            }
        }
        if (!isUser) {
            throw({unauthorized: 'must be admin or user.'});
        }
        
        // users can only delete their own accounts
        if (newDoc._deleted && newDoc._id != user.name) {
            throw({unauthorized: "cannot delete another user's account"});
        }
        
        // doc_types must stay the same
        if (oldDoc && newDoc.doc_type != oldDoc.doc_type) {
            throw({unauthorized: 'cannot change the type of a document'});
        }
        
        // non-admins cannot edit pieces
        if (type == 'piece') {
            throw({unauthorized: 'users cannot edit pieces of clothing'});
        }
        
        // TODO: Make a validation for outfits    
    }    
}