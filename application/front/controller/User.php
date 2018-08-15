<?php
/**
 * Created by PhpStorm.
 * User: EDZ
 * Date: 2018/6/26
 * Time: 17:08
 */

namespace app\front\controller;
use think\Controller;

use app\front\model\UserModel;

use  app\front\model\CompanyModel;
use think\facade\Session;


class User extends Controller
{
    /**
     * 构造函数
     */
    function __construct() {
        parent::__construct ();


        $this->lib_user = new UserModel();
        $this->lib_company = new CompanyModel();
    }
    /***
    *   登录页
     */
    function loginPage(){

        $this->assign(config('config.view_replace_str'));
        return $this->fetch('loginPage');
    }

    /**
    *   短信发送测试
     */
    function sendsSms(){
        $sms = new \SmsDemo();
        $phone = input('phone');
        $code = $this->randCode();
        $smsInfo = array(
            'phone'=>$phone,
            'code'=>$code
        );


       $result =  $sms->sendSms($smsInfo);

       echo json_encode(array(
           'errorCode'=> 0,
           'errorInfo'=> '短信发送成功',
           'data'=>$code
       ));
    }

    /**
    *   随机生成短信验证码
     */
    function randCode(){
        $code = rand(10000,99999);
        Session::set('smsCode',$code);
        return $code;
    }



    /**
    *      验证用户登录
     */
    function userLogin(){
        $phone = input('phone');
        $password = input('password');
        $password = md5($password);
        $result = $this->lib_user->findUser(array('phone'=>$phone,'password'=>$password));
        if($result['errorCode'] == 0){// 用户存在，将用户信息存在session里
            Session::set('user',$result['data']);
        }

        echo  json_encode($result);
    }




    /**
    *      用户注册页
     */
    function userRegisterPage(){
        $this->assign(config('config.view_replace_str'));
        return $this->fetch('userRegisterPage');
    }

//    /**
//    *      短信发送
//     */
//    public function sendTransferedNotice()
//    {
//
//        $phone = '18654193825';
//        $vendor = new \aliyun\api_demo\SmsDemo();
//        set_time_limit(0);
//        $response = $vendor->sendSms($phone, $sms, [
//            'tn' => $package->getData('tracking_number'),
//            'code' => $pickupCode
//        ]);
//
//        if ($response->Message == "OK") {
//
//            return true;
//        } else {
//
//        }
//    }





        /**
    *       用户注册
     */
    function userRegister(){
        $user_name = input('user_name');
        $phone = input('phone');
        $password = input('password');
        $password = md5($password);
        $company_id = input('company_id');
        $userIsRegister  = $this->lib_user->findUser(array('phone'=>$phone));
        if($userIsRegister['errorCode'] == 0){
            echo json_encode(array(
                'errorCode'=> 1,
                'errorInfo'=>'该手机号码已被注册',
                'data'=> false
            ));
            die;
        }
        if($company_id == 0){// 选择其他
            $company = input('company');
            $comRes = $this->lib_company->addCompany(array('name'=>$company));
            if($comRes['errorCode'] == 0){// 添加成功
                $comid = $comRes['data'];
                $userInfo = array(
                    'user_name'=>$user_name,
                    'phone'=>$phone,
                    'password'=>$password,
                    'company'=>$company,
                    'company_id'=>$comid
                );
                $result = $this->lib_user->addUser($userInfo);
                echo json_encode($result);
            }


        } else{// 正常选择
            $comResult = $this->lib_company->findCompany(array('id'=>$company_id));
            $company = $comResult['data']['name'];
            $userInfo = array(
                'user_name'=>$user_name,
                'phone'=>$phone,
                'password'=>$password,
                'company'=>$company,
                'company_id'=>$company_id
            );
            $result = $this->lib_user->addUser($userInfo);
            echo json_encode($result);
        }

    }




}