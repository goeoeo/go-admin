$(function () {

    //消息盒子对象
    window.MsgBox = makeMsgBox();

    //Onkeyup,验证对象
    window.Keep=makeKeep();


    var pageTimer = {} ; //定义计算器全局变量

    //主页面
    var indexcon=$('.index .indexcon');

    //一级菜单
    $('.top .topmenu li').on('click',function () {
        var url=$(this).children('a').first().attr('url');


        //选中
        $(this).parent('ul').children('li').removeClass('topa3');
        $(this).addClass('topa3');

        redirect(url,1);

        //默认选中第一个
        $('.left .leftnav a').first().parent('li').addClass('now');

    });

    //点击二级菜单,a标签
    indexcon.on('click', 'a', function () {

        var url = $(this).attr('href');
        var _pjax=2;

        if (url === 'javascript:;' || url==='javascript:void(0)') {
            return false;
        }

        if(typeof ($(this).attr('_pajx')) !="undefined"){
            _pjax=$(this).attr('_pajx');
        }

        //选中
        $(this).parent('li').parent('ul').children('li').removeClass('now');
        $(this).parent('li').addClass('now');

        redirect(url,_pjax);

        //阻止a标签跳转
        return false;
    });


    //select
    indexcon.on('change','select[_pajx]',function() {
        var url=$(this).find("option:selected").attr('url');
        redirect(url);

    });

    //表单提交
    indexcon.on('submit','form[_pajx]',function () {

        url = $(this).attr('action') || location.href;

        formData=JSON.parse($(this).serializeJson());


        $.each(formData,function (k,v) {
            url=changeURLArg(url,k,v);
        });

        redirect(url);

        return false;
    });

    //修改密码,点击验证码
    indexcon.on('click','#w0-image',function () {
        var w_image = $(this);

        var url = w_image.attr('src');

        url = changeURLArg(url, 'refresh', '');

        $.get(url,function (res) {
            w_image.attr('src', res.url);
        });
    });

    //输入限制监听
    indexcon.on("input propertychange","input[keep]",function () {
        var fun=$(this).attr("keep");

        fun=fun.replace("[","(").replace("]",")");

        var str="Keep.setValue($(this).val())."+fun+".getValue()";

        var res=eval("(0 || "+str+")");

        $(this).val(res)
    });



    //监听前进后退
    window.addEventListener('popstate', function(event){

        if (event.state && typeof (event.state.url) != "undefined") {
            location.href=event.state.url;
        }else{
            location.reload();
        }
    });


    /**
     * ajax跳转
     * @param url
     * @param _pajx
     */
    function redirect(url,_pajx) {
	    _pajx = _pajx || 2;

	    if(!url){
		    return;
	    }

        pageUrl = changeURLArg(url, '_pajx', _pajx);
        pushUrl(url);

        $.get(pageUrl,function (page) {


            //关闭loading层
            layer.closeAll();

            if (page.code) {
                MsgBox.ERROR(page.msg,function (index) {
                    layer.close(index);
                    history.go(-1);
                });

            }else{
                if (pageUrl.indexOf('_pajx=2')>-1) {
                    //内容页面
                    $('.indexcon .right-body-content').html(page);
                }else{
                    //左侧菜单+内容页面
                    indexcon.html(page);

                }

            }

        });
    }

    //ajax拦截器
    $( document ).ajaxError(function( event, response ) {

        if (response.status === 401) {
            for(var k in pageTimer){
                clearTimeout(pageTimer[k]);
            }
            //需要重新登录
            MsgBox.ERROR('请重新登录',function (index) {
                layer.close(index);
                location.href='/login/index'
            });
        }

    });

    //设置loading
    $(document).ajaxStart(function(){

        //1秒后服务器未响应,弹起加载层
        pageTimer['loadingOpen']=setTimeout(function () {
            layer.load(1, {
                shade: [0.1,'#fff'] //0.1透明度的白色背景
            });
        },1000);
    }).ajaxStop(function(){
        //清除定时器
        clearTimeout(pageTimer['loadingOpen']);

    });



});


