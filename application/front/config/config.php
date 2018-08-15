<?php
//配置文件
$root = 'http://192.168.235.1/sjd/public';
return [
    'view_replace_str'  => [
            '__JS__' => $root.'/static/js',
            '__CSS__' =>$root.'/static/css',
            '__IMG__' => $root.'/static/images',
            '__FONT__'=>$root.'/static/images/fonts',
            '__LOD__' =>$root.'/upload',
            '__PUBLIC__' => $root,
            '__TEMPLETE__' => $root.'/templete',
            '__HOST__' => $root,

            ],
];