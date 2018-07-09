$(function() {
    var host = getJSurl();
    $(".addCompany").click(function () {
        let name = $("#name").val();
        if(name == null || name == '' || name == undefined){
                responseTip(1,'请输入公司名称',1000);
                return false;
        }
        $.ajax(
            {
                type:"post",
                url:host+"/index.php/admin/Company/addCompany",
                data:{"name":name},
                dataType:"json",
                success:function (res) {
                    if(res.errorCode == 0){
                        responseTip(0,"添加成功",1000,function () {
                            window.history.go(-1);
                        })
                    }
                },
                error:errorResponse

            });
    });

})