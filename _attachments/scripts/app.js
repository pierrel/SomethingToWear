var closet_state = 'closed';

$("#fashion").dialog({
	autoOpen: false,
	modal: true,
	width: 'auto',
	hide: 'slide',
	show: 'slide',
	resizable: false,
	buttons : {
		'Close' : function() {
			$(this).dialog('close');
		}
	}
});

$("#rate_others").click(function() {
	$("#fashion").dialog('open');
});

$("#closet-handle").click(function() {
	if (closet_state == 'closed') {
		$("#instructions").hide();
		$("#mannequin").switchClass('span-11', 'span-10');
		$("#closet-handle").removeClass('last');
		$("#closet").addClass('span-11 last');
		$("#closet").show('slide');

		closet_state = 'open';
	} else {
		$("#closet").removeClass('span-11 last');
		$("#closet").hide('slide');
		$("#closet-handle").addClass('last');
		$("#mannequin").switchClass('span-10', 'span-11');
		$("#instructions").show();
		
		closet_state = 'closed';
	}
	
});


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
	
	
	
	
	

