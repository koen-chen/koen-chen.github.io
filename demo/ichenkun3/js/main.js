$(document).ready(function(){
    if (jQuery.browser.msie && parseInt(jQuery.browser.version,10) <= 6) {
        $('body').append($('<div class="old-browser">Your Browser version is too old,Please update to a modern Browser!</div>')); 
        return;
    }  
    $(window).bind('load',function(){
        $('body').removeClass('init').find('.container').css('visibility','visible');
    });
    
    var $main = $('#main'),
        $slideInfo = $('#slide-info'),
        $blog = $('#blog'),
        $minor = $('#minor'),
        $navTip = $('<div id="nav-tip"><p>_</p><div class="section"></div></div>').appendTo('.container').hide();
        
    $main.slider({
        slideComplete:function(current){
            $blog.hide();
            $minor.stop().animate({'bottom':'-25px'});
            
            var value = $('.nav li:eq('+current+') a').attr('title');
            $slideInfo.removeClass().addClass(value);
            $slideInfo.text(value);
            switch (current) {
                case 1:
                    $blog.delay(1000).show(300,fixClearType);
                    break;
                case 3:
                    $minor.stop().animate({'bottom':0},300);
                    break;
            }   
        }
    });  
    
    $blog.hover(
        function(){
            $(this).find('a').animate({'width':'+=20'})
        },
        function(){
            $(this).find('a').animate({'width':'-=20'})
        }
    );
    
    $slideInfo.hover(
        function(){
            $(this).hasClass('contact') ? $(this).stop().animate({right:25}) : $(this).animate({right:40});  
        },
        function(){
            $(this).stop().animate({right:90});
        }
    );
    
    $('.nav li a').hover(
        function(e){
           e.preventDefault();
            var content = $(this).attr('title').toUpperCase(),
                offset = $(this).offset(),
                top = offset.top-40,
                left = offset.left-25;
            $navTip.show().css({
                top:top,
                left:left
            }).find('.section').text(content);
        },
        function(e){
            $navTip.hide();
        }
    );
    
    $('#contact-form .submit').click(function(){
    	alert('抱歉，该功能还未完成，请使用下面的邮箱与我联系～');
    	return false;
    })
    function fixClearType() {
        if(jQuery.browser.msie){
            this.style.removeAttribute('filter');
        }
    }
});

$.fn.slider = function(options){
    var config = $.extend({
        slides:'.slides',
        pagination:'.nav',
        fadespeed:500,
        slideComplete:function(){}
    },options);
    
    return this.each(function(){
        var $container = $(this),
            $slider = $('.slides',$container),
            total = $slider.children().size(),
            width = $slider.children().outerWidth(),
            height = $slider.children().outerHeight(),
            position, 
            distance,
            next = 0, 
            prev = 0, 
            current = 0;
        
        $slider.css({
            position: 'relative',
            width:width*total,
            height:height,
            left:-width
        });
        
        $slider
            .children().css({
                position:'absolute',
                top:0, 
                left:$slider.children().outerWidth(),
                zIndex:0,
                display: 'none'
            })
            .eq(current).fadeIn();
            
        $('.nav li:eq('+ current +')',$container).addClass('current');

        
        $('.next',$container).click(function(e){
            e.preventDefault();
            animate('next');
        });
            
        $('.previous',$container).click(function(e){
            e.preventDefault();
            animate('previous');
        });
			 
        $('.nav li a',$container).click(function(){			
            clicked = $(this).attr('href').match('[^#/]+$');
            if (current != clicked) {
                animate('pagination', clicked);
            }
            return false;
        });
        
        function animate(dir,clicked) {
            switch(dir) {
                case 'next':
                    prev = current;
                    next = current + 1;
                    next = total === next ? 0 : next;
                    position = width*2;
                    distance = -width*2;
                    current = next;
                    break;
                case 'previous':
                    prev = current;
                    next = current - 1;
                    next = next === -1 ? total-1 : next;								
                    position = 0;								
                    distance = 0;		
                    current = next;
                    break;
            case 'pagination':
                    next = parseInt(clicked,10);
                    prev = $('.nav li.current a',$container).attr('href').match('[^#/]+$');
                    if (next > prev) {
                        position = width*2;
                        distance = -width*2;
                    } else {
                        position = 0;
                        distance = 0;
                    }
                    current = next;
                break;
            }
            
            $slider.children(':eq('+ next +')').css({
                left:position,
                display:'block'
            });
            
            $slider.animate({
                left:distance
            },300,function(){
                
                $('.nav li.current',$container).removeClass('current');
                $('.nav  li:eq('+ next +')',$container).addClass('current');
                
                $slider.css({
                    left:-width
                });
                
                $slider.children(':eq('+ next +')').css({
                    left:width,
                    zIndex:5
                });
               
                $slider.children(':eq('+ prev +')').css({
                    left:width,
                    display:'none',
                    zIndex:0
                });
                
                config.slideComplete(current);
            })  
        }
    });
};