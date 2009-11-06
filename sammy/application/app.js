App = $.sammy(function() {
    // =================
    // = Public routes =
    // =================
    this.get('#/', page_home);

    this.get('#/rate', function() {
        set_nav_css('rate');
        set_title('Rate');
        this.partial("templates/fashion.template");
    });

    this.get("#/share",function(ctx) {
        set_nav_css('share');
        set_title("Share");
        this.partial("templates/share.template");
        page_piece_new(ctx);
    });
    
    this.get('#/piece/new', function(context) {
        set_nav_css('share');
        set_title("Share");
        page_piece_new(context);
    });

    this.get('#/piece/describe/:id', function(context) { 
        set_nav_css('share');
        set_title("Share");
        page_piece_describe_id(context);
    });

    this.post('#/piece/describe', function(context) {
        set_nav_css('share');
        set_title("Share");
    
        page_piece_describe(context);
    });
    
    this.get('#/piece/pick_points/:id', function(context) {
        set_nav_css('share');
        set_title("Share");
        page_piece_pick_points_id(context);
    });
    
    
    this.get('#/user/login', function(context) {
        context.partial('templates/login.html', {}, function(rendered) {
           $('#main-wrapper').html(rendered); 
           
           $('#login-form').ajaxForm(function() { // for some reason Sammy's post isn't working so hijack the form
                username = $('#username').val();
                password = $('#password').val();

                couchauth = user_authentic(username, password);
                if (couchauth != false) {
                    store_cookie(username, couchauth);
                    context.redirect('#/');
                } else {
                    alert('username or password entered incorrectly');
                }
           });
        });
    });
    
    this.get('#/user/logout', function(context) {
        clear_session();
        clear_cookie();
        context.redirect('#/user/login');
    });
    
    this.get('#/user/new', function(context) {
        context.partial('templates/new_user.html', {}, function(rendered) {
           $('#main-wrapper').html(rendered);
           
           $('#new-user-form').ajaxForm(function() {
               password = $('#password').val();
               password_check = $('#password_check').val();
               encrypted = $('#password').crypt({method: 'sha1'});
               username = $('#username').val();
               
               if (password.length == 0) {
                   alert('come on, put in a password.');
               } else if (password != password_check) {
                   alert('passwords do not match');
               } else if (username.length == 0) {
                   alert('come on, put in a username');
               } else {
                   new_user(username, encrypted, function(success_msg) {
                       couchauth = user_authentic(username, password);
                       if (cookie) {
                           set_cookie(username, couchauth);
                           context.redirect('#/');
                       } else {
                           throw new Error("Newely created user '" + username + "' could not be authenticated");
                       }
                       
                   },
                   function(error_msg) {                       
                       if (JSON.parse(error_msg['responseText'])['error'] == 'conflict') {
                           alert('Username already taken, sorry. Please try another.');
                       }
                   });
               }
           });
        });
    });
    
     // =====================
     // = Internal settings =
     // =====================
     
     this.element_selector = '#body';
     this.silence_404 = true;
     this.use(Sammy.Template);

     // implements a 'fade out'/'fade in'
     this.swap = function(content) {
       this.$element().fadeOut('fast',function() {
          $(this).html(content).fadeIn('fast'); 
       });
     };

     // Runs when Sammy can't find the page we pass in
     this.bind('error-404',function(e, params) {
         this.log("404 error for "+params['verb']+" "+params['path']);
         set_nav_css();
         set_title("404");
         this.partial("templates/error.template");
     });
     
     this.bind("unknown-error",function() {
        this.app.swap("<div class=\"error\">There seems to be a problem with our service. \
        We apologize for the inconvenience.</div>");
     });

     var app_title = "Something to Wear";
     var set_title = function(sub_page) {
         document.title = app_title + (sub_page ? " - " + sub_page : "");
     };

     // Set the CSS style of whatever page we're on to its :hover state
     var set_nav_css = function(page)
     {
         $(".nav-title").each(function(i,ele) {
             var ele_id = $(ele).attr('id');
             var result = (/^([\w-_]+?)(?:-hover)?$/i).exec(ele_id);
             $(ele).attr("id",result[1]);
         });
         // set the desired page to have a hover attribute
         if (page) {
             $("#"+page).attr("id",page+"-hover");
         }
     };
});
   
$(document).ready(function() {
    try {
        App.run('#/');
    } catch(error) {
        console.log(error);    
        App.trigger('unknown-error');
    }
});
