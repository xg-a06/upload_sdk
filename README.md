<!--
 * @Description: 
 * @Author: xg-a06
 * @Date: 2019-06-03 15:00:22
 * @LastEditTime: 2019-06-03 15:56:46
 * @LastEditors: xg-a06
 -->
# a06-upload-sdk 上传sdk

js实现的上传文件sdk,支持断点续传

## 安装

```sh
npm install a06-upload-sdk
```

## 加载方式

支持全局引入,commonjs,esm三种加载方式

```sh
//global
<script src="https://unpkg.com/element-ui/lib/index.js"></script>

commonjs
const UploadSdk = require('@/sdk').default

esm
import UploadSdk from '@/sdk'
```

## 使用

以esm加载方式为例,代码如下

### params结构

```sh
    // {
    //   ext: 'png'
    //   hash: 'xxxx'
    //   id: 'tid_1390'
    //   name: 'TIM截图20180725012456'
    //   size: 206845
    //   splitCount: 0
    //   type: 'image/png'
    // }
```

```sh
import UploadSdk from '@/sdk'
  
const sdk = new UploadSdk({
  //上传接口,必传
  uploadUrl: 'http://127.0.0.1:8768/upload',  
  //是否开启多文件选择,默认为false
  multiple: true,
  //设置允许上传的文件类型,默认为*全部
  accepts: ['gif','png'],
  //开始上传文件之前的钩子,不关心可以不传,允许你根据你的业务情况终止此次上传,
  //params为回调参数,
  //next用来决定是否继续往下执行上传,不调用则终止此次上传
  beforeHook (params, next) {
    //你的业务代码,决定是否next,next中的参数是切片索引,如果不启用断点续传那么
    //直接传0或者不传.如果启用断点上传那么这里传入当前上传到哪个分片
    //ajax获取服务端保存的分片信息,比如服务端返回当前这个文件已经上传到片段5,那么
    //next(5)
  },
  //input file的name值,默认file
  name: 'file',
  //是否开始断点续传,默认false
  resume: true,
  //自定义参数,你的业务字段,如鉴权等,这些参数会在调用upload接口的时候一起传上去
  exParams: {
    token: 'xxxxxxxxxxooooooooo',
    test: 1
  }
})

//调用选择文件
sdk.select()
//暂停指定上传任务
sdk.pauseTask(tid)
//恢复指定上传任务
sdk.resumeTask(tid)
//删除指定上传任务
sdk.removeTask(tid)

//添加任务事件,会在beforeHook执行过后,上传开始之前触发
sdk.on('addTask', function (data) {
  console.log('addTask', data)
  // {
  //   ext: "png"
  //   hash: "2f1e861d563b5782f9dcd23ac8b98a38"
  //   id: "tid_1321"
  //   name: "TIM截图20180725012456"
  //   size: 206845
  //   splitCount: 0
  //   type: "image/png"
  // }
 
})
//上传进度事件
sdk.on('progress', function (data) {
  console.log('progress', data)
  // {
  //   ext: "png"
  //   hash: "2f1e861d563b5782f9dcd23ac8b98a38"
  //   id: "tid_1619"
  //   loaded: 206845
  //   name: "TIM截图20180725012456"
  //   percent: "100.00%"
  //   size: 206845
  //   splitCount: 0
  //   total: 206845
  //   type: "image/png"
  // }
})
//上传完毕事件
sdk.on('complete', function (data) {
  console.log('complete', data)
  // {
  //   ext: 'png'
  //   hash: null
  //   id: 'tid_1894'
  //   name: 'TIM截图20180725012456'
  //   size: 206845
  //   splitCount: 0
  //   type: 'image/png'
  // }
})
//发生错误事件,用于捕获sdk抛出的异常
sdk.on('error', function (err) {
  console.log('error', err)
})

```

## 帮助

该sdk编写了配套的服务端demo(nodejs实现),方便你使用此sdk进行本地实验.,[github地址](https://github.com/xg-a06/upload_sdk_demo_server)

## License

The MIT license.
