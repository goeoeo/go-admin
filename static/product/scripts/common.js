//扩展jquery,将表单值转化为json,可转换二维数组
$.fn.extend({
    serializeJson:function () {
        var value=this.serializeArray();
        var returnValue={};
        var key='';
        $.each(value,function (k,v) {
            if('name' in v){
                var pos=v.name.indexOf('[]');
                //获得键
                key=pos>0?v.name.substring(0,pos):v.name;

                if(key!=v.name){
                    //数组
                    returnValue[key]=returnValue[key]||[];

                    returnValue[key].push(v.value);
                }else{
                    returnValue[key]=v.value;
                }
            }
        });

        return JSON.stringify(returnValue);
    }
});





/**
 * 添加从输入法参数
 * @param param
 */
function appendCsrfParams(fromJsonData) {
    var csrfParam=($('meta[name="csrf-param"]').attr('content'));
    var csrfToken=($('meta[name="csrf-token"]').attr('content'));
    fromJsonData=JSON.parse(fromJsonData);

    fromJsonData[csrfParam]=csrfToken;

    return fromJsonData;
}

/**
 * 加载表单页面
 * @param params={
 *     url:'',
 *     title:'',
 *     postUrl:'',
 * }
 */
function layerFrom(params) {

    //默认提交接口为请求页面的接口
    params['postUrl'] || (params['postUrl']=params.url);
    //通过get请求页面数据
    $.get(params.url,function(page) {
        layer.open({
            type: 1,
            area: [params.width?params.width:'430px', params.height?params.height:''],
            shadeClose: false, //点击遮罩关闭
            title:params.title?params.title:'信息',
            content: page,
            skin:'layer-custom',
            btn: [params.btn1?params.btn1:'确认提交', params.btn2?params.btn2:'返回列表'],
            yes: function(){
                //表单数据
                var formData;
                //提交数据
                if (params.file) {
                    //文件上传
                    formData=new FormData($('.layer-form')[0]);
                }else {
                    formData=appendCsrfParams($('.layer-form').serializeJson());
                }

                //ajax参数
                var ajaxParams={
                    method:'post',
                    url:params.postUrl,
                    data:formData,
                    success:function(data){
                        if(data.code){
                            //操作失败
                            var errMsg=$('.layer-form .err-msg');
                            if(errMsg.length>0){
                                errMsg.html('<div class="ejecttips">'+data.msg+'</div>\n')
                            }else{
                                //弹出页面
                                layer.closeAll();
                                MsgBox.ERROR(data.msg,function (index) {
                                    layer.close(index);
                                    if (data.data.flush) {
                                        location.reload();
                                    }
                                });
                            }



                        }else{
                            //操作成功
                            //弹出页面
                            layer.closeAll();
                            MsgBox.OK(data.msg,function (index) {
                                layer.close(index);
                                location.reload()
                            });
                        }
                    }
                };

                //文件上传参数设置
                if (params.file) {
                    ajaxParams['processData']=false;
                    ajaxParams['contentType']=false;
                }

                $.ajax(ajaxParams);



            },
            btn2: function(index, layero){
                //按钮【按钮二】的回调

                //return false 开启该代码可禁止点击该按钮关闭
            }
        });
    })
}



/**
 * 设置url的参数
 * @param url
 * @param arg
 * @param arg_val
 * @returns {*}
 */
function changeURLArg(url,arg,arg_val){

    if(url.match('[\?]+'+arg+'=([^&]*)')){
        //匹配到第一个
        tmp=url.replace(eval('/[\?]+'+ arg+'=[^&]*/gi'),'?'+arg+'='+arg_val);
    }else if(url.match('&'+arg+'=([^&]*)')){
        tmp=url.replace(eval('/[&]+'+ arg+'=[^&]*/gi'),'&'+arg+'='+arg_val);
    }else{
        if(url.match('[\?]')){
            tmp= url+'&'+arg+'='+arg_val;
        }else{
            tmp=  url+'?'+arg+'='+arg_val;
        }
    }

    return tmp;
}


/**
 * 无刷新改变浏览器地址
 * @param url
 */
function pushUrl(url) {
    var stateObject = {
        url:url
    };
    var title = "";
    history.pushState(stateObject,title,url);
}



/**
 * post提交参数
 * @param string postUrl    例如："/index/index?id=1&name=demo"
 * @param string redirect   例如："/index/index?id=1&name=demo"
 * @param array data        例如：{id:1, name:"demo"}
 * @param int timeout       例如：1000
 */
