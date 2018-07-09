$(function(){

    let host = getJSurl();
    $(".login-btn-area").click(function () {
        let phone = $("#phone").val();
        let password = $("#password").val();
        if(phone == '' || phone == null || phone == undefined){
            alert("请填写手机号");
            return false;
        }
        if (password == '' || password == null || password == undefined){
            alert("请填写密码");
            return false;
        }
        // 发送登录验证请求
        $.ajax({
            url:host+'/index.php/front/user/userLogin',
            type:"post",
            data:{"phone":phone,"password":password},
            dataType:"json",
            beforeSend:function(xhr){
                //显示“加载中。。。”

            },
            complete:function(){
                //隐藏“加载中。。。”

            },
            success:function(json,statusText){

                if(json.errorCode == 0){
                    window.location.href = host+"/index.php/front/index/homePage";
                } else {// 数据库没有查找到用户信息跳转到注册页
                    window.location.href = host+"/index.php/front/user/userRegisterPage";
                }
            },
            error:errorResponse
        });

    });

    $(".register-btn-area").click(function () {
        window.location.href = host+"/index.php/front/user/userRegisterPage";
    });



})