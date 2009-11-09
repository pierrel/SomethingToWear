function (newDoc, oldDoc, user) {
    
    isAdmin = (user.roles.indexOf('_admin') != -1)
    
    if (!isAdmin) {
        // TODO: Make validations    
    }    
}