var couch_url = 'http://127.0.0.1:5984/wear';
var proxy_url = 'http://127.0.0.1:4567';

function couch(url) {
    return couch_url + url;
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

function new_piece(data, success_func, error_func) {
    typed_data = data;
    typed_data['doc_type'] = 'piece';
    $.ajax({
        type: "POST",
        url: couch(''),
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify(typed_data),
        success: success_func,
        error: error_func
    });
}

function comma_separate(string) {
    return $.map(string.split(','), function(elt, index) {
        return elt.replace('/^\s*|\s*$/g', '');
    });
}

function get_piece(id) {
    alert('getting ' + id);
    to_return = null;
    $.ajax({
        type: "GET",
        url: couch('/' + id),
        dataType: 'json',
        async: false,
        success: function(msg) {
            to_return = msg;
        },
        error: function(msg) {
            alert('There was an error retrieving ' + id);
            return null;
        }
    });
    return to_return;
}

function update_piece(id, data, success_func) {
    alert('updaing ' + id);
    //get the revision number
    $.ajax({
        type: "GET",
        url: couch('/' + id),
        dataType: 'json',
        contentType: 'application/json',
        success: function(msg) {            
            // get the old attributes
            reved_data = msg;
            
            // replace any that should be updated
            $.each(data, function(key, value) {
                reved_data[key] = value;
            });
            
            // Send the updated doc
            $.ajax({
                type: "PUT",
                url: couch('/' + id),
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify(reved_data),
                success: success_func,
                error: function(msg) {
                    alert('error, could not update ' + id + ": '" + JSON.stringify(msg) + "'");
                }
            })
        },
        error: function(msg) {
            alert('Error updating document ' + id + ": '" + JSON.stringify(msg) + "'");
        }
    });
}

function piece_image_url(id) {
    return couch('/' + id) + "/image";
}

var click1 = 0;
function set_click(evt) {
    click1 = 20;
    alert('clicked on 20');
}

var app = $.sammy(function() { with(this) {
    element_selector = '#main';
        
    get('#/rate', function() { with(this) {
        $("#fashion").dialog('open');
    }});
    
    get('#/added', function() { with(this) {
        $('#add-clothes').dialog('close');
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
                    redirect('#/piece/describe/' + msg.id);
                });
                
            },
            function(msg) {
                alert('error: ' + JSON.stringify(msg));
            });
    }});
    
    get('#/piece/describe/:id', function() { with(this) {
        // show/hide the correct elements
        $('#piece-preview').show();
        $('#describe-piece-form').show();
        $('#piece-image-upload').hide();
        
        $('#add-clothes').dialog('open');
        
        //make sure the canvas isn't doing anything with mouse clicks
        $('#piece-canvas').click(null);
        
        $('#piece-description-id').attr('value', params['id']);
    }});
    
    post('#/piece/describe', function() { with(this) {
        //do stuff
        data = {};
        data['colors'] = comma_separate(params['colors']);
        data['styles'] = comma_separate(params['styles']);
        data['pattern'] = params['pattern'];
        data['material'] = params['material'];
        data['name'] = params['name'];
        data['type'] = params['type'];
        
        update_piece(params['piece-description-id'], data, function(msg) {
            redirect('#/piece/pick_points/' + params['piece-description-id']);
        });
    }});
    
    get('#/piece/pick_points/:id', function() { with(this) {
        // show/hide the correct elements
        $('#piece-preview').show();
        $('#describe-piece-form').hide();
        $('#piece-image-upload').hide();
        
        // TODO: draw the image onto the canvas
        
        
        // set the listener on the canvas
        $('#piece-canvas').click(set_click);
        
        $('#add-clothes').dialog('open');
    }});
    
    
}});
   
$(function() {
    app.run('#/');
});
    


