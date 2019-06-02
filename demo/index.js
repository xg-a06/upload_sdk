/*
 * @Description: 测试文件
 * @Author: xg-a06
 * @Date: 2019-05-23 00:04:31
 * @LastEditTime: 2019-06-03 01:18:09
 * @LastEditors: xg-a06
 */
import UploadSdk from '@/sdk'
import { $ } from '../src/lib/utils'

function calculateSize (size) {
  let fileSize = size / 1024
  if (fileSize < 512) {
    return Math.round(fileSize) + 'KB'
  } else {
    return Math.round(fileSize / 1024) + 'MB'
  }
}

window.optBtn = tid => {
  let btn = $(`#${tid} .demo_table_optBtn`)
  if (btn.classList.contains('pause')) {
    btn.classList.remove('pause')
    btn.innerText = '暂停'
    sdk.resumeTask(tid)
  } else {
    btn.classList.add('pause')
    btn.innerText = '继续'
    sdk.pauseTask(tid)
  }
}

const sdk = (window.sdk = new UploadSdk({
  uploadUrl: 'http://127.0.0.1:8768/upload',
  multiple: true
  // accepts: ['gif', 'png']
}))

sdk.on('addTask', function (data) {
  let tr = $(
    `<tr id="${data.id}"><td>${data.id}</td><td>${data.name}.${
      data.ext
    }</td><td>${
      data.size
    }</td><td><span class="demo_table_percent">0.00%</span> (已上传<span class="demo_table_loaded">0</span>)</td><td><button onclick="optBtn('${
      data.id
    }')" class="demo_table_optBtn">暂停</button></td></tr>`
  )
  $('#demo_table tbody').appendChild(tr)
})
sdk.on('progress', function (data) {
  let spanPercent = $(`#${data.id} .demo_table_percent`)
  let spanLoaded = $(`#${data.id} .demo_table_loaded`)
  spanPercent.innerText = data.percent
  spanLoaded.innerText = calculateSize(data.loaded)
  // console.log('progress', data)
})
sdk.on('complete', function (data) {
  let btn = $(`#${data.id} .demo_table_optBtn`)
  btn.parentNode.removeChild(btn)
})
sdk.on('error', function (err) {
  console.log('error', err)
})

document.querySelector('#testBtn').addEventListener('click', () => {
  sdk.select()
})