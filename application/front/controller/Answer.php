<?php
/**
 * Created by PhpStorm.
 * User: EDZ
 * Date: 2018/6/28
 * Time: 11:58
 */

namespace app\front\controller;


use app\front\controller\FrontBaseController;


use phpDocumentor\Reflection\Types\Integer;
use think\facade\Session;

use app\front\model\QuestionModel;
use app\front\model\UserModel;
use app\front\model\AnswerRecordModel;
class Answer extends FrontBaseController
{
    /**
     * 构造函数
     */
    function __construct() {
        parent::__construct ();
        error_reporting ( E_ALL & ~ E_NOTICE & ~ E_DEPRECATED & ~ E_STRICT & ~ E_WARNING );
        $this->rightVerify(Session::get('user'), __HOST__."/index.php/front/user/loginPage");
        $this->lib_question = new QuestionModel();
        $this->lib_user = new UserModel();
        $this->lib_answerRecord = new AnswerRecordModel();

    }






    /**
    *      获取所有的答题索引
     */
    function getAllQuestionIndex(){
        $indexs = [];
        $questions = $this->lib_question->findAllQuestion();
        foreach ($questions['data'] as $question){
            $id = $question['id'];
            array_push($indexs,$id);
        }
//        return array_slice($indexs,0,100);
        return $indexs;
    }

    /**
    * 用户每次获得的题目
     * $is_repeat   用户从题库中取题是否可以重复 0 不重复 1重复
     * $question_num 每次取题的个数
     */
    function getUserIndexQuestions($is_repeat = 1,$question_num = 10){
//        $is_repeat = 0;//是否可重复
//        $question_num = 10;// 每次取题的个数
        $userIndexQuestionsArr = [];// 返回的数组
        $allQuestionIndex = $this->getAllQuestionIndex();//所有题库的id
       $user_id = Session::get('user')['id'];
//        $user_id = 1;//测试专用
        $answedQuestion = $this->getUserAnswedQuestionIndex($user_id);//获取用户已经答完的题目索引
        if($is_repeat){// 可以重复从题库中取题
            $indexQuestionKey =  array_rand($allQuestionIndex ,$question_num); // 随机拿出所有题库数组的键名
            for ($i = 0;$i < count($indexQuestionKey);$i++){
                $key = $indexQuestionKey[$i];  //键名
                array_push($userIndexQuestionsArr,$allQuestionIndex[$key]);// 通过键名得到键值，并保存要返回的数组中
            }


        } else {// 用户不可以重复从题库中取题
            $a = array_diff($allQuestionIndex,$answedQuestion);// 所有题库-用户已经答的题
            $canAnswerQuestion = array_values($a);// 重新排序生成用户可用的所有题库
            $indexQuestionKey = array_rand($canAnswerQuestion ,$question_num);// 从可用的题库中随机生成指定个数的题目键名
            for ($i = 0;$i < count($indexQuestionKey);$i++){
                $key = $indexQuestionKey[$i];  //键名
                array_push($userIndexQuestionsArr,$canAnswerQuestion[$key]);// 通过键名得到键值，并保存要返回的数组中
            }


        }
        return $userIndexQuestionsArr;// 返回数组
    }


    // 获取用户最新的答题次数
    function getUserAnswerIndexFun(){
        $user_id = Session::get('user')['id'];
        $index =  $this->lib_answerRecord->getUserMaxAnswerIndex($user_id);
        return $index['data'];
    }

