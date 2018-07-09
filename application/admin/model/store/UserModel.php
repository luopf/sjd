<?php
/**
 * Created by PhpStorm.
 * User: EDZ
 * Date: 2018/5/16
 * Time: 9:50
 */

namespace app\admin\model\store;
use  think\Model;

use think\Db;

class UserModel extends Model
{

    protected $pk = 'id';
    protected $table = 'base_user';


    /**
    *添加用户
     */
    public function addUser($userInfo){
        $m_user = Db::name('base_user');
        try{
            $result = $m_user->insert($userInfo);
            if(true == $result ){
                return \common::errorArray(0, "插入成功", $result);
            }else{
                return \common::errorArray(1, "插入失败", $result);
            }
        }catch (Exception $ex){

            return  \common::errorArray(1, "数据库操作失败",$ex);
        }
    }
    /**
     * 导出公司excel
     * @param array $oriData
     */
    function importCompanyExcel($oriData){
        $headArr = array("公司名称","参与人数","平均得分");
        $data = array();
        for($i = 0;$i < count($oriData);$i++){
            $data[$i][0] = " ".$oriData[$i]['company_name'];
            $data[$i][1] = " ".$oriData[$i]['people_nums'];
            $data[$i][2] = $oriData[$i]['avg_score'] . "分";
//            $data[$i][3] = count(json_decode( $oriData[$i]['goods_list']));
//            $data[$i][4] = $oriData[$i]['address_text'];
//            if($oriData[$i]['state'] == 0){
//                $data[$i][5] = '待付款';
//            }else if($oriData[$i]['state'] == '1'){
//                $data[$i][5] = '待发货';
//            }else if($oriData[$i]['state'] == '2'){
//                $data[$i][5] = '已发货';
//            }else if($oriData[$i]['state'] == '3'){
//                $data[$i][5] = '已收货';
//            }else if($oriData[$i]['state'] == '4'){
//                $data[$i][5] = '交易关闭';
//            }else if($oriData[$i]['state'] ==  '5'){
//                $data[$i][5] = '交易成功';
//            }else if($oriData[$i]['state'] ==  '6'){
//                $data[$i][5] = '申请退款';
//            }else if($oriData[$i]['state'] ==  '7'){
//                $data[$i][5] = '退款成功';
//            }
//
//
//            $data[$i][6] = " ".$oriData[$i]['message'];
//
//            if($oriData[$i]['pay_method'] == 1){
//                $data[$i][7] = '微信支付';
//            }elseif($oriData[$i]['pay_method'] == 2){
//                $data[$i][7] = '支付宝';
//            }elseif($oriData[$i]['pay_method'] == 3){
//                $data[$i][7] = '货到付款';
//            }else{
//                $data[$i][7] = '';
//            }
//            $data[$i][8] = $oriData[$i]['add_time'];

        }
        $this->getExcel($headArr,$data);
    }



    /**
     * 导出excel
     * @param array $oriData
     */
    function importExcel($oriData){
        $headArr = array("姓名","所在公司","得分");
        $data = array();
        for($i = 0;$i < count($oriData);$i++){
            $data[$i][0] = " ".$oriData[$i]['user_name'];
            $data[$i][1] = " ".$oriData[$i]['company'];
            $data[$i][2] = $oriData[$i]['score'] . "分";
//            $data[$i][3] = count(json_decode( $oriData[$i]['goods_list']));
//            $data[$i][4] = $oriData[$i]['address_text'];
//            if($oriData[$i]['state'] == 0){
//                $data[$i][5] = '待付款';
//            }else if($oriData[$i]['state'] == '1'){
//                $data[$i][5] = '待发货';
//            }else if($oriData[$i]['state'] == '2'){
//                $data[$i][5] = '已发货';
//            }else if($oriData[$i]['state'] == '3'){
//                $data[$i][5] = '已收货';
//            }else if($oriData[$i]['state'] == '4'){
//                $data[$i][5] = '交易关闭';
//            }else if($oriData[$i]['state'] ==  '5'){
//                $data[$i][5] = '交易成功';
//            }else if($oriData[$i]['state'] ==  '6'){
//                $data[$i][5] = '申请退款';
//            }else if($oriData[$i]['state'] ==  '7'){
//                $data[$i][5] = '退款成功';
//            }
//
//
//            $data[$i][6] = " ".$oriData[$i]['message'];
//
//            if($oriData[$i]['pay_method'] == 1){
//                $data[$i][7] = '微信支付';
//            }elseif($oriData[$i]['pay_method'] == 2){
//                $data[$i][7] = '支付宝';
//            }elseif($oriData[$i]['pay_method'] == 3){
//                $data[$i][7] = '货到付款';
//            }else{
//                $data[$i][7] = '';
//            }
//            $data[$i][8] = $oriData[$i]['add_time'];

        }
        $this->getExcel($headArr,$data);
    }

