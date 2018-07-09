$(function(){

    var host = getJSurl();
    /**
     * 页面初始化
     */
    var unicode = $(".content .content-info-list .content-info .select").last().text().charCodeAt(0);
    var result_obj = $(".content .right-section .select-type:checked");

    function init(){
        //显示题型
        renderType();
        //显示该题型下的状态
       // getResult(result_obj,1);

        bindEvent();
    }

    /**
     * 事件绑定
     */
    function bindEvent(){
        //点击弹出框，输入答案
        $('.content #myForm .content-info .select-label').bind('click',function(){
            var _this = $(this);
            $('#bindEntryDialog #myContent #select_answer').val('');
            $('#bindEntryDialog').attr('select_obj', $(this).attr('id'));
            $('#bindEntryDialog').attr('is_answer','1');
            $('#bindEntryDialog #myContent #select_answer').html(_this.attr('select_content'));
            $('#bindEntryDialog').addClass('in').attr('aria-hidden','false').css('display','block');
        });
        $('.content #myForm .btn-question-edit').bind('click',function(){
            var _this = $(this);
            $('#bindEntryDialog #myContent #select_answer').val('');
            $('#bindEntryDialog').attr('select_obj', $(this).prev().attr('id'));
            $('#bindEntryDialog').attr('is_answer','0');
            $('#bindEntryDialog #myContent #select_answer').html(_this.prev().html());
            $('#bindEntryDialog').addClass('in').attr('aria-hidden','false').css('display','block');
        });
        $('#bindEntryDialog .modal-footer .save_btn').click(function(){
            saveSelect($(this));
        });
        //关闭弹窗
        $('#bindEntryDialog .close,#bindEntryDialog .modal-footer .cancel_btn').bind('click',function(){
            $('#bindEntryDialog').removeClass('in').attr('aria-hidden','true').css('display','none');
            $(this).parent().prev().find('#myContent #select_answer').html('');
        });

        //分级联动查找科目
        $('.right-section .inner-section #cid').change(function(){
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

        //表单的JQueryValidater配置验证---jquery.validate插件验证法
        $("#myForm").validate(validateInfo);

        /*******************************标签操作************************/
        //select标签选择
        $('#subject_id').change(function(){
            if($(this).find("option:selected").val() != ''){
                renderType();
            }else{
                $(".question-type").text('');
            }
        })
        //显示标签页面
        $(".select-label-button").click(function(){
            render();
            $("#bindLabelDialog").addClass('in');
            $("#bindLabelDialog").attr('aria-hidden','false');
            $("#bindLabelDialog").css('display','block');
        })
        //添加事件
        $(".add-label").click(function(){
            $(this).addClass('hidden');
            $(".save-label").removeClass('hidden');
            $(".quit-label").removeClass('hidden');
            $(".add-label-content").attr('type','text');
        });
        //取消事件
        $(".quit-label").click(function(){
            $(this).addClass('hidden');
            $(".save-label").addClass('hidden');
            $(".add-label").removeClass('hidden');
            $(".add-label-content").attr('type','hidden').val('');
        });
        //保存事件
        $(".save-label").click(addLabel);

        /*******************************选择题操作************************/
        //添加选项(选择题)
        $(".add-select-content").click(addSelect);
        //删除选项(选择题)
        $(".delete-select-content").click(deleteSelect);

        //修改科目
        $('#save').click(function() {
            updateQuestion();
        });
    }
    // 过滤html 标签
    function removeHTMLTag(str) {
        str = str.replace(/<\/?[^>]*>/g,''); //去除HTML tag
        str = str.replace(/[ | ]*\n/g,'\n'); //去除行尾空白
        //str = str.replace(/\n[\s| | ]*\r/g,'\n'); //去除多余空行
        str=str.replace(/&nbsp;/ig,'');//去掉&nbsp;
        return str;
    }
    /**
     * 保存操作
     */
    function saveSelect(_this){
        var select_id = _this.parents('#bindEntryDialog').attr('select_obj');
        var is_answer = _this.parents('#bindEntryDialog').attr('is_answer');
        var content = _this.parent().prev().find('#myContent #select_answer').html();
        content = removeHTMLTag(content);
        if(is_answer == 0){
            $(".content #myForm #"+select_id).html(content);
        }else{
            $(".content #myForm .content-info .info #"+select_id).attr('select_content',content);
            $(".content #myForm .content-info .info #"+select_id).attr('value',content);

        }
        $('#bindEntryDialog').removeClass('in').attr('aria-hidden','true').css('display','none');
        $(_this).parent().prev().find('#myContent #select_answer').html('');
    }

    /**
     * 增加选择题选项事件
     */
    function addSelect(){
        unicode = 65 + $(this).parents(".content-info").find(".info").length;
        var select_content = getInfo(unicode);
        $(this).parents(".select-content").find('.info').last().after(select_content);
        //点击弹出框，输入答案
        $('.content #myForm .content-info .select-label').bind('click',function(){
            var _this = $(this);
            $('#bindEntryDialog #myContent #select_answer').val('');
            $('#bindEntryDialog').attr('select_obj', $(this).attr('id'));
            $('#bindEntryDialog #myContent #select_answer').html(_this.attr('select_content'));
            $('#bindEntryDialog').addClass('in').attr('aria-hidden','false').css('display','block');
        });
        //删除选项
        $(".delete-select-content"+unicode).one("click",deleteSelect);
        getResult(result_obj,2);
    }

    /**
     * 删除选择题选项事件
     */
    function deleteSelect(){
        if($(this).parents(".content-info").find(".info").length != 1){
            unicode--;
            $(this).parents(".info").remove();
            getResult(result_obj,2);//显示结果选项
            var code = 65;//显示成A、B、C的标志
            $(".content-info").find(".info").each(function(){
                $(this).find(".select").text(String.fromCharCode(code));
                code ++;
            })
        }
    }

    /**
     * 与之前的type保持一致
     */
    function sureType(){
        var ago_type = $(".content .ago-type").val();
        $(".content .question-type .select-type").each(function(){
            if($(this).val() == ago_type){
                $(this).attr('checked','checked');
            }
        });
    }
    /**
     * 选择标签事件
     */
    function selectLabel(){
        $(".labelName").text($(this).attr('data-name'));
        $(".label_name").val($(this).attr('data-name'));
        $(".label_id").val($(this).attr('data-id'));
    }

    /**
     * 获取题目类型
     */
    function getType(){
        var _this = $(".content .right-section .select-type:checked");
        $(".content-info-list .select-content").removeClass('hidden');
        $(".write-info").addClass('hidden');//隐藏提示
        if(_this.val() == 1 || _this.val() == 2 || _this.val() == 7){
            $(".content .content-info-list .content-info").removeClass('hidden');
        }else if(_this.val() == 3 || _this.val() == 4){
            if(_this.val() == 4){
                $(".write-info").removeClass('hidden');//显示提示
            }
            $(".content .content-info-list .content-info").addClass('hidden');
        }
        $(".score").val(_this.parents(".label-span").find('.subject-score').text());
        getResult(_this,1);
    }

    /**
     * 选择科目事件
     */
    function selectSubject(){
        $(".subjectName").text($(this).attr('data-name'));
        $(".subject_name").val($(this).attr('data-name'));
        $(".subject_id").val($(this).attr('data-id'));
    }

    /**
     * 获取添加选项的html
     */
    function getInfo(num){
        num = $.trim(num.toString());
        var select_content = '<div class="info down"><span class="select">'+String.fromCharCode(num)+'</span>.&nbsp;<input type="text" class="select-label" id="select_'+num+'" readonly><a class="btn btn-default btn-sm delete-select-content'+unicode+' delete-down">删除</a></div>';
        return select_content;
    }

    /**
     * 添加标签
     */
    function addLabel(){
        var _this = $(this);
        $.ajax({
            async:true,
            type:'post',
            url:'./admin.php?c=ex_question&a=insertLabel',
            data:{'name':$(".add-label-content").val()},//从1开始计数
            dataType:'json',
            success:function(result,jqXHR){
                if(result.errorCode == 0){
                    _this.addClass('hidden');
                    $(".quit-label").addClass('hidden');
                    $(".add-label").removeClass('hidden');
                    $(".labelName").text($(".add-label-content").val());
                    $(".add-label-content").attr('type','hidden').val('');

                    $(".label_name").val($(".add-label-content").val());
                    $(".label_id").val(result.data);
                    $(".label_name").val($(".labelName").text());
                }else{
                    responseTip(1,result.errorInfo);
                }
            },
            error:errorResponse
        });
    }
    /**
     * 答案填法1单选2多选3判断4填空7不定项
     */
    function getResult(_this,num){

        var result_html = '';
        if(num == 1){
            var type_value = _this.val();
        }else{
            var type_value = $(".content .right-section .select-type:checked").val();
        }

        var code = 65;//显示选择题结果A/B/C 的标志
        if(type_value == 1){
            $(".content .content-info .select").each(function(){
                result_html += '<span class="label-span"><label><input type="radio" name="select-result" class="select-result my-iradio" value="'+String.fromCharCode(code)+'">'+String.fromCharCode(code)+'</label></span>';
                code ++;
            })
        }else if(type_value == 2 || type_value == 7){
            $(".content .content-info .select").each(function(){
                result_html += '<span class="label-span"><label><input type="checkbox" name="select-result" class="select-result my-iradio" value="'+String.fromCharCode(code)+'">'+String.fromCharCode(code)+'</label></span>';
                code ++;
            })
        }else if(type_value == 3){
            result_html += '<span class="label-span"><label><input type="radio" name="select-result" class="select-result my-iradio" value="1">正确</label></span>'
                +'<span class="label-span"><label><input type="radio" name="select-result" class="select-result my-iradio" value="0">错误</label></span>';
        }else if(type_value == 4){
            result_html += '<input type="text" name="write-result" class="write-result" value="">';
        }
        console.log(result_html);


        $(".content .right-section .result-content").html(result_html);
        console.log(result_html);

        myiCheck(".content .inner-section .result-content .my-iradio");
        if($('.ago-result').val() != ''){
                        if(type_value == 1 || type_value == 3){
                            $(".select-result").each(function(){
                                if($(this).val() == $('.ago-result').val()){
                                    $(this).prop('checked',true);
                                    $(this).parent().addClass('checked');
                                }
                            });
                        }else if(type_value == 4){
                            $(".write-result").val($('.ago-result').val());
                        }else if(type_value == 2 || type_value == 7){
                            $(".select-result").each(function(){
                                var index = $('.ago-result').val().indexOf($(this).val());
                                if(index > -1){
                        $(this).prop('checked',true);
                        $(this).parent().addClass('checked');
                    }
                });
            }
        }
    }


    /**
     * 获取content数据
     */
    function getContentJson(){
        if($(".content .select-type:checked").val() == 1 || $(".content .select-type:checked").val() == 2 || $(".content .select-type:checked").val() == 7){
            var contentList = [];
            $(".content .select-content .content-info .info").each(function(){
                var select = $(this).find('.select').text();
//    			var select_content = $(this).find('.select-label').val();
                var select_content = $(this).find('.select-label').attr('select_content');
                var content={'select':select,'select_content':select_content};
                contentList.push(content);
            });
            $("#content").val(JSON.stringify(contentList));
        }
    }

    /**
     * 获取答案
     */
    function getResultInfo(){
        var result_value = '';
        if($(".content .select-type:checked").val() != 4){
            $(".content .select-result:checked").each(function(){
                result_value += ','+$(this).val();
            })
            result_value = result_value.substring(1);
        }else{
            result_value = $(".content .write-result").val();
        }
        $("#result").val(result_value);
    }

    /**
     * 添加科目
     */
    function updateQuestion(){
        //判断选择题选项是否填满
        $(".content .verify-content").val('true');
        if($(".content .right-section .select-type:checked").val() == 1 || $(".content .right-section .select-type:checked").val() == 2){
            $(".content .content-info .select-label").each(function(){
                if($(this).val() == ''){
                    $(".content .verify-content").val('');
                    return false;
                }
            })
        }

        getContentJson();
        getResultInfo();

        //（修改提交题目及解析数据）
        var $_info = $('.content #myForm #question-desc').html();
        var $_analysis = $('.content #myForm #question-analysis').html();
        $('.content #myForm #info').val($_info);
        $('.content #myForm #analysis').val($_analysis);

        $("#myForm").ajaxSubmit($.extend(true,{},formOptions,myFormOptions));
    }
    /**
     * 验证表单错误信息
     */
    function verifyError(text){
        $("#myModal .modal-body").html("<p class='text-danger'>"+text+"</p>");
        $("#myModal").modal('show');
        setTimeout(function(){
            $("#myModal").modal('hide');
        },1000);
    }

    /**
     * 提交修改科目信息的表单配置
     */
    var  myFormOptions={
        url:host+'/index.php/admin/question/updateQuestion',
        success:successResponse,
        error:errorResponse
    };

    //表单验证信息
    var validateInfo ={
        rules:{
            info:{
                required:true
            },
            verify_content:{
                required:true
            },
            subject_id:{
                required:true
            },
            score:{
                required:true
            },
            result:{
                required:true
            }
        },
        messages:{
            info:{
                required:"请输入描述"
            },
            verify_content:{
                required:"选项填写不完善"
            },
            subject_id:{
                required:"请选择科目"
            },
            score:{
                required:"请选择题型"
            },
            result:{
                required:"请填写答案"
            }
        },
        errorPlacement:function(error,element){

            element.parents('td').siblings('td').last().append(error);
        }
    };
    /**
     * 单选复选框调用样式的方法
     */
    function myiCheck(obj){
        $(obj).iCheck({
            checkboxClass:"icheckbox_minimal-blue",//颜色主题需要与引入的css保持一致
            radioClass:"iradio_minimal-blue",//颜色主题需要与引入的css保持一致
            cursor:true
        });
    }
    function successResponse(json,statusText){
        if(json.errorCode == 0){
            responseTip(json.errorCode,"恭喜您，操作成功！",1500,function(){window.history.go(-1);});
        }else{
            responseTip(json.errorCode,json.errorInfo,1500);
        }
    }

    /**
     * 弹出框label列表渲染
     */
    function render(){
        $.ajax({
            async:true,
            type:'post',
            url:'./admin.php?c=ex_question&a=getLabelList',
            data:'',//从1开始计数
            dataType:'json',
            success:function(result){
                var html ='';
                if(result.errorCode == 0){
                    var list = result.data;
                    for(var i = 0; i < list.length;i++){
                        var obj = list[i];
                        var name = obj.name;
                        var add_time = obj.add_time;
                        var id = obj.id;
                        var checked = (id == $(".label_id").val())?'checked':'';
                        html+='<div class="label-span-list">'
                            +'<label><input type="radio" name="select_label" class="select_label my-iradio" data-name="'+name+'" data-id="'+id+'" '+checked+'>'+name+'</label>'
                            +'</div>';
                    }
                    if(list.length == 0){
                        html += '<p class="text-danger">查询结果为空。</p>';
                    }
                    $("#bindLabelDialog .table-content").html(html);
                    //input框加样式之后的操作
                    myCheck();
                    $(".select_label").on("ifChecked",selectLabel);
                    $(".select_label").on("ifUnchecked",selectLabel);
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
    }
    /**
     * 题目类型渲染
     */
    function renderType(){
        var id = $(".ago-type").val();

                    $(".select_label").click(selectLabel);
                    sureType();
                    getType();
                    //点击事件
                    myCheck();
                    $(".select-type").on("ifChecked",getType);
                    $(".select-type").on("ifUnchecked",getType);
//                        $(".select-type").click(getType);

    }
    init();

});