    function isWriteToRecord(){
        $user_id = Session::get('user')['id'];
        //$user_id = 1;//测试专用
        $result = $this->lib_answerRecord->findUserNoAnswerRecoed(array('user_id'=>$user_id,'user_is_answer'=>0));
        $data = $result['data'];
        if(count($data) == 0 || $data == null){// 当前没有未答题需要写入
            echo json_encode(array(
                'errorCode'=>0,
                'errorInfo'=>'需要写入答题',
                'data'=>true

            ));
        } else {// 当前没有未答题不需要写入
            //查看当前是否是中途退出： 是中途退出计算上次成绩并更新用户表
            //
            //1.找到当前答题次数下的答题记录
            $record = $data[0];
            $user_answer_index = $record['user_answer_index'];
            \ChromePhp::info($user_answer_index,'user_answer_index');
            //2.计算本次答题得分
            $scoreResult = $this->lib_answerRecord->getUserScore(array('user_id'=>$user_id,'user_answer_index'=>$user_answer_index,'user_is_answer'=>1,));
            $score = $scoreResult['data'];
            \ChromePhp::info($score,'score');
            // 更新用户表
            if($user_answer_index == 1){// 第一次答题
                $this->lib_user->updateUser(array('id'=>$user_id),array('score'=>$score,'first_score'=>$score,'user_answer_index'=>$user_answer_index));
            } elseif ($user_answer_index == 2){// 第二次答题
                $this->lib_user->updateUser(array('id'=>$user_id),array('score'=>$score,'second_score'=>$score,'user_answer_index'=>$user_answer_index));
            } elseif ($user_answer_index == 3){// 第三次答题
                $this->lib_user->updateUser(array('id'=>$user_id),array('score'=>$score,'third_score'=>$score,'user_answer_index'=>$user_answer_index));
            }
            //3.将本次所有未答题改为已答0分
             $this->lib_answerRecord->updateAnswerRecord(array(
                'user_id'=>$user_id,
                'user_answer_index'=>$user_answer_index
            ),array(
                'user_is_answer'=>1,
            ));


            echo json_encode(array(
                'errorCode'=>0,
                'errorInfo'=>'需要写入答题',
                'data'=>true
            ));
        }


    }

    /**
        将每次获取道的题目依次写入道用户答题记录中
     */
    function wirteUserAnswerRecord(){
        //1.先查找用户处于第几次答题
       $userLastAnswerIndex = $this->getUserAnswerIndexFun();

       $user_id = Session::get('user')['id'];
        //$user_id = 1;//测试专用
       $add_time = \common::getTime();
       if($userLastAnswerIndex >= 0 && $userLastAnswerIndex < 3){ // 合法
           $userAnswerIndex = $userLastAnswerIndex + 1;// 本次分配
           if($userAnswerIndex == 1){// 第一次答题
               $upUserInfo = array(
                   'user_answer_index' => $userAnswerIndex,
                   'first_answer_time' => $add_time,
               );
           } else if($userAnswerIndex == 2){// 第二次答题
               $upUserInfo = array(
                   'user_answer_index' => $userAnswerIndex,
                   'second_answer_time' => $add_time,
               );
           } else if($userAnswerIndex == 3){//第三次答题
               $upUserInfo = array(
                   'user_answer_index' => $userAnswerIndex,
                   'third_answer_time' => $add_time,
               );
           }
           $this->lib_user->updateUser(array('id'=>$user_id),$upUserInfo);
           $questions = $this->getUserIndexQuestions();
           //2.将分配的题目分配到答题记录表中
           for ($i = 0;$i < count($questions);$i++){
               $q_id = $questions[$i];// 题目id
               $index = $i + 1;
              $recordInfo = array(
                  'q_id' =>$q_id,
                  'user_id'=>$user_id,
                  'index'=>$index,
                  'add_time'=>$add_time,
                  'user_answer_index'=>$userAnswerIndex
              );
              $this->lib_answerRecord->addRecord($recordInfo);
           }
           echo json_encode(array(
               'errorCode'=>0,
               'errorInfo'=>'分配答题记录成功',
               'data'=>true
           ));


       } else{// 不合法
           echo json_encode(array(
               'errorCode'=>2,
               'errorInfo'=>'操作不在合法范围内!',
               'data'=>false
           ));
       }

    }

    /**
    *   解析用户的答题详情
     */
    function userAnswerQuestion(){
        $user_id = Session::get('user')['id'];
          //$user_id = 1;//测试专用
          $userInfo = $this->lib_user->findUser(array('id'=>$user_id));
          $user_answer_index = $userInfo['data']['user_answer_index'];//当前用户处于第几次答题
          // 从答题记录里查找当前次的所有未达题
          $userQuestionsRecord = $this->lib_answerRecord->findUserNoAnswerRecoed(array('user_id'=>$user_id,'user_answer_index'=>$user_answer_index,'user_is_answer'=>0));

          foreach ($userQuestionsRecord['data'] as &$record){
              $q_id = $record['q_id'];
              $questionInfo = $this->lib_question->findQuestion(array('id'=>$q_id));
              $record['questionInfo'] = $questionInfo['data'];
          }
          return $userQuestionsRecord['data'];
    }




