<?php
/**
 * Created by PhpStorm.
 * User: EDZ
 * Date: 2018/6/28
 * Time: 17:27
 */

namespace app\front\model;
use  think\Model;

use think\Db;

class AnswerRecordModel extends Model
{
    protected $pk = 'id';
    protected $table = 'answer_record';


    public function escape($value)
    {
        return strip_tags($value);
    }
    /**
    *   按条件查找所有答题记录
     */
    function getUserAllAnswerRecord($conditions){
        $m_record = Db::name('answer_record');
        try{
            $result = $m_record->where($conditions)->select();
            if(true == $result ){
                return \common::errorArray(0, "查找成功", $result);
            }else{
                return \common::errorArray(1, "查找为空", $result);
            }
        }catch (Exception $ex){

            return \common::errorArray(1, "数据库操作失败", $ex);
        }
    }

    /**
    *   添加答题记录
     */
    function addRecord($recordInfo){
        $m_record = Db::name('answer_record');
        try{
            $result = $m_record->insertGetId($recordInfo);
            if(true == $result ){
                return \common::errorArray(0, "添加成功", $result);
            }else{
                return \common::errorArray(1, "添加失败", $result);
            }
        }catch (Exception $ex){

            return \common::errorArray(1, "数据库操作失败", $ex);
        }
    }

    /**
    *   修改答题记录
     */
    function updateAnswerRecord($condtion,$upInfo){
        $m_record = Db::name('answer_record');
        try{
            $result = $m_record->where($condtion)->update($upInfo);
            if(true == $result ){
                return \common::errorArray(0, "修改成功", $result);
            }else{
                return \common::errorArray(1, "修改失败", $result);
            }
        }catch (Exception $ex){

            return \common::errorArray(1, "数据库操作失败", $ex);
        }
    }

    /**
    *  根据条件获取累计分数
     */
    function getUserScore($condtions){
        $m_record = Db::name('answer_record');
        $score = 0;
        try{
            $result = $m_record->where($condtions)->select();
            foreach ($result as &$record){
                $score += intval($record['score']);
            }
            if(true == $result ){
                return \common::errorArray(0, "修改成功", $score);
            }else{
                return \common::errorArray(1, "修改失败", $score);
            }
        }catch (Exception $ex){

            return \common::errorArray(1, "数据库操作失败", $ex);
        }
    }




}