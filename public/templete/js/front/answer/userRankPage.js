$(function(){

    let host = getJSurl();

    $.ajax({
        async: true,
        type: 'post',
        url: host + '/index.php/front/answer/getUserRank',

        dataType: 'json',
        success: function (json) {
            console.log(json);
            let data = json.data;
            let rowHtml = '';
            for (let i = 0;i < data.length;i++){
                let obj = data[i];
                let num = i + 1;// 序号 片名
                let user_name = obj.user_name;
                if(user_name == null){
                    user_name = null;
                } else {
                    user_name = user_name.substring(0,4);
                }
                let company = obj.company;

                if(company == null){
                    company = '无';
                } else {
                    company = company.substring(0,4);
                }

                let score = obj.score;
                rowHtml += '<tr class="header-row"><td class="rank">'+num+'</td><td class="user_name">'+user_name+'</td><td class="company">'+company+'</td><td class="score">'+score+'</td></tr>';
            }
            $(".content .rank-content .rank-user-content").html(rowHtml);

        },
        error: errorResponse
    });



})