    /**
    *      获取用户的所有已达的题
     */
    function getUserAnswedQuestionIndex($user_id=0){
        $index = [];
        $result = $this->lib_answerRecord->getUserAllAnswerRecord(array('user_id'=>$user_id,'user_is_answer'=>1));// 当前用户的并且已答完的题
        foreach ($result['data'] as $record){
            $qid = $record['q_id'];
            array_push($index,$qid);
        }
        return $index;
    }

    /**
    *   获取每天5道未答题
     * return Array
     */
    function getDayQuestion(){
        $dayQuestionIndex = [];
        $user_id = Session::get('user')['id'];
        $allQuestion = $this->getAllQuestionIndex();// 获取所有的题目索引
        $answedQuestion = $this->getUserAnswedQuestionIndex($user_id);//获取用户已经答完的题目索引
        $a = array_diff($allQuestion,$answedQuestion);// 相减
        $canAnswerQuestion = array_values($a);// 重新排序
        if(empty($canAnswerQuestion)){
            return $canAnswerQuestion;
        }
        $dayQuestionIndexkey = array_rand($canAnswerQuestion,5);
        for ($i = 0;$i < count($dayQuestionIndexkey);$i++){
            $key = $dayQuestionIndexkey[$i];
            array_push($dayQuestionIndex,$canAnswerQuestion[$key]);
        }
        return $dayQuestionIndex;
    }

    /**
    *   获取用户当天的所有题目
     * return Array
     */
    function getUserDayQuestion(){
        $user_id = Session::get('user')['id'];

        //
        $nowDay = \common::getDayTime();
        //读取用户当前天数的答题记录
        $answerRecord = $this->lib_answerRecord->getUserAllAnswerRecord(array('user_id'=>$user_id,'user_is_answer'=>0,'add_time'=>$nowDay));
        if($answerRecord['errorCode'] == 0){ //查找到
            foreach ($answerRecord['data'] as &$record){
                $q_id = $record['q_id'];
                $questionResult = $this->lib_question->findQuestion(array('id'=>$q_id));
                $record['questionInfo'] = $questionResult['data'];
            }

        } else{// 没有查找到
            $answerRecord['data'] = [];
            $question_ids = $this->getDayQuestion();//获取随机5道题
            // 插入5条答题记录
            for ($i = 0;$i < count($question_ids);$i++){
                $q_id = $question_ids[$i];
                $recordInfo = array(
                    'q_id'=>$q_id,
                    'user_id'=>$user_id,
                    'add_time'=>\common::getDayTime(),
                    'index'=>$i+1,
                );
               $record_id =  $this->lib_answerRecord->addRecord($recordInfo);
                $recordInfo['id'] = $record_id['data'];
                array_push($answerRecord['data'],$recordInfo);
            }
            // 查找当前所有题库
            foreach ($answerRecord['data'] as &$record){
                $q_id = $record['q_id'];
                $questionResult = $this->lib_question->findQuestion(array('id'=>$q_id));
                $record['questionInfo'] = $questionResult['data'];
            }


        }
        return $answerRecord['data'];
    }
    



    /**
    *   用户答题页面
     */
    function userAnswerPage(){
        $this->assign(config('config.view_replace_str'));
        return $this->fetch('userAnswerPage');
    }

    /**
    *      短信测试
     **/
    function smsTest(){

    }



    /**
    *   判断当前用户是否上榜
     */
    function userIsRank(){
        $user_id = Session::get('user')['id'];
        // 获取排名前10的用户
        $is = 10;
        $result = $this->lib_user->getUserPank();
        $users = $result['data'];

       for ($i = 0 ;$i < count($users); $i++){

           $obj = $users[$i];

           if($user_id == $obj['id']){// 上榜

               $index = $i + 1;

               $is = $index;
               break;

           } else { // 未上榜
               $is = 0;
           }
       }

        return $is;
    }


    /**
    *   用户排行榜页面
     */
    function userRankPage(){
        $user_id = Session::get('user')['id'];

        $userisrank = $this->userIsRank();
        // 查找当前用户的得分
        $result = $this->lib_user->findUser(array('id'=>$user_id));
        $this->assign('userInfo',$result['data']);

        $this->assign('userisrank',$userisrank);
        $this->assign(config('config.view_replace_str'));
        return $this->fetch('userRankPage');
    }