    /**
     * 导出excel 的配置
     * @param array $headArr
     * @param array $data
     */
    private function getExcel($headArr,$data){
        if(empty($data) || !is_array($data)){
            die("data must be a array");
        }

        $date = date("Y_m_d",time());
        $fileName = "统计_".date ( 'YmdHis', time () ).".xlsx";

        //创建新的PHPExcel对象
        $objPHPExcel = new \PHPExcel();
        $objProps = $objPHPExcel->getProperties();

        //设置表头
        $key = ord("A");
        foreach($headArr as $v){
            $colum = chr($key);
            $objPHPExcel->setActiveSheetIndex(0) ->setCellValue($colum.'1', $v);
            $key += 1;
        }

        $column = 2;
        $objActSheet = $objPHPExcel->getActiveSheet();
        foreach($data as $key => $rows){ //行写入
            $span = ord("A");
            foreach($rows as $keyName=>$value){// 列写入
                $j = chr($span);
                $objActSheet->setCellValue($j.$column, $value);
                $span++;
            }
            $column++;
        }

        $fileName = iconv("utf-8", "gb2312", $fileName);
        //重命名表
        $objPHPExcel->getActiveSheet()->setTitle('Simple');
        //设置活动单指数到第一个表,所以Excel打开这是第一个表
        $objPHPExcel->setActiveSheetIndex(0);
        $objPHPExcel->getActiveSheet()->getColumnDimension('A')->setAutoSize(true);
        $objPHPExcel->getActiveSheet()->getColumnDimension('B')->setAutoSize(true);
        $objPHPExcel->getActiveSheet()->getColumnDimension('C')->setAutoSize(true);
        $objPHPExcel->getActiveSheet()->getColumnDimension('E')->setAutoSize(true);
        $objPHPExcel->getActiveSheet()->getColumnDimension('F')->setAutoSize(true);
        $objPHPExcel->getActiveSheet()->getColumnDimension('H')->setAutoSize(true);
        //将输出重定向到一个客户端web浏览器(Excel2007)
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header("Content-Disposition: attachment; filename=\"$fileName\"");
        header('Cache-Control: max-age=0');
        $objWriter = \PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');
        $objWriter->save('php://output');
        /* if(!empty($_GET['excel'])){
            $objWriter->save('php://output'); //文件通过浏览器下载
        }else{

            $objWriter->save($fileName); //脚本方式运行，保存在当前目录
            LogUtil::$Log->info(1);
            return;
        } */
        exit;

    }




    /**
     * 获取用户信息
     * @param array $conditions
     * @return array $result
     */
    public function findUser($conditions = null){
        $m_user = Db::name('base_user');
        try{
            $result = $m_user->where($conditions)->find();
            if(true == $result ){
                return \common::errorArray(0, "查找成功", $result);
            }else{
                return \common::errorArray(1, "查找失败", $result);
            }
        }catch (Exception $ex){

            return  \common::errorArray(1, "数据库操作失败",$ex);
        }
    }

