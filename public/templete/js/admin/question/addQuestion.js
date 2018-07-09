$(function(){
    var host = getJSurl();
    /**
     * 页面初始化
     */
    var unicode = 65;
    var result_obj = $(".content .right-section .select-type:checked");
    var tihao_num = 0;//题号标志
    var sign_num = 1;//会计科目标志

    function init(){
        bindEvent();
    }

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

    /**
     * 事件绑定
     */
    function bindEvent(){
        renderType();
        //点击弹出框，输入答案
        $('.content #myForm .other-description .content-info .select-label').bind('click',function(){
            var _this = $(this);
            $('#bindEntryDialog #myContent #select_answer').val('');
            $('#bindEntryDialog').attr('select_obj', $(this).attr('id'));
            $('#bindEntryDialog').attr('is_answer','1');
            $('#bindEntryDialog #myContent #select_answer').html(_this.attr('select_content'));
            $('#bindEntryDialog').addClass('in').attr('aria-hidden','false').css('display','block');
        });
        $('#myForm .btn-question-edit').bind('click',function(){

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
        /*************************模糊查询事件***************************/
        $(".inner-section .search-button").click(function(){
            renderEntry();
        });
        $("#left_cate_id").change(function(){
            renderEntry();
        });
        //enter事件
        $(".search-param-panel input").keydown(function(event){
            event = event ? event:window.event;
            if(event.keyCode == 13){
                renderEntry();
            }
        });
        //分级联动查找科目
        $('.right-section .inner-section #cid').change(function(){
            var cid = $(this).val();

            $.ajax({
                async:true,
                type:'post',
                url:host+'/index.php/admin/question/insertQuestion',
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

        })


        /*******************************标签操作*****************************/
        //select标签选择
        $('#subject_id').click(function(){
            if($(this).find("option:selected").val() != ''){
                renderType();
            }else{
                $(".question-type").text('');
                $(".select-content,.result-content,textarea[name='analysis']").addClass("hidden")
            }
        })
        //显示标签页面
        $(".select-label-button").click(function(){
            render();
            $("#bindLabelDialog").addClass('in').attr('aria-hidden','false').css('display','block');
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

        /*************************************选择题操作*************************/
        //添加选项(选择题)
        $(".add-select-content").click(addSelect);
        //删除选项(选择题)
        $(".delete-select-content").click(deleteSelect);

        /*************************************计算分析题操作*************************/
        //添加分录(计算分析题)
        $(".add-fenlu").click(addFenlu);
        //添加填空(计算分析题)
        $(".add-empty").click(addEmpty);
        //添加选择(计算分析题)
        $(".content .add-select").click(addMaterialSelect);
        //计算分析题中增加选择题选项
        $(".content .right-section .material-select-content .material-add-select").click(function(){
            $(this).parents(".material-select-list").append($(this).parents(".material-info").next().clone(true,true).removeClass("hidden").addClass('down'));
            $(this).parents(".material-select-list").find(".material-info").last().find(".select").text(String.fromCharCode(64+$(this).parents(".material-info").siblings(".material-info").length));
            //更新答案选项A、B、C...
            var _parents = $(this).parents(".option-list");
            updateMaterialResult(_parents);
        });
        //计算分析中删除选择题选项
        $(".content .right-section .material-select-content .material-del-select").click(function(){
            var _this = $(this);
            var _parents = $(this).parents(".option-list");
            $(this).parents(".material-info").remove();
            //该小题中的每个选项ABCD重新排序
            var result_code = 65;
            _parents.find(".material-info").not(".hidden").each(function(){
                $(this).find(".select").html(String.fromCharCode(result_code));
                result_code ++;
            });
            //更新答案选项A、B、C...
            updateMaterialResult(_parents);
        })

        /************************************案例分析题*****************************/
        //添加一个案例小题
        $(".content .right-section #case-result-content .add-case-question").click(function(){
            $(this).parents("#case-result-content").append($(this).parent().next().clone(true,true));
            $(".content .right-section #case-result-content .case-result-content-list").last().removeClass('hidden').addClass('down');
            myiCheck($(this).parents("#case-result-content").find(".case-result-content-list:last .my-iradio"));
        })
        //删除一个案例小题
        $(".content .right-section #case-result-content .del-case-question").click(function(){
            $(this).parents(".case-result-content-list").remove();
        })
        //案例小题中增加选择题选项
        $(".content .right-section #case-result-content .case-add-select").click(function(){
            $(this).parents(".case-content-info").append($(this).parents(".case-info").next().clone(true,true).removeClass("hidden").addClass('down'));
            $(this).parents(".case-content-info").find(".case-info").last().find(".select").text(String.fromCharCode(64+$(this).parents(".case-info").siblings(".case-info").length));
            //更新答案选项A、B、C...
            var _parents = $(this).parents(".case-content-info");
            updateCaseResult(_parents);
        });
        //案例小题中删除选择题选项
        $(".content .right-section #case-result-content .case-del-select").click(function(){
            var _this = $(this);
            var _parents = $(this).parents(".case-content-info");
            $(this).parents(".case-info").remove();
            //该小题中的每个选项ABCD重新排序
            var result_code = 65;
            _parents.find(".case-info").not(".hidden").each(function(){
                $(this).find(".select").html(String.fromCharCode(result_code));
                result_code ++;
            });
            //更新答案选项A、B、C...
            updateCaseResult(_parents);
        })




        //添加试题
        $('#save').click(function(){
            //表单的JQueryValidater配置验证---jquery.validate插件验证法
//        	if($(".content .right-section .select-type:checked").val() != 5){
//        		$("#myForm").validate(validateInfo);
//        	}else{
//        		$("#myForm").validate(validateInfo_material);
//        	}
            addQuestion();
        });

    }

    //------------------------添加按钮的html代码方法-----------------
    /**
     * 获取添加选项的html
     */
    function getInfo(num){
        var select_content = '<div class="info down"><span class="select">'+String.fromCharCode(num)+'</span>.&nbsp;<input type="text" class="select-label" id="select_'+$.trim(num)+'" readonly><a class="btn btn-default btn-sm delete-select-content'+unicode+' delete-down">删除</a></div>';
        return select_content;
    }

    /**
     * 获取添加分录的html
     */
    function fenluOption(tihao_num,sign_num){
        var fenlu_option = '<div class="option-list">'
            +'<div class="tihao">('+tihao_num+')</div>'
            +'<div class="material-delete-all"><a class="btn btn-danger btn-sm del-entry-question-'+sign_num+'">全删</a></div>'
            +'<div class="material-score"><input type="text" value="" class="score" placeholder="分值"></div>'
            +'<div class="contentInfo">'
            +'<div class="content-list">'
            +'<div class="typeInfo">借贷方向：<label><input type="radio" class="b-or-l-1 my-iradio" value="0" name="1-sort-'+sign_num+'">借</label>&nbsp;&nbsp;<label><input type="radio" value="1" class="b-or-l-1 my-iradio" name="1-sort-'+sign_num+'">贷</label></div>'
            +'<div class="entry">会计科目：<input type="text" readonly class="entry-name edit-entry" data-toggle="modal" data-target="#bindEntryDialog"><input type="hidden" class="entry-id"><a data-toggle="modal" data-target="#bindEntryDialog" class="btn btn-default btn-sm edit-entry">...</a></div>'
            +'<div class="money">金额：<input type="text" class="money-input"></div>'
            +'<div class="manage"><a class="btn btn-default btn-sm del-entry">删除</a><a class="btn btn-primary btn-sm add-entry'+tihao_num+'">添加</a></div>'
            +'</div>'
            +'<div class="content-list">'
            +'<div class="typeInfo">借贷方向：<label><input type="radio" class="b-or-l-2 my-iradio" value="0" name="2-sort-'+sign_num+'">借</label>&nbsp;&nbsp;<label><input type="radio" class="b-or-l-2 my-iradio" value="1" name="2-sort-'+sign_num+'">贷</label></div>'
            +'<div class="entry">会计科目：<input type="text" readonly class="entry-name edit-entry" data-toggle="modal" data-target="#bindEntryDialog"><input type="hidden" class="entry-id"><a data-toggle="modal" data-target="#bindEntryDialog" class="btn btn-default btn-sm edit-entry">...</a></div>'
            +'<div class="money">金额：<input type="text" class="money-input"></div>'
            +'<div class="manage"><a class="btn btn-default btn-sm del-entry">删除</a><a class="btn btn-primary btn-sm add-entry0'+tihao_num+'">添加</a></div>'
            +'</div>'
            +'<textarea class="analysis" placeholder="解析" style="height:50px;width:600px;resize:none;float:left;margin:5px 0px;"></textarea>'
            +'</div>'
            +'</div>';
        return fenlu_option;
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
     * 获取添加填空题的html
     */
    function emptyString(tihao_num,sign_num){
        var empty_html='<div class="option-list material-type-empty">'
            +'<div class="tihao">('+tihao_num+')</div>'
            +'<div class="material-delete-all"><a class="btn btn-danger btn-sm del-entry-question-'+sign_num+'">全删</a></div>'
            +'<div class="material-score"><input type="text" value="" class="score" placeholder="分值"></div>'
            +'<div class="contentInfo">'
            +'<div class="content-list">'
            +'<input type="text" value="" class="problem" placeholder="问题">'
            +'<input type="text" value="" class="key" placeholder="答案">'
            +'</div>'
            +'<textarea class="analysis" placeholder="解析" style="height:50px;width:600px;resize:none;float:left;margin:5px 0px;"></textarea>'
            +'</div>'
            +'</div>';
        return empty_html;
    }

    //--------------------------添加按钮的html代码函数完结--------------------------------
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
            $(".content #myForm .other-description .content-info .info #"+select_id).attr('select_content',content);
            $(".content #myForm .other-description .content-info .info #"+select_id).attr('value',content);
        }
        $('#bindEntryDialog').removeClass('in').attr('aria-hidden','true').css('display','none');
        $(_this).parent().prev().find('#myContent #select_answer').html('');
    }

    /**
     * 增加选择题选项事件
     */
    function addSelect(){
        unicode =65 + $(this).parents(".content-info").find(".info").length;
        var select_content = getInfo(unicode);
        $(this).parents(".select-content").find('.info').last().after(select_content);
        //点击弹出框，输入答案
        $('.content #myForm .other-description .content-info .select-label').bind('click',function(){
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
     * 更新题号（材料题）
     */
    function updateTihao(){
        var i = 1;//题号
        $("#material-result-content .option-list").each(function(){
            $(this).find(".tihao").text('('+i+')');
            i++;
        })
    }

    /**
     * 获得会计分录列表（材料题）
     */
    function getEntryList(){
        //显示会计科目页面
        $("#material-result-content .content-list.active").removeClass('active');
        $(this).parents(".content-list").addClass('active');
        renderEntry();
        $("#bindEntryDialog").addClass('in').attr('aria-hidden','false').css('display','block');
    }
    /**
     * 添加分录题（材料题）
     */
    function addFenlu(){
        tihao_num ++;
        sign_num ++;
        var fenlu_option = fenluOption(tihao_num,sign_num);
        $(".content .inner-section #material-result-content").append(fenlu_option);
        //添加单条分录
        $(".content .inner-section #material-result-content .add-entry"+tihao_num+",.add-entry0"+tihao_num).click(function(){
            sign_num ++;
            $(this).parents(".content-list").after($(this).parents(".content-list").clone(true,true));
            //修改克隆后的属性
            $(this).parents(".content-list").next().removeClass('active');//消除active状态
            $(this).parents(".content-list").next().find("input[type='text'],input[type='hidden']").val('');
            $(this).parents(".content-list").next().find(".b-or-l-1").each(function(){
                $(this).attr('name',"1-sort-"+sign_num);
            });
            $(this).parents(".content-list").next().find(".b-or-l-2").each(function(){
                $(this).attr('name',"2-sort-"+sign_num);
            });
            $(".content #material-result-content input[name='1-sort-"+sign_num+"'],input[name='2-sort-"+sign_num+"']").prop("checked",false);
            myiCheck(".content #material-result-content input[name='1-sort-"+sign_num+"'],input[name='2-sort-"+sign_num+"']");
        });
        //删除单条分录
        $(".content .inner-section #material-result-content .del-entry").click(function(){
            if($(this).parents(".contentInfo").find(".content-list").length == 1){
                $(this).parents(".option-list").remove();
                tihao_num --;
                updateTihao();//更新题号
            }else{
                $(this).parents(".content-list").remove();
            }
        });
        //删除该分录题
        $(".content .inner-section #material-result-content .del-entry-question-"+sign_num).click(function(){
            tihao_num --;
            $(this).parents(".option-list").remove();
            updateTihao();
        });
        myiCheck(".content #material-result-content .my-iradio[name='1-sort-"+sign_num+"'],input[name='2-sort-"+sign_num+"']");
        //点击弹出会计分录
        $(".content #material-result-content .edit-entry").click(function(){
            $(".content #material-result-content .content-list.active").removeClass('active');
            $(this).parents(".content-list").addClass('active');
            renderEntry();
        });
    }

    /**
     * 添加填空题（材料题）
     */
    function addEmpty(){
        tihao_num ++;
        sign_num ++;
        var empty_html = emptyString(tihao_num,sign_num);
        $(".content .inner-section #material-result-content").append(empty_html);
        //删除该填空题
        $(".content .inner-section #material-result-content .del-entry-question-"+sign_num).click(function(){
            tihao_num --;
            $(this).parents(".option-list").remove();
            updateTihao();
        });
    }

    /**
     * 添加选择题
     */
    function addMaterialSelect(){
        tihao_num ++;
        sign_num ++;
        $(".content #material-result-content .option-list.active").removeClass("active");
        $(".content .material-select-content .option-list .tihao").text('('+tihao_num+')');
        $(".content .material-select-content .option-list .material-delete-all").html('<a class="btn btn-danger btn-sm del-entry-question-'+sign_num+'">全删</a>');
        $(".content .inner-section #material-result-content").append($(".content .material-select-content .option-list").clone(true,true).addClass("active"));
        myiCheck(".content #material-result-content .option-list.active .material-select-result .select-result");
        //删除该填空题
        $(".content .inner-section #material-result-content .del-entry-question-"+sign_num).click(function(){
            tihao_num --;
            $(this).parents(".option-list").remove();
            updateTihao();
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
     * 选择会计分录事件
     */
    function selectEntry(){
        $("#material-result-content .content-list.active").find(".entry-name").val($(this).attr('data-name'));
        $("#material-result-content .content-list.active").find(".entry-id").val($(this).attr('data-id'));
    }

    /**
     * 获取题目类型
     */
    function getType(){
        $(".content #myForm tr td .testify_error").remove();
        if($(this).val() == 6){//案例分析题情况
            $(".content .inner-section .case-analysis,.case-question-description").removeClass("hidden");//案例分析题的标签
            $(".content .inner-section .other-description,.other-result,.other-analysis,.select-content").addClass("hidden");//除案例题型外公用的标签
            $(".content .inner-section .select-info,.material-button-select,#material-result-content").addClass("hidden");//案例分析题的标签
            $(".content .inner-section .content-info").addClass("hidden");//单多不选项标签
        }else if($(this).val() == 5){//计算分析题情况
            $(".content .inner-section .other-description,.other-result").removeClass("hidden");//除案例题型外公用的标签
            $(".content .inner-section .select-info,.material-button-select,#material-result-content").removeClass("hidden");//案例分析题的标签
            $(".content .inner-section .content-info,.select-content,.other-analysis").addClass("hidden");//客观题标签
            $(".content .inner-section .case-analysis,.case-question-description").addClass("hidden");//案例分析题的标签
        }else{//客观题情况
            $(".content .inner-section .other-description,.other-result,.other-analysis,.select-content").removeClass("hidden");//除案例题型外公用的标签
            $(".content .inner-section .case-analysis,.case-question-description").addClass("hidden");//案例分析题的标签
            $(".content .inner-section .select-info,.material-button-select,#material-result-content").addClass("hidden");//案例分析题的标签
            if($(this).val() == 1 || $(this).val() == 2 ||$(this).val() == 7){//单选多选不定项情况
                $(".content .inner-section .content-info").removeClass("hidden");//单多不选项标签
            }else if($(this).val() == 4 || $(this).val() == 3){//判断填空情况
                $(".content .inner-section .content-info").addClass("hidden");
            }
        }
        $(".ago-type").val($(this).val());
        $(".type-score").val($(this).parents(".label-span").find('.subject-score').text());
        var _this = $(this);
        getResult(_this,1);
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
     * 答案填法1单选2多选3判断4填空
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
                result_html += '<span class="label-span"><label><input type="radio" name="select-result" class="select-result my-iradio" value="'+String.fromCharCode(code)+'">&nbsp;'+String.fromCharCode(code)+'</label></span>';
                code ++;
            })
        }else if(type_value == 2 || type_value == 7){
            $(".content .content-info .select").each(function(){
                result_html += '<span class="label-span"><label><input type="checkbox" name="select-result" class="select-result my-icheckbox" value="'+String.fromCharCode(code)+'">&nbsp;'+String.fromCharCode(code)+'</label></span>';
                code ++;
            })
        }else if(type_value == 3){
            result_html += '<span class="label-span"><label><input type="radio" name="select-result" class="select-result my-iradio" value="1">&nbsp;正确</label></span>'
                +'<span class="label-span"><label><input type="radio" name="select-result" class="select-result my-iradio" value="0">&nbsp;错误</label></span>';
        }else if(type_value == 4){
            result_html += '<input type="text" name="write-result" class="write-result" value="">';
        }
        $(".content .right-section .result-content").html(result_html);
        if(type_value == 1 || type_value == 2 || type_value == 3 || type_value == 7){
            myiCheck(".content .result-content .my-iradio,.my-icheckbox");
        }
    }
    //--------------------------------案例分析题-----------------
    function updateCaseResult(_parents){
        var result_code = 65;
        var case_result_html = '';
        _parents.find(".case-info").not(".hidden").each(function(){
            case_result_html += '<span class="label-span"><label><input type="checkbox" name="case-result-checkbox" class="select-result my-icheckbox" value="'+String.fromCharCode(result_code)+'">&nbsp;'+String.fromCharCode(result_code)+'</label></span>';
            result_code ++;
        });
        _parents.parents(".case-result-content-list").find(".case-content-result").html(case_result_html);
        myiCheck(_parents.parents(".case-result-content-list").find(".my-icheckbox"));
    }

    /**
     * 更新选项结果
     */
    function updateMaterialResult(_parents){
        var result_code = 65;
        var case_result_html = '';
        _parents.find(".material-info").not(".hidden").each(function(){
            case_result_html += '<span class="label-span"><label><input type="checkbox" name="material-result-checkbox" class="select-result my-icheckbox" value="'+String.fromCharCode(result_code)+'">&nbsp;'+String.fromCharCode(result_code)+'</label></span>';
            result_code ++;
        });
        _parents.find(".material-select-result").html(case_result_html);
        myiCheck(_parents.find(".my-icheckbox"));
    }
    //--------------------------------获取数据------------------

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
     * 案例分析题的答案和content数据
     */
    function getCaseUploadJson(){
        var result_json = [];//答案数组
        var content_json = [];//内容数组
        var analysis_json = [];//解析数组
        var score = $(".content .inner-section .case-result-score .case-score").val();
        $(".content .inner-section #case-result-content .case-result-content-list").not(".hidden").each(function(){
            //解析
            var analysis_info = $(this).find("textarea[name='case-content-analysis-info']").val();
            analysis_json.push(analysis_info);
            //答案
            $(this).find(".case-content-result").each(function(){
                var result_info = ''
                $(this).find(".select-result:checked").each(function(){
                    result_info += $(this).val()+',';
                })
                result_json.push(result_info.substring(0,result_info.length-1));
            })
            //内容
            var content_list = {"score":score,"case_title":$(this).find("textarea[name='case-title-info']").val()}
            case_select_array = [];
            $(this).find(".case-content-info .case-info").not(".hidden").each(function(){
                var case_select_list = {select:$(this).find(".select").text(),select_content:$(this).find(".select-label").val()};
                case_select_array.push(case_select_list);
            });
            $.extend(true,content_list,{case_select:case_select_array});
            content_json.push(content_list);
        })

        $(".content .inner-section #result").val(JSON.stringify(result_json));
        $(".content .inner-section #content").val(JSON.stringify(content_json));
        $(".content .inner-section .other-analysis textarea[name='analysis']").val(JSON.stringify(analysis_json));

    }

    /**
     * 获取option的json数据
     */
    function getOptionJson(){
        var option_list = [];
        $(".content #material-result-content .option-list").each(function(){
            if($(this).hasClass("material-type-empty")){//填空
                var sublist = {'problem':$.trim($(this).find(".content-list .problem").val()),'result':$.trim($(this).find(".content-list .key").val()),'analysis':$.trim($(this).find(".analysis").val()),'score':$.trim($(this).find(".score").val()),'content':''};
                var option = {'type':0,'subList':sublist};
            }else if($(this).hasClass("material-type-select")){//选择题型
                var content = [];//选项
                $(this).find(".material-select-list .material-info").not(".hidden").each(function(){
                    var contentList = {'select':$(this).find(".select").text(),
                        'select_content':$(this).find(".select-label").val()};
                    content.push(contentList);
                });
                var result = '';//答案
                $(this).find(".material-select-result .select-result").each(function(){
                    if($(this).parent().hasClass("checked")){
                        result += $(this).val()+',';
                    }
                })
                result = result.substring(0,result.length - 1);
                var sublist = {'problem':$.trim($(this).find(".contentInfo .material-select-title").val()),
                    'result':result,
                    'analysis':$.trim($(this).find(".analysis").val()),
                    'score':$.trim($(this).find(".score").val()),
                    'content':content,
                };
                var option = {'type':3,'subList':sublist};
            }else{//分录
                var result = [];//整个小题中的多组借贷关系
                var result_list = [];//每小题中的单组借贷关系
                var i = 0;//标志一组借贷关系
                $(this).find(".contentInfo .content-list").each(function(){
                    var type = $(this).find(".typeInfo .checked input").val();	//0借1贷
                    var result_info = {'type':type,'entry_id':$(this).find(".entry-id").val(),'entry_name':$.trim($(this).find(".entry-name").val()),'money':$.trim($(this).find(".money-input").val())};
                    if(type == 0){//借
                        if(i == 1){
                            result.push(result_list);//将单组借贷关系插入到多组借贷关系中
                            result_list = [];//初始化单组借贷关系
                            i = 0;//新的一组借贷关系
                        }
                    }else if(type == 1){//贷
                        i = 1;
                    }
                    result_list.push(result_info);
                })
                result.push(result_list);//最后作为一组借贷关系插入
                var sublist = {'problem':'','result':result,'analysis':$.trim($(this).find(".analysis").val()),'score':$.trim($(this).find(".score").val()),'content':''};
                var option = {'type':1,'subList':sublist};
            }
            option_list.push(option);
        });
        $("#optionList").val(JSON.stringify(option_list));
    }

    /**
     * 重新获取题目类型(改变科目时整个内容的变化)
     */
    function verifyType(){
        if($(".ago-type").val() != ''){
            $(".select-type").each(function(){
                if($(this).val() == $(".ago-type").val()){
                    $(this).prop('checked',true);
                }
            });
            //不存在该题目类型时的状况
            var type_string = '';
            $(".select-type").each(function(){
                type_string += ',' + $(this).val();
            });
            var index = type_string.indexOf($(".ago-type").val());
            if(index == -1){
                $(".content .inner-section .case-analysis,.case-question-description").addClass("hidden");//案例分析题的标签
                $(".content .inner-section .other-description,.other-result,.other-analysis,.select-content").addClass("hidden");//除案例题型外公用的标签
                $(".content .inner-section .select-info,.material-button-select,#material-result-content").addClass("hidden");//案例分析题的标签
                $(".content .inner-section .content-info").addClass("hidden");//单多不选项标签
            }else{
                if($(".content .inner-section .ago-type").val() == 6){//案例分析题情况
                    $(".content .inner-section .case-analysis,.case-question-description").removeClass("hidden");//案例分析题的标签
                    $(".content .inner-section .other-description,.other-result,.other-analysis,.select-content").addClass("hidden");//除案例题型外公用的标签
                    $(".content .inner-section .select-info,.material-button-select,#material-result-content").addClass("hidden");//案例分析题的标签
                    $(".content .inner-section .content-info").addClass("hidden");//单多不选项标签
                }else if($(".content .inner-section .ago-type").val() == 5){//计算分析题情况
                    $(".content .inner-section .other-description,.other-result").removeClass("hidden");//除案例题型外公用的标签
                    $(".content .inner-section .select-info,.material-button-select,#material-result-content").removeClass("hidden");//案例分析题的标签
                    $(".content .inner-section .content-info,.select-content,.other-analysis").addClass("hidden");//客观题标签
                    $(".content .inner-section .case-analysis,.case-question-description").addClass("hidden");//案例分析题的标签
                }else{//客观题情况
                    $(".content .inner-section .other-description,.other-result,.other-analysis,.select-content").removeClass("hidden");//除案例题型外公用的标签
                    $(".content .inner-section .case-analysis,.case-question-description").addClass("hidden");//案例分析题的标签
                    $(".content .inner-section .select-info,.material-button-select,#material-result-content").addClass("hidden");//案例分析题的标签
                    if($(".content .inner-section .ago-type").val() == 1 || $(".content .inner-section .ago-type").val() == 2 ||$(".content .inner-section .ago-type").val() == 7){//单选多选不定项情况
                        $(".content .inner-section .content-info").removeClass("hidden");//单多不选项标签
                    }else if($(".content .inner-section .ago-type").val() == 4 || $(".content .inner-section .ago-type").val() == 3){//判断填空情况
                        $(".content .inner-section .content-info").addClass("hidden");
                    }
                }
            }
        }
    }
    /**
     * 验证表单错误信息
     */
    function verifyError(text){
        $("#myModal .modal-body").html("<p class='text-danger'>"+text+"</p>");
        $("#myModal").modal('show');
        setTimeout(function(){
            $("#myModal").modal('hide');
        },1500);
    }

    //-------------------------------渲染---------------------------------------
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
                    myiCheck("#bindLabelDialog .table-content .my-iradio");
                    $(".select_label").on("ifChecked",selectLabel);
                    $(".select_label").on("ifUnchecked",selectLabel);
                }else{
                    responseTip(1,result.errorInfo);
                }
            },
            error:errorResponse
        });
    }

    /**
     * 渲染题目类型列表
     */
    function renderType(){
                    verifyType();
//                    $(".select_label").click(selectLabel);
                    //点击事件
                    myiCheck(".question-type .my-iradio");
                    $(".select-type").on("ifChecked",getType);
                    $(".select-type").on("ifUnchecked",getType);
//                    $(".select-type").click(getType);
                    $(".content #myForm tr td .testify_error").remove();
    }

    /**
     * 弹出框entry列表渲染
     */
    function renderEntry(){
        $.ajax({
            async:true,
            type:'post',
            url:'./admin.php?c=ex_entry&a=findAllEntry',
            data:{'cate_id':$("#left_cate_id").val(),'name':$("#left_name").val(),'num':$("#left_num").val()},//从1开始计数
            dataType:'json',
            success:function(result){
                var html ='';
                if(result.errorCode == 0){
                    var list = result.data;
                    for(var i = 0; i < list.length;i++){
                        var obj = list[i];
                        var name = obj.name;
                        var num = obj.num;
                        var id = obj.id;
                        var checked = (id == $("#material-result-content .content-list.active").find(".entry-id").val())?'checked':'';
                        html+='<div class="label-span-list">'
                            +'<label><input type="radio" name="select_entry" class="select_entry my-iradio" data-name="'+name+'" data-id="'+id+'" '+checked+'>'+num+'&nbsp;&nbsp;'+name+'</label>'
                            +'</div>';
                    }
                    if(list.length == 0){
                        html += '<p class="text-danger">查询结果为空。</p>';
                    }
                    $("#bindEntryDialog .table-content").html(html);
                    //选择会计分录
                    myiCheck("#bindEntryDialog .table-content .label-span-list .my-iradio");
                    $(".select_entry").on("ifChecked",selectEntry);
                    $(".select_entry").on("ifUnchecked",selectEntry);
                }else{
                    responseTip(1,result.errorInfo);
                }
            },
            error:errorResponse
        });
    }

    //--------------------------------提交表单及配置----------------------------
    /**
     * 提交添加题目信息的表单配置（非材料题）
     */
    var  myFormOptions_question={
        url:host+'/index.php/admin/question/insertQuestion',
        success:function(result){
            if(result.errorCode == 0){
                tihao_num = 0;//题号标志
                sign_num = 100;//会计科目标志
                updateForm(unicode);
            }else{
                responseTip(1,result.errorInfo);
            }
        },
        error:errorResponse
    };
    /**
     * 提交添加题目信息的表单配置（计算分析题）
     */
    var  myFormOptions_material={
        url:'./admin.php?c=ex_material&a=insertMaterial',
        success:function(result){
            if(result.errorCode == 0){
                tihao_num = 0;//题号标志
                sign_num = 1;//会计科目标志
                updateForm(unicode);
            }else{
                responseTip(1,result.errorInfo);
            }
        },
        error:errorResponse
    };
    //表单提交后同步刷新
    function updateForm(unicode){
        $("#myModal .modal-body").html("<p class='text-success'>添加成功，继续添加</p>");
        $("#myModal").modal('show');
        //定时器，1.5秒后模态框自动关闭
        setTimeout(function(){
            $("#myModal").modal('hide');
        },1500);
        $("#save").text('继续添加');

        //非材料题原始状态
        $(".content .inner-section .select-type").iCheck('uncheck');//消除题型选择
        $(".content .inner-section .ago-type,.type-score").val('');//消除题型选择
        //提交后消除提示
        $(".content #myForm tr td .testify_error").remove();
        $(".content input[type=text]").val('');
        $(".content .inner-section textarea").val('');//文本域设置为空
        unicode = unicode - $(".content-info-list .info.down").length;
        $(".content-info-list .info.down").remove();//删除多余单、多、不定项选项
        $(".content .result-content,#material-result-content").text('');//客观题、计算分析题答案区

        $(".content .inner-section #result,#content,.score,.select-label").val('');

        $(".content .inner-section .select-content,.select-info").addClass('hidden');
        $(".select-info #info").text('');//计算分析题材料

        //案例分析题原始状态
        $(".content .inner-section .case-question-description input").val('');
        $(".content .inner-section .case-question-description .down").remove();
        $(".content .inner-section .case-question-description .case-content-result").html(
            '<span class="label-span"><label><input type="checkbox" name="case-result-checkbox" class="select-result my-icheckbox" value="A">&nbsp;A</label></span>');
        myiCheck(".content .inner-section .case-question-description .case-content-result .my-icheckbox");
        //用来判断是否填写的隐藏域
        $(".content .verify-content,.material_result_info,.case-description-info").val('');
        //统一的样式
        $(".content .inner-section .case-analysis,.case-question-description").addClass("hidden");//案例分析题的标签
        $(".content .inner-section .other-description,.other-result,.other-analysis,.select-content").addClass("hidden");//除案例题型外公用的标签
        $(".content .inner-section .select-info,.material-button-select,#material-result-content").addClass("hidden");//案例分析题的标签

        //全部置为空
        $('.content #myForm .other-description #question-desc').html('');
        $('.content #myForm .other-analysis #question-analysis').html('');
        $('#bindEntryDialog #myContent #select_answer').html('');
        $('.content #myForm .other-description .select-label').removeAttr('select_content');
        $(".content .inner-section .content-info").addClass("hidden");//单多不选项标签
    }

    function successResponse(json,statusText){
        if(json.errorCode == 0){
            responseTip(json.errorCode,"恭喜您，操作成功！",1500,function(){window.history.go(-1);});
        }else{
            responseTip(json.errorCode,json.errorInfo,1500);
        }
    }

    //表单验证信息
    var validateInfo ={
        rules:{
            subject_id:{
                required:true
            },
            score:{
                required:true
            }
        },
        messages:{
            subject_id:{
                required:"请选择科目"
            },
            score:{
                required:"请选择题型"
            }
        },
        errorPlacement:function(error,element){
            element.parents('td').siblings('td').last().append(error);
        }
    };

    /**
     * jquery 验证报错
     */
    function testifyError(str){
        return '<label class="testify_error"  generated="true" class="error">'+str+'</label>';
    }

    /**
     * 添加科目（验证）
     */
    function addQuestion(){
        $(".content #myForm tr td .testify_error").remove();
        //判断选择题选项是否填
        if($(".content .right-section .select-type:checked").val() != 6 && $(".content .right-section .select-type:checked").val() != 5){
            $(".content .verify-content").val('full');//初始状态
            if($(".content .right-section .select-type:checked").val() == 1 || $(".content .right-section .select-type:checked").val() == 2 || $(".content .right-section .select-type:checked").val() == 7){
                $(".content .content-info .select-label").each(function(){
                    if($(this).val() == ''){
                        $(".content .verify-content").val('');
                        return false;
                    }
                });
            }
            //上传所需
            getContentJson();
            getResultInfo();
            //插件验证
            $("#myForm").validate(validateInfo);
            //jquery验证
            if($(".content .inner-section textarea[name='info']").val() == '' || $(".content .inner-section input[name='verify_content']").val() == ''){
                $(".content .inner-section textarea[name='info']").parents('td').siblings('td').last().append(testifyError("描述填写不完善"));
            }
            if($(".content .inner-section input[name='result']").val() == ''){
                $(".content .inner-section input[name='result']").parents('td').siblings('td').last().append(testifyError("请填写答案"));
            }
            if($(".content #myForm tr td .testify_error").length > 0){//验证不通过
                return false;
            }
            //（修改提交题目及解析数据）
            var $_info = $('.content #myForm .other-description #question-desc').html();
            var $_analysis = $('.content #myForm .other-analysis #question-analysis').html();
            $('.content #myForm #info').val($_info);
            $('.content #myForm #analysis').val($_analysis);
            $("#myForm").ajaxSubmit($.extend(true,{},formOptions,myFormOptions_question));
        }

        //计算分析题
        if($(".content .right-section .select-type:checked").val() == 5){
            $(".content .verify-content").val('full');//初始状态值
            if($(".content #info").text() == ''){
                $(".content .verify-content").val('');
            }

            $(".content .inner-section .material-result-info").val('full');//初始状态值

            //选择题型是否填写题目与判断选择题答案是否勾选
            $(".content #material-result-content .option-list.material-type-select").each(function(){
                if($(this).find(".contentInfo .material-select-title").val() == ''){
                    $(".content .verify-content").val('');
                    return false;
                }
                if($(this).find(".material-select-result .icheckbox_minimal-blue.checked").length == 0){
                    $(".content .inner-section .material-result-info").val('');
                    return false;
                }
            })

            if($("#material-result-content").text() == ''){
                $(".content .inner-section .material-result-info").val('');
            }
            $(".content #material-result-content input[type='text']:visible").each(function(){
                if($(this).val() == ''){
                    $(".content .inner-section .material-result-info").val('');
                    return false;
                }
            })

            $(".content #material-result-content .content-list .typeInfo").each(function(){
                if($(this).find(".iradio_minimal-blue.checked").length == 0){
                    $(".content .inner-section .material-result-info").val('');
                    return false;
                }
            });

            //上传所需
            getOptionJson();
            //插件验证
            $("#myForm").validate(validateInfo);
            //jquery验证
            if($(".content .inner-section input[name='material_result_info']").val() == ''){
                $(".content .inner-section input[name='material_result_info']").parents('td').siblings('td').last().append(testifyError("答案填写不完善"));
            }
            if($(".content .inner-section input[name='verify_content']").val() == ''){
                $(".content .inner-section input[name='verify_content']").parents('td').siblings('td').last().append(testifyError("请填写描述"));
            }
            if($(".content #myForm tr td .testify_error").length > 0){//验证不通过
                return false;
            }
//			//（修改提交题目及解析数据）
//			var $_info = $('.content #myForm .other-description #question-desc').html();
//    		var $_analysis = $('.content #myForm .other-analysis #question-analysis').html();
//    		$('.content #myForm #content').val($_info);
//    		$('.content #myForm #analysis').val($_analysis);
            $("#myForm").ajaxSubmit($.extend(true,{},formOptions,myFormOptions_material));
        }

        //案例分析题
        if($(".content .right-section .select-type:checked").val() == 6){
            //先定义为空
            $(".content .right-section .case-description-info").val('full');
            //是否选项答案全填
            $(".content .inner-section #case-result-content .case-result-content-list").not(".hidden").each(function(){
                //小题的题目
                $(this).find("textarea[name='case-title-info']").each(function(){
                    if($(this).val() == ''){
                        $(".content .right-section .case-description-info").val('');
                        return false;
                    }
                });
                //选项
                $(this).find(".case-info").not('.hidden').each(function(){
                    if($(this).find('input[type=text]').val() == ''){
                        $(".content .right-section .case-description-info").val('');
                        return false;
                    }
                    if($(".content .right-section .case-description-info").val() == ''){
                        return false;
                    }
                })
                //答案
                if($(this).find("input[type='checkbox']:checked").length == 0){
                    $(".content .right-section .case-description-info").val('');
                    return false;
                }
            });
            //是否给分
            if($(".content .inner-section .case-result-score .case-score").val() == ''){
                $(".content .right-section .case-description-info").val('');
            }

            //上传所需
            getCaseUploadJson();
            //插件验证
            $("#myForm").validate(validateInfo);
            //jquery验证
            if($(".content .inner-section textarea[name='case_info']").val() == ''){
                $(".content .inner-section textarea[name='case_info']").parents('td').siblings('td').last().append(testifyError("答案填写案例"));
            }
            if($(".content .inner-section input[name='case_description_info']").val() == ''){
                $(".content .inner-section input[name='case_description_info']").parents('td').siblings('td').last().append(testifyError("问题描述填写不完善"));
            }
            if($(".content #myForm tr td .testify_error").length > 0){//验证不通过
                return false;
            }
            $("#myForm").ajaxSubmit($.extend(true,{},formOptions,myFormOptions_question));
        }
    }
    init();

});