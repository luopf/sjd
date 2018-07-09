$(function(){

    let host = getJSurl();
    // 获取验证码按钮点击事件

    $(".phone-vertify").click(function () {
        let phone = $("#phone").val();
        if(phone == '' || phone == null || phone == undefined){
            alert("请填写手机号");
            return false;
        }
        alert("短信发送成功！");

        $.ajax({
            url:host+'/index.php/front/user/sendsSms',
            type:"post",
            data:{"phone":phone},
            dataType:"json",
            complete:function(){

            },
            success:function(json,statusText){
                if(json.errorCode == 0){// 短信发送成功
                    let code = json.data;
                    let smsInput = $("#smsCode");
                    smsInput.val(code);
                } else {
                    responseTip(1,"短信发送失败！",2000);
                }
            },
            error:errorResponse
        });
    });




    $(".register-btn").click(function () {
        let phone = $("#phone").val();
        let vertify = $("#vertify").val();
        let user_name = $("#user_name").val();
        let password = $("#password").val();

        let repassword = $("#re-password-area").val();
        let company = $("#company").val();

        let company_id = $("#company_id").val();

        let smsCode = $("#smsCode").val();

        if(phone == '' || phone == null || phone == undefined){
            alert("请填写手机号");
            return false;
        }
        if(vertify == '' || vertify == null || vertify == undefined){
            alert("请填写短信验证码");
            return false;
        } else {

            if(vertify != smsCode){
                alert("验证码错误！");
                return false;
            }

        }


        if(user_name == '' || user_name == null || user_name == undefined){
            alert("请填写姓名");
            return false;
        }
        if(company_id == '' || company_id == null || company_id == undefined){
            alert("请填写公司名称");
            return false;
        }
        if (password == '' || password == null || password == undefined){
            alert("请填写密码");
            return false;
        }
        if (repassword == '' || repassword == null || repassword == undefined){
            alert("请填写再次输入密码");
            return false;
        }
        if (repassword != password){
            alert("两次填写的密码不一致");
            return false;
        }



        $.ajax({
            url:host+'/index.php/front/user/userRegister',
            type:"post",
            data:{"phone":phone,"password":password,'user_name':user_name,'company':company,'company_id':company_id},
            dataType:"json",
            beforeSend:function(xhr){
                //显示“加载中。。。”

            },
            complete:function(){
                //隐藏“加载中。。。”


            },
            success:function(json,statusText){
                if(json.errorCode == 0){// 注册成功跳到登录页
                    window.location.href = host+"/index.php/front/user/loginPage";
                } else {// 注册失败
                    responseTip(1,json.errorInfo,2000);
                }
            },
            error:errorResponse
        });

    });



})