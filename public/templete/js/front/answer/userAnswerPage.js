$(function(){

    let host = getJSurl();
    let questionType = 1;// 1 单选题 2 多选题 3 判断题
   // let index = 0;

    function init() {
        // 进入答题页先分配答题记录后答题
        pageDataInit();

        bindEvent();



    }
    function pageDataInit() {

        $.ajax({
            async: true,
            type: 'post',
            url: host + '/index.php/front/answer/isWriteToRecord',
            dataType: 'json',
            success: function (json) {
                if(json.errorCode == 0){// 需要写入答题
                    $.ajax({
                        async: true,
                        type: 'post',
                        url: host + '/index.php/front/answer/wirteUserAnswerRecord',
                        dataType: 'json',
                        success: function (json) {
                            render();
                        },
                    })

                } else {//不需要写入答题
                    render();
                }
            }
        })
    }
    function selectInfo() {
        //let index = $("#next").attr('data-index');
        let selectInfo = {
            'index':0
        };

        return selectInfo;
    }



    function render() {
        let data = selectInfo();

        $.ajax({
        async:true,
        type:'post',
        url:host+'/index.php/front/answer/pagingUserAnswer',
        data:data,//从1开始计数
        dataType:'json',
        success:function(json){
            if(json.errorCode == 4){// 用户答完所有的题
                let score = json.data;
                $(".user-notic .notic-div .notic-content .userbox-notic").text("已经使用了所有的答题机会，综合三次答题情况，取三次答题最高分");
                $(".user-notic .notic-div .notic-content .user-score").text(score);
                $(".user-notic").removeClass("hidden");
            }
            if(json.errorCode == 3){ // 超时了
                // 获取用户当天答题分数
                $.ajax({
                    async: true,
                    type: 'post',
                    url: host + '/index.php/front/answer/getUserScore',
                    dataType: 'json',
                    success: function (json) {
                        if(json.errorCode == 0){ // 查找成功
                            let score = json.data;
                            $(".user-notic .notic-div .notic-content .userbox-notic").text("本次答题超时系统将自动判分");
                            $(".user-notic .notic-div .notic-content .user-score").text(score);
                            $(".user-notic").removeClass("hidden");

                        }
                    },
                    error:errorResponse
                })

                return false;
            }


            if(json.length == 0){
               // 获取用户本次答题分数
                    $.ajax({
                        async: true,
                        type: 'post',
                        url: host + '/index.php/front/answer/getUserScore',
                        dataType: 'json',
                        success: function (json) {
                            if(json.errorCode == 0){ // 查找成功
                                let score = json.data;
                                $(".user-notic .notic-div .notic-content .user-score").text(score);
                                $(".user-notic").removeClass("hidden");

                            }
                        },
                        error:errorResponse
                    })

                    return false;
            }
            let resultHtml = '';
            let oprateHtml = '';
            console.log(json,"当前题目");
            let id = json.id;// 答题记录的id
            let index = json.index;
            let obj = json.questionInfo;
            let q_id = obj.id;// 题目id
            let info = obj.info;// 题目内容
            let result = obj.result;// 题目答案
            let content = obj.content;// 题目的选项
            let type = obj.type;// 题目的类型
            questionType = type;
            let indexText = '';
            if(index != null && index != undefined && index != ''){
                indexText = "第"+index+"题" ;
            }
            let typeText = '';
            if(type == 1 || type == '1'){
                typeText = '<Text class="question-type-text">单选</Text>';
            } else if(type == 2 || type == '2'){
                typeText = '<Text class="question-type-text">多选</Text>';
            } else if(type == 3 || type == '3'){
                typeText = '<Text class="question-type-text">判断</Text>';
            }
            if(type == 1 || type == 2){ // 单选或多选题
                if(content instanceof(Array)  && content.length != 0){
                    for(let i = 0;i< content.length;i++){
                        let selectobj = content[i];
                        let select = selectobj.select;
                        let select_text = selectobj.select_content;
                        let selectRow = '<div class="select-row"><div class="select-section">'+select+'</div><div class="select-content">'+select_text+'</div></div>';
                        oprateHtml += selectRow;
                    }

                }
            } else {// 判断题
                oprateHtml += '<div class="select-row"><div class="select-section" data="1">√</div><div class="select-content">正确</div></div>';
                oprateHtml += '<div class="select-row"><div class="select-section" data="0">×</div><div class="select-content">错误</div></div>';
            }


            resultHtml += '<p class="question-info">'+typeText+info+'</p>';



            $(".content .question-content .question-index").html(indexText);
            $(".content .question-content .question-result").html(resultHtml);
            $(".content .question-content .question-option").html(oprateHtml);
            $(".content .question-content .question-answer").val(result);
            $(".content .question-content .answer-record-id").val(id);
            $(".content .question-content .user-question-index").val(index);
            // 选择选项卡切换
            $(".select-row").click(function () {
                let that = $(this);
                let selectDom =  that.children(".select-section");
                if(questionType == 1){// 单选题
                    that.addClass("selected").siblings().removeClass("selected");
                    selectDom.addClass("selected").parents().siblings().children(".select-section").removeClass("selected");

                } else if(questionType == 2){ // 多选题
                    if(that.hasClass("selected")){
                        selectDom.removeClass('selected');
                        that.removeClass('selected');

                    } else {
                        selectDom.addClass('selected');
                        that.addClass('selected');
                    }
                } else if(questionType == 3){ // 判断题
                    that.addClass("selected").siblings().removeClass("selected");
                    selectDom.addClass("selected").parents().siblings().children(".select-section").removeClass("selected");
                }



            })






        },
        error:errorResponse
    });







    }


    
    
    function bindEvent() {

        // 提交下一题
        $("#next").click(function () {
            let isSelect = $(".select-row.selected");

            if(isSelect.length == 0){
                alert("您还没有选择！");
                return false;
            }
            let that = $(this);
            let sysResult = $(".content .question-content .question-answer").val();
            let rid = $(".content .question-content .answer-record-id").val();
            let index = $(".content .question-content .user-question-index").val();
            //判断答案是否正确
            if(questionType == 1){// 单选题
                let userSelect =  $(".select-row.selected");
                let userResult = userSelect.children(".select-section").text();

                if(userResult == sysResult){
                    console.log("回答正确");
                    addAnswerRecord(rid,1,1);
                } else {
                    console.log("回答失败");
                    addAnswerRecord(rid,0,0);
                }

            } else if(questionType == 2){// 多选题
                let userSelect =  $(".select-row.selected");
                let userResult = '';
                if( userSelect.length != 0){

                       for(let i = 0;i < userSelect.length;i++){
                           let userSelection = userSelect[i];

                           userResult += $(userSelection).children(".select-section.selected").text() + ',';

                       }
                       userResult.substr(0,userResult.length-1);

                }
                if(userResult == sysResult+','){
                   console.log("回到正确");
                    addAnswerRecord(rid,1,1);
                } else {
                    console.log("回到错误");
                    addAnswerRecord(rid,0,0);
                }


            } else if(questionType == 3){// 判断题
                let userSelect =  $(".select-row.selected");
                let userResult = $(userSelect.children(".select-section")).attr('data');
                if(userResult == sysResult){
                    console.log("回答正确");
                    addAnswerRecord(rid,1,1);
                } else {
                    console.log("回答错误");
                    addAnswerRecord(rid,0,0);
                }

            }

        })

        // 确定按钮点击事件
        $(".notic-btn").click(function () {
            $(".user-notic").removeClass("hidden");
            window.location.href = host + "/index.php/front/index/homePage";
        })




    }

    /**
     * 提交答题结果
     * */
    function addAnswerRecord(rid,answeristrue,score) {
        $.ajax({
            async: true,
            type: 'post',
            url: host + '/index.php/front/answer/updateUserAnswerRecord',
            data: {'rid':rid,// 答题记录id
                'answeristrue':answeristrue,
                'score':score
            },
            dataType: 'json',
            success: function (json) {
                console.log(json,"提交完答题结果后返回的数据");
                if(json.errorCode == 3){ // 超时了
                    // 获取用户当天答题分数
                    $.ajax({
                        async: true,
                        type: 'post',
                        url: host + '/index.php/front/answer/getUserScore',
                        dataType: 'json',
                        success: function (json) {
                            if(json.errorCode == 0){ // 查找成功
                                let score = json.data;
                                $(".user-notic .notic-div .notic-content .userbox-notic").text("本次答题超时系统将自动判分");
                                $(".user-notic .notic-div .notic-content .user-score").text(score);
                                $(".user-notic").removeClass("hidden");

                            }
                        },
                        error:errorResponse
                    })

                    return false;
                }

                if(json == null){
                    //获取用户当天答题分数
                        $.ajax({
                            async: true,
                            type: 'post',
                            url: host + '/index.php/front/answer/getUserScore',
                            data: data,//从1开始计数
                            dataType: 'json',
                            success: function (json) {
                                if(json.errorCode == 0){ // 查找成功
                                    let score = json.data;
                                    $(".user-notic .notic-div .notic-content .user-score").text(score);
                                    $(".user-notic").removeClass("hidden");

                                }
                            },
                            error:errorResponse
                        })

                        return false;
                }

                if(json.errorCode == 0){// 提交成功 ，进行下一题
                    let index = $("#next").attr('data-index');
                    index =  parseInt(index);
                    index += 1;
                    $("#next").attr('data-index',index);
                    render();

                } else if(json.errorCode == 2) {// 五道题已经答完
                        alert('大完了');
                }
            },
            error: errorResponse
        })
    }



    init();




})