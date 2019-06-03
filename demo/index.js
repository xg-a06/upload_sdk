/*
 * @Description: 测试文件
 * @Author: xg-a06
 * @Date: 2019-05-23 00:04:31
 * @LastEditTime: 2019-06-03 16:18:23
 * @LastEditors: xg-a06
 */
import UploadSdk from '@/sdk'
import { $ } from '../src/lib/utils'

function http (opts) {
  let { method: method = 'get', url, data } = opts
  return fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }).then(res => res.json())
}

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
window.removeBtn = tid => {
  let tr = $(`#${tid}`)
  tr.parentNode.removeChild(tr)
  sdk.removeTask(tid)
}

const sdk = new UploadSdk({
  uploadUrl: 'http://127.0.0.1:8768/upload',
  multiple: true,
  resume: true,
  beforeHook (params, next) {
    let { hash } = params
    http({
      url: `http://127.0.0.1:8768/upload/${hash}`
    })
      .then(res => {
        if (!res.complete) {
          next(res.index)
        } else {
          console.log('已经上传过')
        }
      })
      .catch(err => console.log(err))
  }
})

sdk.on('addTask', function (data) {
  let tr = $(
    `<tr id="${data.id}"><td>${data.id}</td><td>${data.name}.${
      data.ext
    }</td><td>${
      data.size
    }</td><td><span class="demo_table_percent">0.00%</span> (已上传<span class="demo_table_loaded">0</span>)</td><td><button onclick="optBtn('${
      data.id
    }')" class="demo_table_optBtn">暂停</button><button class="demo_table_delBtn" onclick="removeBtn('${
      data.id
    }')" >删除</button></td></tr>`
  )
  $('#demo_table tbody').appendChild(tr)
})
sdk.on('progress', function (data) {
  let spanPercent = $(`#${data.id} .demo_table_percent`)
  let spanLoaded = $(`#${data.id} .demo_table_loaded`)
  spanPercent.innerText = data.percent
  spanLoaded.innerText = calculateSize(data.loaded)
})
sdk.on('complete', function (data) {
  let btn = $(`#${data.id} .demo_table_optBtn`)
  let del = $(`#${data.id} .demo_table_delBtn`)
  btn.parentNode.removeChild(btn)
  del.parentNode.removeChild(del)
  http({
    method: 'post',
    url: `http://127.0.0.1:8768/complete`,
    data: data
  })
    .then(res => {})
    .catch(err => console.log(err))
})
sdk.on('error', function (err) {
  console.log('error', err)
})

document.querySelector('#testBtn').addEventListener('click', () => {
  sdk.select()
})