    /**
     *  根据条件查找所有的公司答题情况
     */
    function findAllCompanyScore($conditions, $keywords = null, $sort = null,$createTime = null,$endTime = null){

        $m_user = Db::name('base_user');
        if(empty($sort)){
            $sortstr = "";
        }
        else if(is_array($sort)){
            if(count($sort) == 0){
                $sortstr = "";
            }
            else{
                $sortstr = "ORDER BY";
                foreach ($sort as $key => $sortitem){
                    $sortarray[] = " {$sortitem['field']} {$sortitem['orderby']}";
                }
                $sortstr = $sortstr.join(',', $sortarray);
            }
        }
        else if(is_string($sort)){
            $sortstr = "ORDER BY ".$sort;
        }

        if(empty($conditions)&&(empty($keywords)&&(empty($createTime))&&(empty($endTime)))){
            $sql = "SELECT * FROM (select company_id, COUNT(id) as people_nums,AVG(score) as avg_score, company as company_name from base_user GROUP BY company_id) as ta {$sortstr}";
        }
        else {
            //循环conditions数组，生成执行查询操作的sql语句
            $where = "";
            if (is_array ( $conditions ) || is_array($keywords) || is_array($createTime) || is_array($endTime)) {
                $join = array ();

                if (!empty($conditions)) {
                    foreach ( $conditions as $key => $condition ) {
                        //检测具体条件是否为数组，如果是则拆分条件并用OR连接，两边加上括号
                        if(is_array($condition)){
                            $join2=array();
                            foreach ($condition as $key2 => $value){
                                $value=$this->escape($value);
                                $join2[]="{$key} = {$value}";
                            }
                            $join[] = '('.join( " OR ", $join2 ).')';
                        }
                        else{
                            //如果具体条件不是数组，则过滤字符串之后直接赋值
                            $condition = $this->escape ( $condition );
                            $join [] = "{$key} = {$condition}";
                        }
                    }
                }

                //模糊查询条件
                if(!empty($keywords)){
                    foreach ($keywords as $key3 => $keyword){
                        $join [] = $key3." LIKE CONCAT('%','$keyword','%')";
                    }
                }

                //时间段条件
                if(!empty($createTime)){
                    if ($createTime['from']!='') {
                        $join [] = "date_format(add_time,'%Y-%m-%d')>='".$createTime['from']."'";
                    }
                    if ($createTime['to']!='') {
                        $join [] = "date_format(add_time,'%Y-%m-%d')<='".$createTime['to']."'";
                    }
                }

                //时间段条件
                if(!empty($endTime)){
                    if ($endTime['from']!='') {
                        $join [] = "date_format(end_time,'%Y-%m-%d')>='".$endTime['from']."'";
                    }
                    if ($endTime['to']!='') {
                        $join [] = "date_format(end_time,'%Y-%m-%d')<='".$endTime['to']."'";
                    }
                }

                //将所有的条件用AND连接起来
                $where = "WHERE " . join ( " AND ", $join );
            } else {
                if (null != $conditions)
                    $where = "WHERE " . $conditions;
            }
            //根据$sort的值 选择要排序的字段
            $sql = "SELECT * FROM (select company_id, COUNT(id) as people_nums,AVG(score) as avg_score, company as company_name from base_user GROUP BY company_id) as ta {$where} {$sortstr}";
        }
        //查询数据库
        try {
            \ChromePhp::info($sql);
            $result ['dataList'] = $m_user->query($sql);
        } catch (Exception $ex) {
            $result ["errorCode"] = 2;
            $result ["errorInfo"] = '数据库操作失败';
            $result ["result"] = array (
                "isSuccess" => FALSE
            );
            return $result;
        }

        return \common::errorArray(0, "获取数据成功", $result);
    }





