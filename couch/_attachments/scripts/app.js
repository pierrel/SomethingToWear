var couch_url = 'http://127.0.0.1:5984';
var proxy_url = 'http://127.0.0.1:4567';

function couch(url) {
    return couch_url + url;
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

function draw_mannequin() {
	var cont = document.getElementById('mannequin-canvas').getContext('2d');
	var shirt = new Image();
	var pant = new Image();
	var shoes = new Image();

	shirt.onload = function() {
		ratio = shirt.width/shirt.height;
		width = 150;
		cont.drawImage(shirt, 30, 60, width, width/ratio);
	}

	pant.onload = function() {
		ratio = pant.width/pant.height;
		width = 110;
		cont.drawImage(pant, 60, 235, width, width/ratio);
	}

	shoes.onload = function() {
		ratio = shoes.width/shoes.height;
		height = 50;
		cont.drawImage(shoes, 55, 439, height*ratio, height);
	}

	shoes.src = 'images/shoes2.png';
	pant.src = 'images/pant2.png';
	shirt.src = 'images/shirt1.png';
}

function open_description() {
	$("#piece-image-upload").hide();
	$('#describe-piece-form').show();
}

function show_preview(input) {
	var cont = document.getElementById('piece-canvas').getContext('2d');
	piece = new Image();
	alert("showing preview of '" + input.value + "'");
	
	piece.onload = function() {
		ratio = piece.width/piece.height;
		width = 150;
		cont.drawImage(piece, 10, 10, width, width/ratio);
		alert("loaded!");
	}
	
	piece.src = 'file://localhost/' + input.value;
	
}


function new_piece(data, success_func, error_func) {
    typed_data = data;
    typed_data['type'] = 'piece';
    $.ajax({
        type: "POST",
        url: 'http://127.0.0.1:5984/wear',
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify(typed_data),
        success: success_func,
        error: error_func
    });
}

var app = $.sammy(function() { with(this) {
    element_selector = '#main';
    
    get('#/mannequin', function() { with(this) {
        alert('mannequin was hit!');
    }});
    
    get('#/rate', function() { with(this) {
        $("#fashion").dialog('open');
    }});
    
    get('#/added', function() { with(this) {
        $('#add-clothes').dialog('close');
        alert('Piece added!');
    }});
    
    get('#/piece/new', function() { with(this) {
        new_piece(
            {}, 
            function(msg) {
                // show/hide the correct elements
                $('#piece-preview').hide();
                $('#describe-piece-form').hide();
                $('#piece-image-upload').show();
                
                $('#add-clothes').dialog('open');
                
                $('#new-piece-id').attr('value', msg.id);
                $('#new-piece-revision').attr('value', msg.rev);
                form = $('#piece-image-upload-form');
                form.ajaxForm(function() {
                    alert('Image uploaded!');
                });
                
            },
            function(msg) {
                alert('error: ' + JSON.stringify(msg));
            });
    }});
    
    post('#/piece/add/image', function() { with(this) {
        
        alert('Trying to add image: ' + params['image']);
        form = $('#piece-image-upload-form')
        form.attr(
            'action', 
            'http://127.0.0.1:5984/wear/' + params['piece-id'] + '/image?rev=' + params['piece-rev']);
        alert("The action now looks like: '" + form.attr('action') + "'");
        form.submit();
        alert('The form has been submitted!');
                // Then send the image
                // $.ajax({
                //     type: "PUT",
                //     url: 'http://127.0.0.1:5984/wear/' + msg.id +'/image?rev=' + msg.rev,
                //     dataType: 'json',
                //     contentType: 'image/jpeg',
                //     data: image,
                //     success: function(msg) {
                //         alert("Image sent, the response was '" + JSON.stringify(msg) + "'");
                //     },
                //     error: function(msg) {
                //         alert("there was an error sending the image: '" + JSON.stringify(msg) + "'");
                //     }
                // });
                
        redirect('#/piece/new/description');
    }});
    
}});
   
$(function() {
    app.run('#/');
});
    


