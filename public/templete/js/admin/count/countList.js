$(function(){
    var host = getJSurl();
    var total = 1;//分页总页面数
    var total_count = 1;//分页总记录数
    var currentPage = 1;//当前页
    var pageSize = pageOption.pageSize;//每页显示的记录数

    function init(){
        myPagination();
        bindEvent();
    }

    function bindEvent(){

        $('#import_btn').click(function() {

            var selectInfo = getSelectInfo();
            selectInfo.pageIndex = currentPage;
            selectInfo.pageSize = pageSize;
            // $.ajax(
            //     {
            //         type: "get",
            //         url: host+"/index.php/admin/count/importExcel",
            //         data: selectInfo,
            //         dataType: "json",
            //         success: function (json) {
            //
            //         },
            //         error: errorResponse
            //     })

            var data = $.param(selectInfo);
            window.location.href = host+"/index.php/admin/count/importCompanyExcel?"+data;
        });


    	$(".right-section #updateHeadImg").click(function(){
            $.ajax(
                {
                    type:"post",
                    url:"./admin.php?c=base_user&a=groupFans",
                    beforeSend:function(xhr){
                        //显示“加载中。。。”
                        $("#loading").modal('show');
                    },
                    data:{},
                    dataType:"json",
                    success:function(json,jsonText){
                        if(json.errorCode == 0){
                            var groupCount = json.data;//分组数量
                        	for(var i = 1; i <= groupCount;i++){//批量导入老粉丝
                        		$.ajax(
				                {
				                    type:"post",
				                    url:"./admin.php?c=base_user&a=asynGroupFansImg",
				                    data:{"batch":i,"groupCount":groupCount},
				                    dataType:"json",
				                    success:function(json,jsonText){
				                    	if(json.errorCode == 0){
				                    		//某一次的同步完成  不提醒，避免骚扰用户
				                    	}else if(json.errorCode == 1){
				                    		responseTip(1,json.errorInfo);
								        }else if(json.errorCode == 3){//每次同步成功，不提示，避免干扰用户
								        	responseTip(0,"同步完成！");
								        	render(true,currentPage,pageSize);
								        }
				                    },
				                    error:errorResponse
				                    
				                });
                        	}
                        }else{
                        	responseTip(1,json.errorInfo);
                        }
                    },
                    complete:function(){
                        //隐藏“加载中。。。”
                        $("#loading").modal('hide');
                    },
                    error:errorResponse
                }
            );
        });


        /**
         * 模糊查询事件
         *
         */
        $(".inner-section .search-param-panel .search-btn").click(function(){
           render(true,1,pageSize);
        });
        //enter事件
        $(".inner-section .search-area input").keydown(function(event){
            event = event ? event:window.event;
            if(event.keyCode == 13){
                render(true,1,pageSize);
            }
        });

        //查看用户详情

        //删除
        $(".inner-section .delete").click(function(){
            var id = $(this).attr("data-id");
            myConfirmModal("确定删除吗？",function(){
                $.ajax({
                    url:"./admin.php?c=base_user&a=deleteUser",
                    type:"post",
                    data:{"id":id},
                    dataType:"json",
                    beforeSend:function(xhr){
                        //显示“加载中。。。”
                        $("#loading").modal('show');
                    },
                    complete:function(){
                        //隐藏“加载中。。。”
                        $("#loading").modal('hide');
                    },
                    success:function(json,statusText){
                        if(json.errorCode == 0){
                            if(currentPage !=1 && total_count % pageSize == 1){//非首页且末页记录数为1时
                                currentPage = currentPage - 1;
                            }
                            render(true,currentPage,pageSize);
                        }else{
                            responseTip(json.errorCode,json.errorInfo,1500);
                        }
                    },
                    error:errorResponse
                });
            });

        });
    }

    /**
     * 查看用户详情
     */
    function countDetail(){
        var id = $(this).attr("data-id");
        window.location.href = host+'/index.php/admin/count/countDetail/cid/'+id;
    }
    /***
     * 删除公司
     * */
    function deleteCompany () {
        var id = $(this).attr("data-id");
        myConfirmModal("确定删除吗？",function(){
            $.ajax({
                url:host+"./index.php/admin/Company/deleteCompany",
                type:"post",
                data:{"id":id},
                dataType:"json",
                beforeSend:function(xhr){
                    //显示“加载中。。。”
                    $("#loading").modal('show');
                },
                complete:function(){
                    //隐藏“加载中。。。”
                    $("#loading").modal('hide');
                },
                success:function(json,statusText){
                    if(json.errorCode == 0){
                        if(currentPage !=1 && total_count % pageSize == 1){//非首页且末页记录数为1时
                            currentPage = currentPage - 1;
                        }
                        render(true,currentPage,pageSize);
                    }else{
                        responseTip(json.errorCode,json.errorInfo,1500);
                    }
                },
                error:errorResponse
            });
        });
    }

    /**
     * 密码重置
     */
    function restPwd(){
        var id = $(this).attr("data-id");
        $.ajax({
            url:"./admin.php?c=base_user&a=resetPassword",
            type:"post",
            data:{"id":id},
            dataType:"json",
            success:function(json,statusText){
                if(json.errorCode == 0){

                    responseTip(json.errorCode,"恭喜您，操作成功！",1500,function(){render(true,currentPage,pageSize);});

                }else{
                    responseTip(json.errorCode,json.errorInfo,1500);
                }
            },
            error:errorResponse
        });
    }
    /**
     * 案例分页显示方法
     */
    function myPagination(){
        render(true,1,pageSize);
        //调用公共分页方法
        pagination("#page-selection",{pageSize:pageSize,total:total},render);

    }
    /**
     * 获取模糊参数
     */
    function getSelectInfo(){

        var company_id = $.trim($(".inner-section .search-param-panel #company_id").val());
        var selectInfo = {
            "company_id":company_id,
        };
        return selectInfo;
    }
    /**
     * 分页动态渲染数据
     * @param async ajax请求是否异步
     * @param pageIndex 当前显示页
     * @param pageSize 每页显示记录数
     */
    function render(async,pageIndex,pageSize){
        var selectInfo = getSelectInfo();
        selectInfo.pageIndex = pageIndex;
        selectInfo.pageSize = pageSize;
        $.ajax({
            async:async,
            type:'post',
            url:host+'/index.php/admin/Count/pagingCount',
            data:selectInfo,//从1开始计数
            dataType:'json',
            success:function(result){
                var html ='';
                if(result.errorCode == 0){
                    total = result.data.pageInfo.total_page;
                    total_count = result.data.pageInfo.total_count;
                    let current_page = parseInt(result.data.pageInfo.current_page);
                    $("#page-selection").bootpag({total:total,total_count:total_count});//重新计算总页数,总记录数

                    currentPage = result.data.pageInfo.current_page;
                    var userList = result.data.dataList;

                    html+='<tr><th class="th1">序号</th><th class="th3">公司名称</th><th class="th10">参与人数</th><th class="th10">平均得分</th><th class="th10">当前排名</th><th class="th11">操作</th></tr>';
                    var colspan = $(html).find("th").length;
                    for(var i = 0; i < userList.length;i++){
                        var obj = userList[i];
                        var number = (pageIndex - 1)*pageSize + i + 1;//序号

                        var company_name = obj.company_name?obj.company_name:"--"; // 公司名
                        var people_nums = obj.people_nums ? obj.people_nums:0;// 公司人数
                        var avg_score = obj.avg_score ? obj.avg_score : 0;// 平均分
                        var id = obj.company_id;// 公司id
                        var index = (current_page -1)*10+(i+1);// 当前排名
                        html+='<tr>'
                        		+'<td>'+number+'</td>'
                        		+'<td><span class="limit-text" title="'+name+'">'+company_name+'</span></td>'
                                +'<td>'+people_nums+'</td>'
                        		+'<td>'+avg_score+'</td>'
                                +'<td>'+index+'</td>'
                        		+'<td>'
                        			+'<a href="javascript:;" class="count-detail btn btn-xs btn-primary" data-id="'+id+'">查看</a>'
                                    // +'<a href="javascript:;" class="btn btn-xs delete btn-danger" data-id="'+id+'">删除</a>'
                        		+'</td>'
                    		+'</tr>';
                    }
                    if(userList.length == 0){
                        html += '<tr><td colspan="'+colspan+'"><p class="text-danger">暂无数据。</p></td></tr>';
                    }
                    $(".inner-section #list-table tbody").html(html);
                    $(".count-detail").click(countDetail);
                    $(".delete").click(deleteCompany);
                    $(".reset-pwd").click(restPwd);

                }else{
                    responseTip(result.errorCode,json.errorInfo,1500);
                }

            },
            error:errorResponse
        });
    }
    init();
});