    /**
    *  根据条件查找所有用户
     */
    function findAllUsers($conditions, $keywords = null, $sort = null,$createTime = null,$endTime = null){

        $m_user = Db::name('base_user');
        if(empty($sort)){
            $sortstr = "";
        }
        else if(is_array($sort)){
            if(count($sort) == 0){
                $sortstr = "";
            }
            else{
                $sortstr = "ORDER BY";
                foreach ($sort as $key => $sortitem){
                    $sortarray[] = " {$sortitem['field']} {$sortitem['orderby']}";
                }
                $sortstr = $sortstr.join(',', $sortarray);
            }
        }
        else if(is_string($sort)){
            $sortstr = "ORDER BY ".$sort;
        }

        if(empty($conditions)&&(empty($keywords)&&(empty($createTime))&&(empty($endTime)))){
            $sql = "SELECT * FROM base_user {$sortstr}";
        }
        else {
            //循环conditions数组，生成执行查询操作的sql语句
            $where = "";
            if (is_array ( $conditions ) || is_array($keywords) || is_array($createTime) || is_array($endTime)) {
                $join = array ();

                if (!empty($conditions)) {
                    foreach ( $conditions as $key => $condition ) {
                        //检测具体条件是否为数组，如果是则拆分条件并用OR连接，两边加上括号
                        if(is_array($condition)){
                            $join2=array();
                            foreach ($condition as $key2 => $value){
                                $value=$this->escape($value);
                                $join2[]="{$key} = {$value}";
                            }
                            $join[] = '('.join( " OR ", $join2 ).')';
                        }
                        else{
                            //如果具体条件不是数组，则过滤字符串之后直接赋值
                            $condition = $this->escape ( $condition );
                            $join [] = "{$key} = {$condition}";
                        }
                    }
                }

                //模糊查询条件
                if(!empty($keywords)){
                    foreach ($keywords as $key3 => $keyword){
                        $join [] = $key3." LIKE CONCAT('%','$keyword','%')";
                    }
                }

                //时间段条件
                if(!empty($createTime)){
                    if ($createTime['from']!='') {
                        $join [] = "date_format(add_time,'%Y-%m-%d')>='".$createTime['from']."'";
                    }
                    if ($createTime['to']!='') {
                        $join [] = "date_format(add_time,'%Y-%m-%d')<='".$createTime['to']."'";
                    }
                }

                //时间段条件
                if(!empty($endTime)){
                    if ($endTime['from']!='') {
                        $join [] = "date_format(end_time,'%Y-%m-%d')>='".$endTime['from']."'";
                    }
                    if ($endTime['to']!='') {
                        $join [] = "date_format(end_time,'%Y-%m-%d')<='".$endTime['to']."'";
                    }
                }

                //将所有的条件用AND连接起来
                $where = "WHERE " . join ( " AND ", $join );
            } else {
                if (null != $conditions)
                    $where = "WHERE " . $conditions;
            }
            //根据$sort的值 选择要排序的字段
            $sql = "SELECT * FROM base_user {$where} {$sortstr}";
        }
        //查询数据库
        try {
            \ChromePhp::info($sql);
            $result ['dataList'] = $m_user->query($sql);
        } catch (Exception $ex) {
            $result ["errorCode"] = 2;
            $result ["errorInfo"] = '数据库操作失败';
            $result ["result"] = array (
                "isSuccess" => FALSE
            );
            return $result;
        }

        return \common::errorArray(0, "获取数据成功", $result);
    }


    public function escape($value)
    {
        return strip_tags($value);
    }

