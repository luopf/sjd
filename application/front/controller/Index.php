<?php
namespace app\front\controller;

use think\Controller;
class Index extends Controller
{
    public function index()
    {
        $this->assign(config('config.view_replace_str'));
        return $this->fetch('index');
    }

    public function guidePage()
    {
        $this->assign(config('config.view_replace_str'));
        return $this->fetch('guidePage');
    }

    public function homePage(){
        $this->assign(config('config.view_replace_str'));
        return $this->fetch('homePage');
    }



}
