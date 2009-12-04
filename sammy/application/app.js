App = $.sammy(function() {
    // =================
    // = Public routes =
    // =================
    this.get('#/', page_loading);
    
    this.get('#/home', page_home);

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
