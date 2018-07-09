<?php
/**
 * Created by PhpStorm.
 * User: EDZ
 * Date: 2018/6/28
 * Time: 9:12
 */

namespace app\front\controller;

use think\Controller;
use app\front\model\CompanyModel;
class Company extends Controller
{

    function __construct() {
        parent::__construct ();
        $this->lib_company = new CompanyModel();
    }

    function getAllCompany(){
        $result = $this->lib_company->findAllCompany();
        echo json_encode($result);
    }


}