function ajaxSubmit(params) {
	var ajaxPost = $.ajax({
		type: "POST",
		url: params.postUrl,
		timeout : params.timeout?params.timeout:5000, //超时时间设置，单位毫秒
		data: params.data?appendCsrfParams(JSON.stringify(params.data)):appendCsrfParams($('.layer-form').serializeJson()),
		dataType: "json",
		success: function (data) {
		    //关闭加载层
            if(data.code){
				//失败
	            if(typeof(data.msg) == "string"){
		            var errMsg = $('.err-msg');
		            if(errMsg.length > 0){
			            errMsg.html('<div class="ejecttips3">' + data.msg + '</div>\n');
		            } else {
			            //弹出页面
			            layer.closeAll();
			            MsgBox.ERROR(data.msg,function (index) {
                            layer.close(index);
                            if (data.data.flush) {
                                location.reload();
                            }

                        });
		            }
	            }else if(typeof(data.msg)=="object"){

		            $(".ejecttips2").html('');
		            //$(".ejecttips3").html('');
		            $.each(data.msg,function(key,value){
			            //console.log(key+": "+value)
			            $("#err_"+key).html(value);
		            });
                }else{
		            //弹出页面
		            layer.closeAll();
		            MsgBox.ERROR("操作失败！");
	            }
			} else {
				//成功
				layer.closeAll();
				MsgBox.OK('',function (index) {
				    layer.close(index);
                    if (params.redirect) {
                        window.location.href=params.redirect;
                    } else {
                        location.reload();
                    }
                });
			}
		},
		error: function (XMLHttpRequest, textStatus, errorThrown) {

		},
		complete : function(XMLHttpRequest, status){ //请求完成后最终执行参数
			if(status=='timeout'){//超时,status还有success,error等值的情况
				ajaxPost.abort();
				layer.closeAll();
				MsgBox.ERROR("请求超时！");
			}
		}
	});
}


/**
 * Keep对象,用于实时修正输入
 */
function makeKeep() {
    return new Object({
        value:null,
        oldValue:null,
        setValue: function (value) {
            this.value=value;
            return this
        },
        getValue: function () {
            this.oldValue=this.value;
            return this.value;
        },
        intNumber:function (min=null,max=null) {

            this.value=this.value.replace(/\D/g,'');

            if(max!=null && this.value>max)this.value=max;
            if(min!=null && this.value<min)this.value=min;
            return this;
        },
        string:function (max=null) {

            if(max!=null && this.value.length>max){
                this.value=this.value.substring(0,max);
            }

            return this;

        },
        mac:function () {
            this.string(17);

            this.value=this.value.replace(/[^\w\-]/g,'');

            var v = this.value.replace(/-/g, '');

            if (v.length > 2 && this.oldValue.length<this.value.length) {
                this.value = v.replace(/(.{2})/g, "$1-");
            }

            this.value=this.value.toUpperCase();

            return this
        },
        ip:function () {

            var strArr=[];

            this.value=this.value.replace(/[^\d.]/g,'');

            if (this.value.indexOf(".")!==-1) {
                //含点
                 strArr = this.value.split(".");

                var rightVal=strArr[strArr.length-1];

                if (rightVal.length > 3) {
                    strArr[strArr.length-1]=rightVal.substring(0,3);
                    if (strArr.length < 4) {
                        strArr.push(rightVal.substring(3,4));
                    }
                }



            }else{
                strArr.push(this.value.substring(0,3));

                if (this.value.length > 3) {
                    strArr.push(this.value.substring(3,4));
                }
            }

            for (var i = 0; i < strArr.length; i++) {
                strArr[i]=strArr[i]>255?255:strArr[i]
            }


            this.value=strArr.join(".");

            return this
        }
    });

}

/**
 * 消息盒子对象
 */
function makeMsgBox() {
    return new Object({
        OK: function (msg,yes) {
            msg || (msg = "操作成功!");
            yes = yes || null;

            if (!yes) {
                yes=function (index, layero) {
                    layer.close(index);
                    //location.reload();
                }
            }

            layer.open({
                type: 1,
                area: ['430px', ''],
                shadeClose: false, //点击遮罩关闭
                title: '提示信息',
                content: ' <div class="ejectok">\n' +
                    '        <img src="/images/ico05.gif" alt="">\n' +
                    '        <span>'+msg+'</span>\n' +
                    '    </div>',
                skin: 'layer-custom',
                btn: ['确认'],
                yes:yes
            });
        },

        ERROR: function (msg,yes) {
            msg || (msg = "操作失败!");
            yes = yes || null;

            if (!yes) {
                yes=function (index) {
                    layer.close(index);
                }
            }

            layer.open({
                type: 1,
                area: ['430px', ''],
                shadeClose: false, //点击遮罩关闭
                title: '提示信息',
                content: ' <div class="ejectno">\n' +
                    '        <img src="/images/ico06.gif" alt="">\n' +
                    '        <span>'+msg+'</span>\n' +
                    '    </div>',
                skin: 'layer-custom',
                btn: ['确认'],
                yes: yes
            });
        },

        CONFIRM: function (msg, callback) {
            callback = callback || null;

            layer.open({
                type: 1,
                area: ['430px', ''],
                shadeClose: false, //点击遮罩关闭
                title:'提示信息',
                content: ' <div class="ejectts">\n' +
                    '        <img src="/images/ico07.gif" alt="">\n' +
                    '        <span>'+msg+'</span>\n' +
                    '    </div>',
                skin:'layer-custom',
                btn: ['确认', '取消'],
                yes: function(index, layero){
                    layer.close(index);
                    if (callback){
                        callback();
                    }
                }, btn2: function(index, layero){
                    //按钮【按钮二】的回调
                    //return false 开启该代码可禁止点击该按钮关闭
                }
            });
        }
    })
}
