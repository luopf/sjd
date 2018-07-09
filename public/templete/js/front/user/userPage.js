$(function(){

    let host = getJSurl();
    $(".content").click(function () {
        window.location.href=host+"/index.php/front/index/guidePage";
    });
    setTimeout(function(){
        window.location.href=host+"/index.php/front/index/guidePage";
    },2000);



})