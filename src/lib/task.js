/* eslint-disable prefer-promise-reject-errors */
/*
 * @Description: 子任务类
 * @Author: xg-a06
 * @Date: 2019-06-01 07:10:33
 * @LastEditTime: 2019-06-04 00:36:59
 * @LastEditors: xg-a06
 */

import SparkMD5 from 'spark-md5'
import mime from 'mime'

const blobSlice =
  File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
const init = Symbol('init')
const split = Symbol('split')
const readNext = Symbol('readNext')
const SPLIT_SIZE = 4 * 1024 * 1024 // 4MB

class Task {
  constructor (file, ctx) {
    this.pauseState = false
    this.hash = null
    this.ctx = ctx
    this.file = file
    this.name = file.name.substring(0, file.name.lastIndexOf('.'))
    this.mimeType = file.type || mime.getType(file.name)
    this.ext = file.name.substring(file.name.lastIndexOf('.') + 1)
    this.size = file.size
    this.currentChunkIndex = 0
    this.chunkCount = 0
    this.retryTime = 0
    this.id = `tid_${Math.floor(Math.random() * 1000 + 1000)}`
    this.xhr = null
    this[init]()
  }
  get baseInfo () {
    return {
      id: this.id,
      name: this.name,
      ext: this.ext,
      size: this.file.size,
      type: this.mimeType,
      hash: this.hash,
      splitCount: this.chunkCount
    }
  }
  [split] () {
    return new Promise((resolve, reject) => {
      let { file } = this
      let spark = new SparkMD5.ArrayBuffer()
      let fileReader = new FileReader()
      this.splitSize = file.size
      if (this.ctx.opts.resume) {
        this.splitSize = SPLIT_SIZE
      }
      this.chunkCount = Math.ceil(file.size / this.splitSize)
      fileReader.onload = e => {
        let chunk = e.target.result
        spark.append(chunk)
        this.currentChunkIndex++
        if (this.currentChunkIndex < this.chunkCount) {
          this[readNext](fileReader)
        } else {
          this.hash = spark.end()
          this.currentChunkIndex = 0
          resolve()
        }
      }
      fileReader.onerror = error => {
        reject(error)
      }
      this[readNext](fileReader)
    })
  }
  [readNext] (fileReader) {
    let { currentChunkIndex, file, splitSize } = this
    let start = currentChunkIndex * splitSize
    let end = start + splitSize >= file.size ? file.size : start + splitSize
    fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
  }
  [init] () {
    this[split]()
      .then(() => {
        this.ctx.opts.beforeHook(this.baseInfo, index => {
          this.ctx.emit('addTask', this.baseInfo)
          this.currentChunkIndex = index || 0
          this.startUpload()
        })
      })
      .catch(error => {
        this.ctx.exception(error)
      })
  }
  startUpload () {
    let { uploadUrl, name, exParams } = this.ctx.opts
    let splitSize = this.splitSize
    let start = this.currentChunkIndex * splitSize
    let end = start + splitSize
    if (end > this.file.size) {
      end = this.file.size
    }
    let chunk = this.file.slice(start, end)
    let params = {
      url: uploadUrl,
      data: {
        index: this.currentChunkIndex,
        start: start,
        end: end,
        type: this.mimeType,
        hash: this.hash,
        name: `${this.name + this.hash}`,
        ext: this.ext,
        [name]: chunk,
        ...exParams
      }
    }
    this.upload(params)
  }
  pause () {
    this.pauseState = true
    if (this.xhr && this.xhr.status !== 200) {
      this.xhr.abort()
    }
  }
  resume () {
    this.pauseState = false
    this.startUpload()
  }
  upload (params) {
    let formData = new FormData()
    for (let key in params.data) {
      formData.append(key, params.data[key])
    }
    let xhr = (this.xhr = new XMLHttpRequest())
    xhr.open('post', params.url, true)
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 400) {
        this.currentChunkIndex++
        if (this.currentChunkIndex <= this.chunkCount - 1) {
          !this.pauseState && this.startUpload()
        } else {
          this.complete()
        }
      } else {
        if (this.retryTime < 2) {
          this.retryTime++
          this.startUpload()
        } else {
          this.ctx.exception({
            name: 'uploadError',
            message: `file:${this.file.name} code:${xhr.status} message:${
              xhr.responseText
            }`
          })
        }
      }
    }
    xhr.upload.onprogress = e => {
      let loaded = params.data.start + e.loaded
      let total = this.file.size
      if (loaded > total) {
        loaded = total
      }
      let info = this.baseInfo
      info.loaded = loaded
      info.total = total
      info.percent = `${((loaded / total) * 100).toFixed(2)}%`
      this.ctx.emit('progress', info)
    }
    xhr.onerror = e => {
      if (this.retryTime < 2) {
        this.retryTime++
        this.startUpload()
      } else {
        this.ctx.exception({
          name: 'uploadError',
          message: `file:${this.file.name} message:${e.message}`
        })
      }
    }
    xhr.send(formData)
    formData = null
  }
  complete () {
    this.ctx.emit('complete', this.baseInfo)
    this.xhr = null
    this.ctx.removeTask(this.id)
  }
}

export default Task
