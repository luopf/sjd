<?php
/**
 * Created by PhpStorm.
 * User: EDZ
 * Date: 2018/7/2
 * Time: 11:58
 */

namespace app\admin\controller;

use app\admin\controller\BaseAdminController;

use app\admin\model\CompanyModel;

use think\facade\Session;

use app\admin\model\store\UserModel;

class Count extends BaseAdminController
{
    /**
     * 构造函数
     */
    function __construct() {
        parent::__construct ();
        error_reporting ( E_ALL & ~ E_NOTICE & ~ E_DEPRECATED & ~ E_STRICT & ~ E_WARNING );
        $this->rightVerify(Session::get('admin'), __HOST__."/index.php/admin/login/login");
        $this->lib_company = new CompanyModel();
        $this->lib_user = new UserModel();
    }

    /**
    * 公司统计列表
     */
    function countList(){
        $companys = $this->lib_company->findAllCompany();
        $this->assign('companys',$companys['data']);
        $this->assign(config('config.view_replace_str'));
        return $this->fetch('countList');
    }

    /**
     * 用户统计列表
     */
    function userCountList(){

        $this->assign(config('config.view_replace_str'));
        return $this->fetch('userCountList');
    }


    /**
    *   分页展示统计列表
     */
    function pagingCount(){
        $page = $this->getPageInfo($this);
        $conditionList = [];
        if(input('company_id') != '' && input('company_id') != null){
            array_push($conditionList,  array("field" => 'company_id',"operator" => '=',"value" => input('company_id')));
        }
        $result = $this->lib_user->pagingCount($page,$conditionList);

        echo json_encode($result);
    }
    /**
     *   分页展示统计列表
     */
    function pagingUserCount(){
        $page = $this->getPageInfo($this);
        $conditionList = [];
        if(input('user_name') != '' && input('user_name') != null){
            array_push($conditionList,  array("field" => 'user_name',"operator" => 'like',"value" => input('user_name')));
        }
        $sort = "score desc";
        $result = $this->lib_user->pagingUser($page,$conditionList,$sort);

        echo json_encode($result);
    }



    /**
    *   统计详情列表
     */
    function countDetail(){
        $cid = input('cid');
        $this->assign('cid',$cid);
        $this->assign(config('config.view_replace_str'));
        return $this->fetch('countDetail');
    }

    /**
    *      导出excle
     */
    function importExcel(){

        $conditions = [];
        $keywords = [];
        if(input('cid') != '' && input('cid') != null){
            $conditions['company_id'] = input('cid');
        }
        if(input('user_name') != '' && input('user_name') != null){
            $keywords['user_name'] = input('user_name');
        }
        $sort = "score desc";

        $result = $this->lib_user->findAllUsers($conditions,$keywords,$sort);
        $this->lib_user->importExcel($result['data']['dataList']);

    }

    /**
    *   导出公司的排序Excle
     */
    function importCompanyExcel(){
        $conditions = [];
        $keywords = [];
        if(input('company_id') != '' && input('company_id') != null){
            $conditions['company_id'] = input('company_id');
        }
        $sort = "avg_score desc";
        $result = $this->lib_user->findAllCompanyScore($conditions,$keywords,$sort);
        $this->lib_user->importCompanyExcel($result['data']['dataList']);
    }


    /***
    *   分页展示详情列表信息
     */
    function pagingCountDetail(){
        $page = $this->getPageInfo($this);
        $conditionList = [];
        $sort = "score desc";
        if(input('cid') != '' && input('cid') != null){
            array_push($conditionList,  array("field" => 'company_id',"operator" => '=',"value" => input('cid')));
        }
        if(input('user_name') != '' && input('user_name') != null){
            array_push($conditionList,  array("field" => 'user_name',"operator" => 'like',"value" => input('user_name')));
        }

        $result = $this->lib_user->pagingUser($page,$conditionList,$sort);
        echo json_encode($result);
    }




}