    /**
     * 分页查找用户
     * @param array $page
     * @param array $conditionList
     * @param string $sort
     * @param array $orList
     */
    function pagingUser($page,$conditionList,$sort = '',$orList = null){
        $m_user = Db::name('base_user');
        $page['pageIndex'] ? $pageIndex = $page['pageIndex'] : $pageIndex = 1;
        $page['pageSize'] ? $pageSize = $page['pageSize'] : $pageSize = 10;
        //与连接条件
        $orString = '';
        if(null != $orList && '' != $orList && count($orList) > 0){
            foreach ($orList as $orConditionList){
                if(empty($orConditionList)){//如果为空跳出循环
                    $orString = "";
                    break;
                }
                $per = "(";
                foreach ($orConditionList as $orCondition){
                    if('like' == $orCondition['operator']){
                        $per .= " {$orCondition['field']} like  '%{$orCondition['value']}%' OR";
                    }else if('in' == $orCondition['operator']){
                        $per .= " {$orCondition['field']} in  ({$orCondition['value']}) OR";
                    }else{
                        $per .= " {$orCondition['field']} {$orCondition['operator']}  {$this->escape($orCondition['value'])} OR";
                    }
                }
                $per = rtrim($per,"OR") . ")";
                $orString .= "{$per} AND";
            }
            $orString = rtrim($orString,"AND");
        }
        //和连接条件
        $whereString = "";
        if(count($conditionList) > 0){
            foreach ($conditionList as $condition){
                if('like' == $condition['operator']){
                    $whereString .= " {$condition['field']} like '%{$condition['value']}%' AND";
                }else if('in' == $condition['operator']){
                    $whereString .= " {$condition['field']} in ({$condition['value']}) AND";
                }else{
                    $value = $this->escape($condition['value']);
                    $whereString .= " {$condition['field']} {$condition['operator']} {$value} AND";
                }
            }
            $whereString = rtrim($whereString,"AND");
            $sql = "SELECT * FROM base_user WHERE{$whereString} ";
            if($orString){
                $sql = "{$sql}AND {$orString} ";
            }
        }else{
            if($orString){
                $sql = "SELECT * FROM base_user WHERE {$orString}";
            }else{
                $sql = "SELECT * FROM base_user ";
            }
        }
        //排序
        if(null != $sort && '' != $sort){
            $sort = "ORDER BY {$sort}";
        }
        //分页
        $m = ($pageIndex -1) * $pageSize;
        $n =  $pageSize;
        $sqlLimit =  "{$sql}{$sort} LIMIT {$m}, {$n}";
        $sqlTotal =  "{$sql}{$sort}";
        try {
            \ChromePhp::INFO($sqlLimit);
            $result['dataList'] =$m_user->query($sqlLimit);

            $result['sum'] = $m_user->query($sqlTotal);
            $sql = "SELECT count(*) as total_record_num  from ( {$sql} ) as count_table";
            $count = $m_user->query($sql);

            $result['pageInfo'] =[];
            //如果之后1页，手动添加分页信息
            if($result['pageInfo']==NULL){
                $result['pageInfo']['current_page'] = $pageIndex;
                $result['pageInfo']['first_page'] = 1;
                $result['pageInfo']['prev_page']=$pageIndex - 1;
                $result['pageInfo']['next_page']=$pageIndex + 1;
                $result['pageInfo']['last_page']=ceil ($count[0]['total_record_num'] / $pageSize);
                $result['pageInfo']['total_count']= $count[0]['total_record_num'];
                $result['pageInfo']['total_page'] = ceil ($count[0]['total_record_num'] / $pageSize);
                $result['pageInfo']['page_size'] = $pageSize;
                $result['pageInfo']['all_pages'] = ceil ($count[0]['total_record_num'] / $pageSize);
            }

            return \common::errorArray(0, "查询成功", $result);
        } catch (Exception $ex) {return \common::errorArray(1, "数据库操作失败", $ex);}
    }





    /**
     *    分页统计信息
     */

