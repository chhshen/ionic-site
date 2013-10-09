/*   
!! DO NOT USE ANY OF THIS CODE, ITS ONLY FOR OUR DOCS PAGE !!
 _             _      
(_)           (_)     
 _  ___  _ __  _  ___ 
| |/ _ \| '_ \| |/ __|
| | (_) | | | | | (__ 
|_|\___/|_| |_|_|\___|

*/

(function(){

  /* Header menu toggle for mobile */
  $("#menu-toggle").click(function(e) {
      e.preventDefault();
      $(this).toggleClass("active");
  });


  /* Fixed left menu */
  var $fixedMenu = $('.docked-menu');
  if($fixedMenu.length) {
    $(document.body).scrollspy({ target: '.docked-menu' });

    var fixedMenuTop = $fixedMenu.offset().top;
    var menuTopPadding = 20;
    $fixedMenu.css({
      top: menuTopPadding + 'px'
    });

    function docScroll(e) {
      if(window.scrollY + menuTopPadding > fixedMenuTop) {
        $fixedMenu
          .css({
            width: $fixedMenu.width() + 'px'
          })
          .addClass("fixed-menu");
      } else {
        $fixedMenu
          .removeClass("fixed-menu")
          .css({
            width: 'auto'
          });
      }
    }
    $(window).scroll(docScroll);
  }

  /* Fixed device preview on the docs page */
  var $devicePreview = $('.device-preview');
  if($devicePreview.length) {
    var previewTop = $devicePreview.offset().top;

    function previewReset() {

      if(window.scrollY > previewTop) {
        var offset = $devicePreview.offset();
        $devicePreview
          .css({
            left: Math.round(offset.left) + 'px'
          })
          .addClass("fixed-preview");
      } else {
        $devicePreview
          .removeClass("fixed-preview")
          .css({
            left: 'auto'
          });
      }

    }
    $(window).resize(function(){
      $devicePreview
          .removeClass("fixed-preview")
          .css({
            left: 'auto'
          });
      previewReset();
    });
    $(window).scroll(previewReset);
    previewReset();

    $fixedMenu.on('activate.bs.scrollspy', function (e) {
      if(e.target) {

        var id;
        if(e.target.children.length > 1) {
          // this is a top level nav link
          var activeSublinks = $(e.target.children[0]).find('.active');
          if(!activeSublinks.length) {
            // no children are active for this top level link
            id = e.target.children[0].hash.replace("#", "");
          }
        } else if(e.target.children.length === 1) {
          // this is a sub nav link
          id = e.target.children[0].hash.replace("#", "");
        }

        if(id) {
          console.log(id)
        }
      }
    });
  }

})();