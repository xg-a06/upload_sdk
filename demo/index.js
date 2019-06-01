/*
 * @Description: 测试文件
 * @Author: xg-a06
 * @Date: 2019-05-23 00:04:31
 * @LastEditTime: 2019-06-02 00:55:45
 * @LastEditors: xg-a06
 */
import UploadSdk from '@/sdk'

const sdk = (window.sdk = new UploadSdk({
  uploadUrl: 'http://127.0.0.1:8768/upload',
  multiple: true
  // accepts: ['gif', 'png']
}))

sdk.on('addTask', function (event) {
  console.log('addTask', event)
})
sdk.on('progress', function (event) {
  console.log('progress', event)
})
sdk.on('error', function (err) {
  console.log('error', err)
})

document.querySelector('#testBtn').addEventListener('click', () => {
  sdk.select()
})
