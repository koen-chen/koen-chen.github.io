$(document).ready(function(){
    var $pageWrapper = $('#page-wrapper'),
         $nav = $('#nav'),
         $footer = $('#footer'),
         $toBlog = $('.to-blog'),
         $blogTips = $toBlog.find('span'),
         $upDown = $footer.find('.up-down'),
         $profile = $('#profile'),
         distance = $('#'+$('.current').attr('href')).position().top;
    
    $(window).bind('load',function(){
        $('body,#wrapper').removeClass('init');
    }); 
    
    $pageWrapper.stop().animate({ top:-distance },500);
    
    var timer = null ;
    if ($nav.length) {
        $nav.delegate('a','click',function(e){
            e.preventDefault();
            var $a = $(this);
            if (!$a.hasClass('current')) {
                if (timer !== null) { clearInterval(timer); }
                var distance = $('#'+$a.attr('href')).position().top;
                $('.current').stop().animate({ 'marginLeft':66},500).removeClass('current');
                $a.addClass('current');
                $pageWrapper.stop().animate({ 'top':-distance },500,function(){
                    if ($a.hasClass('about')) {
                        $profile.show().delay(1000).animate({bottom:-20},1000);
                        var flag = true;
                        timer = setInterval(function(){
                            if (flag) {
                                $('.intro span').animate({'color':'#ff9900'},4000);
                                flag = false;
                            }
                            else {
                                $('.intro span').animate({'color':'#0099cc'},4000);
                                flag = true;
                            }
                        },8000);
                    }
                    else {
                       $('.intro span').css('color','#0099cc');
                       $profile.hide().animate({bottom:-100},20);
                    }
                });
                $footer.stop().animate({ 'bottom':($a.hasClass('contact') ? 0 : -52) },800,function(){$upDown.removeClass('up'); })
                $toBlog.stop().animate({'top':($a.hasClass('skills') ? -25 : -125)},800,'easeInOutBack',function(){
                    $blogTips.stop().animate({'right':18},20,function(){$blogTips.hide();});
                });
               
            }   
        });
    }
    
    $profile.hover(
        function(){$(this).find('span').fadeIn(800);},
        function(){$(this).find('span').fadeOut(500);}
    );
    
    $toBlog.hover(
        function(){$blogTips.stop().show().animate({'right':40},500);},
        function(){$blogTips.stop().animate({'right':18},500,function(){$blogTips.hide();});}
    );
    
    $nav.find('a').hover(
        function(){
            var ml = $(this).hasClass('contact') ? 0 :15; 
            $(this).stop().animate({ 'marginLeft':ml },500);
        },
        function(){
            if (!$(this).hasClass('current')) {
                $(this).stop().animate({ 'marginLeft':66 },800);
            }
        }
    );
    
    $upDown.toggle(
        function(){
            $footer.stop().animate({ 'bottom':-25 },500,function(){ $upDown.addClass('up'); });
        },
        function(){
            $footer.stop().animate({ 'bottom':0 },500,function(){ $upDown.removeClass('up'); });
        }
    );
});    