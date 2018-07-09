<?php
/**
 * Created by PhpStorm.
 * User: EDZ
 * Date: 2018/6/25
 * Time: 10:54
 */

namespace app\admin\model;

use  think\Model;

use think\Db;

class QnUserRecordModel extends  Model
{
    protected $pk = 'id';
    protected $table = 'question_user_record';
}