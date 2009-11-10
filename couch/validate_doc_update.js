function (newDoc, oldDoc, user) {
    
    isAdmin = (user.roles.indexOf('_admin') != -1)
    
    if (!isAdmin) {
        throw {unauthorized: "Can't updat documents unless you're an admin"}
    } 
}