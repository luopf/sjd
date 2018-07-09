<?php
/**
 * Created by PhpStorm.
 * User: EDZ
 * Date: 2018/6/25
 * Time: 11:48
 */

namespace app\admin\controller;

use app\admin\controller\BaseAdminController;

use app\admin\model\CompanyModel;

use think\facade\Session;
class Company extends BaseAdminController
{

    /**
     * 构造函数
     */
    function __construct() {
        parent::__construct ();
        error_reporting ( E_ALL & ~ E_NOTICE & ~ E_DEPRECATED & ~ E_STRICT & ~ E_WARNING );
        $this->rightVerify(Session::get('admin'), __HOST__."/index.php/admin/login/login");
        $this->lib_company = new CompanyModel();
    }

    /**
    *   分页展示公司列表
     */
    function companyList(){

        $this->assign(config('config.view_replace_str'));
        return $this->fetch('companyList');
    }


    /***
    *      删除公司
     */
    function deleteCompany(){
        $id = input('id');
        $result = $this->lib_company->deleteCompany(array('id'=>$id));
        echo json_encode($result);
    }

    /***
    *      公司详情页
     */
    function companyDetail(){
        $id = input('cid');
        $result = $this->lib_company->findCompany(array('id'=>$id));
        $this->assign('companyInfo',$result['data']);
        $this->assign(config('config.view_replace_str'));
        return $this->fetch('companyDetail');
    }

    /**
    *   添加公司页
     */
    function addCompanyPage(){
        $this->assign(config('config.view_replace_str'));
        return $this->fetch('addCompanyPage');
    }

    /**
    *      添加公司
     */
    function addCompany(){
        $name = input('name');
        $companyInfo = array(
            'name'=>$name,
            'add_time'=>\common::getTime()

        );
        $result = $this->lib_company->addCompany($companyInfo);
        echo  json_encode($result);
    }


    /**
    *   分页展示公司列表
     */
    function pagingCompany(){
        $page = $this->getPageInfo($this);
        $sort = "add_time desc";
        $conditionList = [];
        if(input('company') != '' && input('company') != null){
            array_push($conditionList,  array("field" => 'name',"operator" => 'like',"value" => input('company')));
        }
        $result = $this->lib_company->pagingCompany($page,$conditionList,$sort);
        echo json_encode($result);
    }



}