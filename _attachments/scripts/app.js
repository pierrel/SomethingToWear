function couch(url) {
    return 'http://127.0.0.1:5984' + url;
}

// Works!
function uuid() {
    var id;
    
    $.ajax({
        type: "GET",
        url: 'http://localhost:5984/_uuids',
        async: false,
        datatype: "json",
        success: function(msg) {
            id = msg['uuids'][0];
        },
        error: function(msg) {
            alert("there was an error getting an id: " + msg);
        }
    });
    
    return id;
    
}

var app = $.sammy(function() { with(this) {
    element_selector = '#main';
    
    get('#/mannequin', function() { with(this) {
        alert('mannequin was hit!');
    }});
    
    get('#/added', function() { with(this) {
        $('#add-clothes').dialog('close');
        alert('Piece added!');
    }});
    
    post('#/closet/add', function() { with(this) {
        // piece = params;
        var piece = params;
        piece['type'] = 'piece';
        alert("sending '" + JSON.stringify(piece) +"' to '/wear' ...");
        $.ajax({
            type: "POST",
            url: 'http://127.0.0.1:5984/wear',
            dataType: "json",
            contentType: 'application/json',
            data: JSON.stringify(piece),
            success: function(msg) {
                alert("the response was '" + JSON.stringify(msg) + "'");
            },
            error: function(msg) {
                members = [];
                for(var member in msg){
                    members = members + member;
                }
                alert("there was an error: '" + JSON.strinfigy(msg) + "'");
            }
        });
        redirect('#/added');
    }});
    
}});
   
$(function() {
    app.run('#/');
});
    


