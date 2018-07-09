<?php
/**
 * Created by PhpStorm.
 * User: EDZ
 * Date: 2018/6/26
 * Time: 17:07
 */

namespace app\front\controller;

use think\Controller;

class FrontBaseController extends Controller
{


    /**
     * 控制器权限验证
     * @param array $session
     * @param string $go
     */
    protected function rightVerify($session,$go = ''){
        if (!isset($session)){
            if('' == $go){
                $go = $this->go;
            }
            echo "<html><head><meta http-equiv='refresh' content='0;url=".$go."'></head><body></body><ml>";
            echo "<script type='text/javascript'>window.location.href('".$go."');</script>";
            exit;
        }
    }


}