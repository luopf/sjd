<?php
/**
 * Created by PhpStorm.
 * User: EDZ
 * Date: 2018/6/21
 * Time: 18:08
 */

namespace app\admin\controller;

use app\admin\controller\BaseAdminController;

use app\admin\model\QuestionModel;

use think\facade\Session;
class Question extends  BaseAdminController

{
    /**
     * 构造函数
     */
    function __construct() {
        parent::__construct ();
        error_reporting ( E_ALL & ~ E_NOTICE & ~ E_DEPRECATED & ~ E_STRICT & ~ E_WARNING );
        $this->rightVerify(Session::get('admin'), __HOST__."/index.php/admin/login/login");
        $this->lib_question = new QuestionModel();
    }
        /**
        *    添加题目页面
         */
    public function addQuestion(){
        $this->assign(config('config.view_replace_str'));
        return $this->fetch('addQuestion');
    }

    /**
     * 添加题目
     */
    function insertQuestion(){
        $questionInfo = $this->getArgsList($this, array(
            'type','info','content','result','score','analysis'
        ));
        if($questionInfo['type'] == 6){//案例题特殊情况：案例描述
            $questionInfo['info'] = input('case_info');
        }
        $questionInfo['add_time'] = \common::getTime();
        $result = $this->lib_question->addQuestion($questionInfo);
        echo json_encode($result);
    }
    /**
    * 题目列表
     */
    function questionsList(){
        $this->assign(config('config.view_replace_str'));
        return $this->fetch('queationList');
    }

    /**
    *   分页展示题目列表
     */

    function pagingQuestion(){
        $page = $this->getPageInfo($this);
        $sort = "add_time desc";
        $conditionList = [];
        if(input('type') != '' && input('type') != null){
            array_push($conditionList,  array("field" => 'type',"operator" => '=',"value" => input('type')));
        }
        if(input('info') !== '' && input('info') != null){
            array_push($conditionList,  array("field" => 'info',"operator" => 'like',"value" => input('info')));
        }
        $result = $this->lib_question->pagingQuestion($page,$conditionList,$sort);
        \ChromePhp::INFO($result);
        echo json_encode($result);
    }


    /***
    *      编辑题目详情
     */
    function editQuestion(){

        $id = input('id');
        $questionResult = $this->lib_question->findQuestion( array('id' => $id) );
        if($questionResult['data']['content']){

            $questionResult['data']['content'] = json_decode($questionResult['data']['content'],true);
        }
        $this->assign('question',$questionResult['data']);
        \ChromePhp::info($questionResult['data']);
        $this->assign(config('config.view_replace_str'));
        return $this->fetch('editQuestion');
    }

    /**
    *       修改题目详情
     */
    function updateQuestion(){
        $id = input('id');
        $questionInfo = $this->getArgsList($this,array(
            'type','info','content','result','score','analysis'
        ));
        $result = $this->lib_question->updateQuestion(array('id'=>$id),$questionInfo);
        echo json_encode($result);
    }

    /***
    *       删除题目
     */
    function deleteQuestion(){
        $id = input('ids');
        $result = $this->lib_question->deleteQuestion(array('id'=>$id));
        echo json_encode($result);
    }





}