    /**
    *   分页展示题目
     */
//    function pagingUserAnswer(){
//        $index = input('index');
//        $num = 10;
//        //$user_id = Session::get('user')['id'];
//        $user_id = 1;
//
//        $add_time = \common::getDayTime();
//        $userisanswerday = $this->lib_answerRecord->getUserAllAnswerRecord(array('user_id'=>$user_id,'user_is_answer'=>1,'add_time'=>$add_time));
//        if( count($userisanswerday['data']) == 5 ){// 当前用户当天已经分配了题目不在分配
//            echo json_encode(array(
//
//            ));
//        } else {// 没有答题记录分配5道题
//            $records = $this->getUserDayQuestion();
//            $record = $records[$index];
//            if($record['questionInfo']['content']){
//                $record['questionInfo']['content'] = json_decode($record['questionInfo']['content']);
//            }
//            echo  json_encode($record);
//        }
//
//    }
    function textOver(){
        $user_id = 1;
        $isOver = $this->lib_answerRecord->findUserNoAnswerRecoed(array('user_id'=>$user_id,'user_answer_index'=>3,'user_is_answer'=>1));
        var_dump($isOver);
    }

    function pagingUserAnswer(){
        $index = input('index');
        $num = 10;
        $user_id = Session::get('user')['id'];
       // $user_id = 1;测试专用
        $questions = $this->userAnswerQuestion();

        if(count($questions) == 0 ){// 判断当前次数下的题目是否为0 为0 表示用户已经答完
            // 当前次数下题目为0 有两种情况：情况1.当前次数没有超过规定   情况2.当前次数超过规定就是答完所有的机会
            $isOver = $this->lib_answerRecord->findUserNoAnswerRecoed(array('user_id'=>$user_id,'user_answer_index'=>3,'user_is_answer'=>1));
            if($isOver['errorCode'] == 0){// 查找到了
                //计算三次中得分最大值
            $maxScore = 0;
            $scoreArr = [];
            $userInfo = $this->lib_user->findUser(array('id'=>$user_id));
            $scoreArr[0] = $userInfo['data']['first_score'];
            $scoreArr[1] = $userInfo['data']['second_score'];
            $scoreArr[2] = $userInfo['data']['third_score'];
            foreach ($scoreArr as $score){
                if($maxScore < $score){
                    $maxScore = $score;
                }
            }
            //更改用户统计score字段
            $this->lib_user->updateUser(array('id'=>$user_id),array('score'=>$maxScore));
            echo json_encode(array(
                'errorCode'=>4,
                'errorInfo'=>"该用户的所有答题机会已经完成！",
                'data'=>$maxScore
            ));

            } else{//查找失败 没找到就是没有答完所有题，只是本次答题完成
                // 维护答题成绩
                $maxScore = 0;
                $scoreArr = [];
                $userInfo = $this->lib_user->findUser(array('id'=>$user_id));
                $scoreArr[0] = $userInfo['data']['first_score'];
                $scoreArr[1] = $userInfo['data']['second_score'];
                $scoreArr[2] = $userInfo['data']['third_score'];
                foreach ($scoreArr as $score){
                    if($maxScore < $score){
                        $maxScore = $score;
                    }
                }
                //更改用户统计score字段
                $this->lib_user->updateUser(array('id'=>$user_id),array('score'=>$maxScore));

                echo json_encode(array(

                ));
            }
            //
//

        } else {//未答完题目
            $question = $questions[$index];
            $question['questionInfo']['content'] = json_decode($question['questionInfo']['content']);
            echo  json_encode($question);
        }

    }
    /**
     * 计算两个时间的时间差
     * $startTime 开始的时间
     * $endTime 结束的时间
     * $endTime — $startTime
    */
    function timeDiff($startTime,$endTime){
        $timeDiff = strtotime($endTime) - strtotime($startTime);
        return $timeDiff;
    }
    function  timeTest(){
        $endTime = \common::getTime();
        $startTime = "2018-07-24 16:26:22";
        $timeDiff = strtotime($endTime) - strtotime($startTime);
        echo $timeDiff;
}


