(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
     } else if (typeof exports === 'object')
    {
        // Node/CommonJS
        factory(require('jquery'));
    }else{
        // Browser globals
        factory(jQuery);
    }
}
(function ($) {
    'use strict';
   var pluginName = "pageScroll",
    settings = {
        anchorBar:$('.anchormenu'),
        anchorLi:'li',
        tolerantHeight:300,
        positionHeight:0,
        fullScreen:false //如果是page就是滚动一屏
    };
  function Plugin($container,options){
        var setting = $.extend({},settings,options),
        el = $container,
        $win = $(window),
        $doc = $(document),
        canScroll = true,//约束scroll事件在点击的时候触发
        t = null,
        index = 0,
        scrolllist = [],
        anchorli = setting.anchorBar.find(setting.anchorLi),
        scrolltype = setting.shape ? 'top':'scrollTop',
        wrapdom = setting.shape ? $('.scrollwrap') : $('html,body'),
        olddate =0;
        var readyAction = {
            start:function(){
                if(setting.shape) this.creatwrap();
                this.prepare();
            },
            creatwrap:function(){
                el.wrap('<div class="scrollchild"></div>');
                $.each($('.scrollchild'),function(i,item){
                    $(item).css({
                      position:'absolute',
                      top:i*$(window).height(),
                      height:'100%',
                      width:'100%'
                  })
                })
            },
            prepare:function(){
                $.each(el,function(i,item){
                    var h = setting.shape ? i*$win.height() : item.offsetTop,
                    obj = {item:i,height:h};
                    scrolllist.push(obj);
                });
                $.each(anchorli,function(i,item){
                    $(item).attr('data-scrollnum',i);
                    $(item).on('click',scrollTo);
                });
            }
        }
        function scrollTo(){
            canScroll = false;
            $('html,body').stop(true,true);
            index = $(this).data('scrollnum');
            animateTo(index);
        }
        function animateTo(index){
            anchorli.eq(index).addClass('cur').siblings().removeClass('cur');
            var top = scrolllist[index].height-setting.positionHeight;
            top = setting.shape ? -top+'px' :top+'px';
            wrapdom.animate(animateObj(scrolltype,top),'swing',function(){setTimeout(function(){canScroll=true;},20)}); 
        }
        function animateObj(scrolltype,top){
            var obj = {};
            obj[scrolltype] = top;
            return obj;
        }
        function scrollResponse(){
            if(t){clearTimeout(t); t = null}
            t = setTimeout(function(){
                $.each(scrolllist,function(i,obj){
                    var iheight = obj.height,index = obj.item;
                    if($doc.scrollTop()+$win.height()-setting.tolerantHeight>iheight && $doc.scrollTop()<iheight){
                        anchorli.eq(index).addClass('cur').siblings().removeClass('cur');
                    }
                });
            },20);
        }
        function scrollFull(delta){
            var newdate = new Date().getTime();
            if(newdate-olddate<1000) return;
            if(delta<0){
                if(index<scrolllist.length-1){
                    index++;
                }else{
                    return;
                }
            }else{
                if(index>0){
                    index--;
                }else{
                    return;
                }
            }
            animateTo(index);
            olddate = newdate;
        }
        readyAction.start();
        if(!setting.shape){
            $win.scroll(function(e){
                if(!canScroll) return;
                scrollResponse();  
            });
        }else{
            $doc.bind('mousewheel DOMMouseScroll MozMousePixelScroll', function(event) {
                if(!canScroll) return;
                 event.preventDefault();
                var delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;
                scrollFull(delta);
            });
        }

    }
     $.fn[pluginName] = function(options)
    {
        if(!$.data(this, "plugin_" + pluginName))
        {
            $.data(this, "plugin_" + pluginName, new Plugin($(this), options));
        }
    };

}));