    function pagingCount($page,$conditionList,$sort = '',$orList = null){
        \ChromePhp::info($conditionList,"1111");
        $m_user = Db::name('base_user');
        $page['pageIndex'] ? $pageIndex = $page['pageIndex'] : $pageIndex = 1;
        $page['pageSize'] ? $pageSize = $page['pageSize'] : $pageSize = 10;
        //与连接条件
        $orString = '';
        if(null != $orList && '' != $orList && count($orList) > 0){
            foreach ($orList as $orConditionList){
                if(empty($orConditionList)){//如果为空跳出循环
                    $orString = "";
                    break;
                }
                $per = "(";
                foreach ($orConditionList as $orCondition){
                    if('like' == $orCondition['operator']){
                        $per .= " {$orCondition['field']} like  '%{$orCondition['value']}%' OR";
                    }else if('in' == $orCondition['operator']){
                        $per .= " {$orCondition['field']} in  ({$orCondition['value']}) OR";
                    }else{
                        $per .= " {$orCondition['field']} {$orCondition['operator']}  {$this->escape($orCondition['value'])} OR";
                    }
                }
                $per = rtrim($per,"OR") . ")";
                $orString .= "{$per} AND";
            }
            $orString = rtrim($orString,"AND");
        }
        //和连接条件
        $whereString = "";
        if(count($conditionList) > 0){
            foreach ($conditionList as $condition){
                if('like' == $condition['operator']){
                    $whereString .= " {$condition['field']} like '%{$condition['value']}%' AND";
                }else if('in' == $condition['operator']){
                    $whereString .= " {$condition['field']} in ({$condition['value']}) AND";
                }else{
                    $value = $this->escape($condition['value']);
                    $whereString .= " {$condition['field']} {$condition['operator']} {$value} AND";
                }
            }
            $whereString = rtrim($whereString,"AND");

            $sql = "SELECT * FROM (select company_id, COUNT(id) as people_nums,AVG(score) as avg_score, company as company_name from base_user GROUP BY company_id) as ta WHERE{$whereString} ";
            if($orString){
                $sql = "{$sql}AND {$orString} ";
            }
        }else{
            if($orString){
                $sql = "SELECT * FROM (select company_id, COUNT(id) as people_nums,AVG(score) as avg_score, company as company_name from base_user GROUP BY company_id) as ta WHERE {$orString}";
            }else{
                $sql = "SELECT * FROM (select company_id, COUNT(id) as people_nums,AVG(score) as avg_score, company as company_name from base_user GROUP BY company_id) as ta ";
            }
        }
        //排序
        if(null != $sort && '' != $sort){
            $sort = "ORDER BY {$sort}";
        }
        //分页
        $m = ($pageIndex -1) * $pageSize;
        $n =  $pageSize;
        $sqlLimit =  "{$sql}{$sort} LIMIT {$m}, {$n}";
        $sqlTotal =  "{$sql}{$sort}";
        try {
            \ChromePhp::INFO($sqlLimit);
            $result['dataList'] =$m_user->query($sqlLimit);

            $result['sum'] = $m_user->query($sqlTotal);
            $sql = "SELECT count(*) as total_record_num  from ( {$sql} ) as count_table";
            $count = $m_user->query($sql);

            $result['pageInfo'] =[];
            //如果之后1页，手动添加分页信息
            if($result['pageInfo']==NULL){
                $result['pageInfo']['current_page'] = $pageIndex;
                $result['pageInfo']['first_page'] = 1;
                $result['pageInfo']['prev_page']=$pageIndex - 1;
                $result['pageInfo']['next_page']=$pageIndex + 1;
                $result['pageInfo']['last_page']=ceil ($count[0]['total_record_num'] / $pageSize);
                $result['pageInfo']['total_count']= $count[0]['total_record_num'];
                $result['pageInfo']['total_page'] = ceil ($count[0]['total_record_num'] / $pageSize);
                $result['pageInfo']['page_size'] = $pageSize;
                $result['pageInfo']['all_pages'] = ceil ($count[0]['total_record_num'] / $pageSize);
            }

            return \common::errorArray(0, "查询成功", $result);
        } catch (Exception $ex) {return \common::errorArray(1, "数据库操作失败", $ex);}
    }




}