    /**
    *   用户选择完，更改用户答题记录
     */
    function updateUserAnswerRecord(){
        $rid = input('rid');
        $now_time = \common::getTime();// 答题时间
        //1.判断当前用户是否超时
        $recordInfo = $this->lib_answerRecord->getOneRecord(array('id'=>$rid));
        $record_add_time = $recordInfo['data']['add_time'];// 题目录入的时间
        $user_id = $recordInfo['data']['user_id'];// 该条答题记录的用户id
        $userInfo = $this->lib_user->findUser(array('id'=>$user_id));// 用户表的详细信息
        $user_answer_index = $userInfo['data']['user_answer_index'];// 当前用户在那条答题次数
        $diffTime = $this->timeDiff($record_add_time,$now_time);
        if($diffTime > 7200 || $diffTime < 0){// 答题时间超过两小时=====》 超时 或者非法操作，结束当前次的答题
            //1.修改答题记录，2.统计分数
            $this->lib_answerRecord->updateAnswerRecord(array('user_id'=>$user_id,'user_answer_index'=>$user_answer_index),array('user_is_answer'=>1));

            echo json_encode(array(
                'errorCode' => 3,
                'errorInfo' => "答题超时！",
                'data'=> true
            ));
        } else { //没有超时
            // 2.改变当前用户的当前答题记录
            $updateInfo = array(
                'user_is_answer'=>1,
                'answer_is_true'=>input('answeristrue'),
                'score'=>intval(input('score')) * 2
            );
            $result = $this->lib_answerRecord->updateAnswerRecord(array('id'=>$rid),$updateInfo);
            // 3 .改变用户表的信息
            if($user_answer_index === 1){// 第一次答题
                $oldScore = $userInfo['data']['first_score'];
                $first_score = intval($oldScore) + intval(input('score')) * 2;
                $result = $this->lib_user->updateUser(array('id'=>$user_id),array('first_score'=>$first_score));

            } else if($user_answer_index === 2){// 第二次答题
                $oldScore = $userInfo['data']['second_score'];
                $second_score = intval($oldScore) + intval(input('score')) * 2;
                $result = $this->lib_user->updateUser(array('id'=>$user_id),array('second_score'=>$second_score));

            } else if($user_answer_index === 3){// 第三次答题
                $oldScore = $userInfo['data']['third_score'];
                $third_score = intval($oldScore) + intval(input('score')) * 2;
                $result =$this->lib_user->updateUser(array('id'=>$user_id),array('third_score'=>$third_score));

            }
            if($result['errorCode'] == 0){ // 修改成功
                echo json_encode(array(
                    'errorCode' => 0,
                    'errorInfo' => "答题成功！",
                    'data'=> true
                ));
            }

        }



//        // 查找当前记录是否是当天的第五条答题记录
//        $record = $this->lib_answerRecord->getUserAllAnswerRecord(array('id'=>$rid,'add_time'=>$add_time));
//        // 改变用户的答题总分数
//        if(input('score')){
//            $user_id = Session::get('user')['id'];
//            $user = $this->lib_user->findUser(array('id'=>$user_id));
//            $score = $user['data']['score'];
//            $score = intval($score) + intval(input('score'));
//            $this->lib_user->updateUser(array('id'=>$user_id),array('score'=>$score));
//        }
//        if($record['data']['index']){ // 今日第五道题
//            echo json_encode(array(
//               'errorCode' => 2,
//               'errorInfo' => $result['errorInfo'] ,
//                'data' => $result['data']
//            ));
//        } else{
//            echo json_encode($result);
//        }

    }


    /***
    *   获取当前用户当天答题分数
     */
    function getUserScore(){
        $user_id = Session::get('user')['id'];
        //$user_id = 1;//测试专用
        $userInfo = $this->lib_user->findUser(array('id'=>$user_id));
        $user_answer_index = $userInfo['data']['user_answer_index'];
        $score = 0;
        if($user_answer_index == 1){// 第一次答题成绩
            $score = $userInfo['data']['first_score'];
        } elseif ($user_answer_index == 2){//第二次答题成绩
            $score = $userInfo['data']['second_score'];
        } elseif ($user_answer_index == 3){// 第三次答题成绩
            $score = $userInfo['data']['third_score'];
        }

//        $result = $this->lib_answerRecord->getUserScore(array('user_id'=>$user_id,'user_answer_index'=>));
//        // 更改当前用户的用户表的总分字段
//       // $this->lib_user->updateUser(array('id'=>$user_id),array('score'=>$result['data']));
        echo json_encode(array(
            'errorCode'=>0,
            'errorInfo'=>'获取用户答题成绩成功！',
            'data'=>$score
        ));
    }


    /**
    *   获取用户排行榜
     */
    function getUserRank(){
        $users = $this->lib_user->getUserPank();
        echo json_encode($users);

    }



}