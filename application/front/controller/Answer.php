<?php
/**
 * Created by PhpStorm.
 * User: EDZ
 * Date: 2018/6/28
 * Time: 11:58
 */

namespace app\front\controller;


use app\front\controller\FrontBaseController;


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
    *      定时脚本
     */




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
        return array_slice($indexs,0,100);
    }

    /**
    *      获取用户的所有已达的题
     */
    function getUserAnswedQuestionIndex(){
        $index = [];
        $user_id = Session::get('user')['id'];// 测试用
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
        $allQuestion = $this->getAllQuestionIndex();
        $answedQuestion = $this->getUserAnswedQuestionIndex($user_id);
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
    *   获取用户当天的左右题目
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

        \ChromePhp::info($answerRecord['data']);
        return $answerRecord['data'];
    }
    

    function text(){
       $a =  $this->getUserDayQuestion();
        \ChromePhp::info($a);
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
        // 获取排名前50的用户
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
    function pagingUserAnswer(){
        $index = input('index');
        //判断当前用户今天是否已经答完5道题
        $user_id = Session::get('user')['id'];
        $add_time = \common::getDayTime();
        $userisanswerday = $this->lib_answerRecord->getUserAllAnswerRecord(array('user_id'=>$user_id,'user_is_answer'=>1,'add_time'=>$add_time));
        if( count($userisanswerday['data']) == 5 ){// 当前用户当天已经分配了题目不在分配
            echo json_encode(array(

            ));
        } else {// 没有答题记录分配5道题
            $records = $this->getUserDayQuestion();
            $record = $records[$index];
            if($record['questionInfo']['content']){
                $record['questionInfo']['content'] = json_decode($record['questionInfo']['content']);
            }
            echo  json_encode($record);
        }

    }

    /**
    *   用户选择完，更改用户答题记录
     */
    function updateUserAnswerRecord(){
        $rid = input('rid');
        $add_time = \common::getDayTime();
        $updateInfo = array(
            'user_is_answer'=>1,
            'answer_is_true'=>input('answeristrue'),
            'score'=>input('score')
        );
        // 改变用户的答题记录
        $result = $this->lib_answerRecord->updateAnswerRecord(array('id'=>$rid),$updateInfo);
        // 查找当前记录是否是当天的第五条答题记录
        $record = $this->lib_answerRecord->getUserAllAnswerRecord(array('id'=>$rid,'add_time'=>$add_time));
        // 改变用户的答题总分数
        if(input('score')){
            $user_id = Session::get('user')['id'];
            $user = $this->lib_user->findUser(array('id'=>$user_id));
            $score = $user['data']['score'];
            $score = intval($score) + intval(input('score'));
            $this->lib_user->updateUser(array('id'=>$user_id),array('score'=>$score));
        }
        if($record['data']['index']){ // 今日第五道题
            echo json_encode(array(
               'errorCode' => 2,
               'errorInfo' => $result['errorInfo'] ,
                'data' => $result['data']
            ));
        } else{
            echo json_encode($result);
        }

    }


    /***
    *   获取当前用户当天答题分数
     */
    function getUserDayScore(){
        $user_id = Session::get('user')['id'];
        $add_time = \common::getDayTime();
        $result = $this->lib_answerRecord->getUserScore(array('user_id'=>$user_id,'add_time'=>$add_time));
        // 更改当前用户的用户表的总分字段
       // $this->lib_user->updateUser(array('id'=>$user_id),array('score'=>$result['data']));
        echo json_encode($result);
    }


    /**
    *   获取用户排行榜
     */
    function getUserRank(){
        $users = $this->lib_user->getUserPank();
        echo json_encode($users);

    }



}