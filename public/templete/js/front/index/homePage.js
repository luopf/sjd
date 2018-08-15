$(function(){

    let host = getJSurl();

    //开始答题点击事件
    $(".start-question-btn").click(function () {
        window.location.href = host+"/index.php/front/answer/userAnswerPage";
    });
    // 排行榜点击事件
    $(".charts-btn").click(function () {
        window.location.href = host+"/index.php/front/answer/userRankPage";
    });


})