$(function(){
    var bversion = parseInt($.browser.version,10);
       
    if ($.browser.msie && bversion <= 7) {
        $('.old-browser').show();
        return false;
    }  
    
    $('.container').show();
    
    var init = true,
        $nav = $('.main-nav li'),
        random = Math.floor((Math.random()*7));

    $('.cite p').html($('.quotations-list li').eq(random).html());
    $nav.each(function(){
        $(this).css('left',$('.container').width()/2 - $(this).outerWidth()/2);
    });

    $nav.hover(function(){
		$(this).find('span').animate({'left':'-=10','paddingLeft':'+=10','paddingRight':'+=10','opacity':'0'},300);
		$(this).find('a').addClass('active');
	},function(){
		$(this).find('span').animate({'left':'+=10','paddingLeft':'-=10','paddingRight':'-=10','opacity':'1'},300);
		if (!$(this).hasClass('active')) $(this).find('a').removeClass('active');
	});

    $nav.click(function(event){
        event.preventDefault();
        
        init = false;
        var target = $(this).attr('rel');
        $nav.each(function(index){
            var $item = $(this);
            $item.find('a').andSelf().removeClass('active');
            var offset = $item.outerWidth() - (420 - $item.position().left),
                delay = index * 100;

            setTimeout(function(){ 
                $item.animate({'left':'-=' + offset},500); 
            },delay);
        });

        $(this).find('a').andSelf().addClass('active');
        showPart(target);
    });

    function showPart(target) {
        $('.current-part').animate({left:'-500px'},600,function(){
            $(this).removeClass('current-part');
            $('.'+target).addClass('current-part').animate({left:'0'},600);
        });
    }

    var workCount = $('.work-list > li').length,
        initCount = 0, 
        lock = false;

    $('.work-nav img').click(function(){
        if (lock) { return false; }
        lock = true;

        var $current = $('.work-show .current'),
            up = $(this).hasClass('up') ? true : false,
            move = up? $current.outerHeight(true) : $current.prev('li').outerHeight(true),
            moveFlag = up ? '-=' : '+=';

        $('.work-list').animate({top:moveFlag + move + 'px'},500,function(){
            initCount = up? initCount + 1 : initCount - 1;
            
            $('.work-part img').css('visibility','visible');
            if (initCount == workCount - 1) {
                $('.work-part .up').css('visibility','hidden');
            }
            if (initCount == 0) {
                $('.work-part .down').css('visibility','hidden');
            }

            $current.removeClass('current');
            up? $current.next('li').addClass('current') : $current.prev('li').addClass('current');
            lock = false;    
        });
    });

    $('.work-list').delegate('a','click',function(){
        var $item = $(this);
        if ($item.hasClass('lightbox')) {
            $box = $item.next('.view-detail').find('a');
            $box.lightBox({fixedNavigation:true});
            $box.first().trigger('click');
        }
    });

    $('.quotations-list li').hover(function(){
        $(this).animate({'backgroundColor':'#333','color':'#fff'},400);
    },function(){
        $(this).animate({'backgroundColor':'#ddd','color':'#333'},400);
    });

})