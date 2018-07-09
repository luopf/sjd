$(function () {
    let host = getJSurl();
    $(".enter-start-btn").click(function () {
        window.location.href = host+"/index.php/front/Index/homePage";
    });


})