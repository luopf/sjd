$(function(){
    var host = getJSurl();
    var total_count = 1;//总记录数
    var total = 1;//分页总页面数
    var currentPage = 1;//当前页
    var pageSize = pageOption.pageSize;//每页显示的记录数
    var materialList = [];//被选中的材料题id集合
    var questionList = [];//被选中的普通题目id集合
    function init(){
        myPagination();
        bindEvent();
    }

    function bindEvent(){
        //导入
        $(".right-section .import-excel").click(function(){
            $(this).next().find("input").click();
        });
        $(".right-section .operation-div #file").change(function(){
            var filepath=$(this).val();
            var extStart=filepath.lastIndexOf(".");
            var ext=filepath.substring(extStart,filepath.length).toLowerCase();
            if(ext!=".xls" && ext!=".xlsx"){
                alert("文件格式不正确，仅限于excel，请下载模板！");
                return false;
            }
            //上传文件，填入excel
            $(".right-section #improtExcelForm").ajaxSubmit($.extend(true,{},formOptions,myFormOptions));
        });
        /**
         * 模糊查询事件
         *
         */
        $(".inner-section .search-button").click(function(){
            render(true,1,pageSize);
        });
        $(".inner-section .search-param-panel select").click(function(){
            render(true,1,pageSize);
        })
        //enter事件
        $(".search-param-panel input").keydown(function(event){
            event = event ? event:window.event;
            if(event.keyCode == 13){
                render(true,1,pageSize);
            }
        });

        //分级联动查找科目
        $('.right-section .inner-section #category_id').change(function(){
            var cid = $(this).val();

            $.ajax({
                async:true,
                type:'post',
                url:'./admin.php?c=ex_question&a=getSubject',
                data:{'cid':cid},//从1开始计数
                dataType:'json',
                success:function(result,statusText){
                    if(result.errorCode == 0){
                        var subject_id = document.getElementById('subject_id');
                        //清空数组
                        subject_id.length = 0;
                        var sid='';
                        var svalue='全部';
                        var option=new Option(svalue,sid);
                        subject_id.add(option);
                        for(var i=0;i<result.data.length;i++){
                            var sid=result['data'][i].id;
                            var svalue=result['data'][i].name;
                            var option=new Option(svalue,sid);
                            subject_id.add(option);
                        }
                    }else{
                        $("#myModal .modal-body").html("<p class='text-danger'>"+result.errorInfo+"</p>");
                        $("#myModal").modal('show');
                        //定时器，1.5秒后模态框自动关闭
                        setTimeout(function(){
                            $("#myModal").modal('hide');
                        },1500);
                    }
                },
                error:errorResponse
            });
        });

        //批量删除
        $(".inner-section .deletebatch").click(function(){
            var material_ids = $("#materialIds").val();
            var question_ids = $("#questionIds").val();
            if(material_ids == "" && question_ids == ""){
                $("#myModal .modal-body").html("<p class='text-danger'>您尚未选择要删除的选项，请先选择！</p>");
                $("#myModal").modal('show');
                //定时器，1.5秒后模态框自动关闭
                setTimeout(function(){
                    $("#myModal").modal('hide');
                },1500);
            }else{
                myConfirmModal("确定要批量删除题目记录吗？",function(){
                    $.ajax({
                        url:"./admin.php?c=ex_question&a=deleteBatchQuestion",
                        type:"post",
                        data:{"material_ids":material_ids,"question_ids":question_ids},
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
                                var length = $(".inner-section #list-table tbody tr").length - materialList.length - questionList.length;
                                if(currentPage != 1 && length % pageSize == 1){
                                    currentPage = currentPage - 1;
                                }
                                $("#ids").val('');//批量删除后让隐藏域的值为空
                                idList = [];//初始化idList的值
                                render(true,currentPage,pageSize);
                            }else{
                                responseTip(1,json.errorInfo);
                            }
                        },
                        error:errorResponse
                    });
                });
            }
        });
    }

    /**
     * 提交添加信息的表单配置
     */
    var  myFormOptions={
        url:'./admin.php?c=ex_question&a=importQuestion',
        success:function(json,statusText){
            if(json.errorCode == 0){
                $("#myModal .modal-body").html("<p class='text-success'>导入成功</p>");
                $("#myModal").modal('show');
                //定时器，1.5秒后模态框自动关闭
                setTimeout(function(){
                    $("#myModal").modal('hide');
                },2000);
                render(true,currentPage,pageSize);
            }else{
                $("#myModal .modal-body").html("<p class='text-danger'>"+json.errorInfo+"</p>");
                $("#myModal").modal('show');
                render(true,currentPage,pageSize);
            }
        },
        error:errorResponse
    };

    /**
     * 分页显示方法
     */
    function myPagination(){
        render(true,1,pageSize);
        //调用公共分页方法
        pagination("#page-selection",{total:total,pageSize:pageSize},render);

    }

    /***
     * 全选事件
     */
    function selectAll(){
        var boxs = $("#list-table input.select-single");//所有商品记录
        //被选中
        if($(this).prop("checked")){
            boxs.prop("checked",true);//复选框全部选中
            boxs.parent().addClass("checked");
            boxs.each(function(){
                if($(this).attr("data-type") == 5){
                    if(materialList.indexOf($(this).val()) < 0){//idList中不包含当前id值，则加入
                        materialList.push($(this).val());
                    }
                }else{
                    if(questionList.indexOf($(this).val()) < 0){//idList中不包含当前id值，则加入
                        questionList.push($(this).val());
                    }
                }

            });
        }else{
            //全部取消
            boxs.prop("checked",false);//复选框全部取消选中
            boxs.parent().removeClass("checked");
            //从idList数组中删除当前id
            boxs.each(function(){
                if($(this).attr("data-type") == 5){
                    var index = materialList.indexOf($(this).val());
                    if(index >= 0){//idList中包含当前id值，则删除
                        materialList.splice(index,1);
                    }
                }else{
                    var index = questionList.indexOf($(this).val());
                    if(index >= 0){//idList中包含当前id值，则删除
                        questionList.splice(index,1);
                    }
                }
            });
        }
        $("#materialIds").val(materialList.join(","));//将当前选中的material主键写入value中
        $("#questionIds").val(questionList.join(","));//将当前选中的question主键写入value中
    }

    /***
     * 单选事件
     */
    function selectSingle(){
        if($(this).prop("checked")){//单选选中时
            if($(this).attr("data-type") == 5){
                if(materialList.indexOf($(this).val()) < 0){//material	List中不包含当前id值，则加入
                    materialList.push($(this).val());
                }
            }else{
                if(questionList.indexOf($(this).val()) < 0){//questionList中不包含当前id值，则加入
                    questionList.push($(this).val());
                }
            }
            if($(this).parents("#list-table").find(".select-single").length == $(this).parents("#list-table").find(".select-single:checked").length){
                //所有复选框都选中时，将全选复选框置为选中状态
                $(this).parents("#list-table").find(".select-all").prop("checked",true);
                $(this).parents("#list-table").find(".select-all").parent().addClass("checked");
            }
        }else{//单选复选框取消选中时
            //从数组中删除当前id
            if($(this).attr("data-type") == 5){
                var index = materialList.indexOf($(this).val());
                if(index >= 0){//materialList中包含当前id值，则删除
                    materialList.splice(index,1);
                }
            }else{
                var index = questionList.indexOf($(this).val());
                if(index >= 0){//questionList中包含当前id值，则删除
                    questionList.splice(index,1);
                }
            }
            $(this).parents("#list-table").find(".select-all").prop("checked",false);
            $(this).parents("#list-table").find(".select-all").parent().removeClass("checked");
        }
        $("#materialIds").val(materialList.join(","));//将当前选中的material主键写入value中
        $("#questionIds").val(questionList.join(","));//将当前选中的question主键写入value中
    }

    /**
     * 删除单条记录
     */
    function deleteOne(){
        var ids = $(this).attr("data-id");
        var type = $(this).attr("data-type");
        if(type != 5){
            var delete_link = host+'/index.php/admin/question/deleteQuestion';
        }else{
            var delete_link = "./admin.php?c=ex_material&a=deleteMaterial";
        }
        var parent = $(this).parent();
        myConfirmModal("确定要删除该题目吗？",function(){
            $.ajax({
                url:delete_link,
                type:"post",
                data:{"ids":ids},
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
                        var length = $(".inner-section #list-table tbody tr").length - 1;
                        if(currentPage !=1 && length % pageSize == 1){
                            currentPage = currentPage - 1;
                        }
                        render(true,currentPage,pageSize);
                    }else{
                        responseTip(1,json.errorInfo);
                    }
                },
                error:errorResponse
            });
        });
    }
    /**
     * 去除html标签
     */
    function delHtmlTags(str)
    {
        var words = '';
        words = str.replace(/<[^>]+>/g,"");
        return words;
    }
    /**
     * 获取模糊参数
     */
    function getSelectInfo(){
        var label_id = $.trim($("#label_id").val());
        var subject_id = $.trim($("#subject_id").val());
        var category_id = $.trim($("#category_id").val());
        var type = $.trim($("#type").val());
        var info = $.trim($("#info").val());
        var selectInfo = {
            "label_id":label_id,
            "subject_id":subject_id,
            "cid":category_id,
            "type":type,
            "info":info
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
            url:host+'/index.php/admin/question/pagingQuestion',
            data:selectInfo,//从1开始计数
            dataType:'json',
            success:function(result){
                var html ='';
                if(result.errorCode == 0){

                    total_count = result.data.pageInfo.total_count;
                    total = result.data.pageInfo.total_page;
                    $("#page-selection").bootpag({total:total,total_count:total_count});//重新计算总页数
                    currentPage = result.data.pageInfo.current_page;
                    var list = result.data.dataList;

                    html+='<tr><th class="th1"><input type="checkbox" class="select-all my-icheckbox"></th><th class="th2">序号</th><th class="th3">问题描述</th><th class="th4">类型</th><th class="th9">添加时间</th><th class="th10">操作</th></tr>';
                    var thLength = $(html).find('th').length;
                    for(var i = 0; i < list.length;i++){
                        var obj = list[i];
                        var number = (pageIndex - 1)*pageSize + i + 1;//序号
                        var type = obj.type;
                        var typeText = (type == 1)?'单选题':(type == 2)?'多选题':(type == 3)?'判断题':(type == 4)?'填空题':(type == 5)?'计算分析题':(type == 6)?'案例分析题':'不定项选择';
                        var info = (type != 5)?obj.info:delHtmlTags(obj.info);
//                        var label_id = obj.label_id;
//                        var label_name = obj.label_name;
                        var subject_name = obj.subject_name;
                        var category_name = obj.category_name ? obj.category_name : "--";
                        var subject_id = obj.subject_id;
                        var add_time = obj.add_time;
                        var id = obj.id;
                        if(type != 5){
                            var checked = ($.inArray(id,questionList) >= 0) ? "checked":"";//判断当前记录先前有没有被选中
                        }else{
                            var checked = ($.inArray(id,questionList) >= 0) ? "checked":"";//判断当前记录先前有没有被选中
                        }

                        html+='<tr>'
                            +'<td><input type="checkbox" class="select-single my-icheckbox" data-type="'+type+'" value="'+id+'" '+checked+'></td>'
                            +'<td>'+number+'</td>'
                            +'<td><a class="limitName" title="查看详情">'+info+'</a></td>'
                            +'<td>'+typeText+'</td>'

                            +'<td>'+add_time+'</td>'
                            +'<td><a class="btn btn-xs btn-primary edit" href="'+host+'/index.php/admin/question/editQuestion?id='+id+'">编辑</a><a href="javascript:;" class="btn btn-default btn-xs delete" data-type="'+type+'" data-id="'+id+'"">删除</a></td>'
                            +'</tr>';
                    }
                    if(list.length == 0){
                        html += '<tr><td colspan="'+thLength+'"><p class="text-danger">查询结果为空。</p></td></tr>';
                    }
                    $(".inner-section #list-table tbody").html(html);
                    //单条删除
                    $(".inner-section .delete").click(deleteOne);
                    //全选事件
                    myCheck();
                    $(".select-all").on("ifChecked",selectAll);
                    $(".select-all").on("ifUnchecked",selectAll);
                    $(".select-single").on("ifChecked",selectSingle);
                    $(".select-single").on("ifUnchecked",selectSingle);

                }else{
                    responseTip(1,result.errorInfo);
                }
            },
            error:errorResponse
        });
    }
    init();
});