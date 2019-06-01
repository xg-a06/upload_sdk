/* eslint-disable prefer-promise-reject-errors */
/*
 * @Description: 子任务类
 * @Author: xg-a06
 * @Date: 2019-06-01 07:10:33
 * @LastEditTime: 2019-06-02 02:04:50
 * @LastEditors: xg-a06
 */

import SparkMD5 from 'spark-md5'

const blobSlice =
  File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
const init = Symbol('init')
const split = Symbol('split')
const readNext = Symbol('readNext')
const SPLIT_SIZE = 4 * 1024 * 1024 // 4MB

class Task {
  constructor (file, ctx) {
    this.hash = null
    this.ctx = ctx
    this.file = file
    this.size = file.size
    this.needResume = this.size > SPLIT_SIZE
    this.chunks = []
    this.spark = new SparkMD5.ArrayBuffer()
    this.fileReader = new FileReader()
    this.currentChunkIndex = 0
    this.chunkCount = 0
    this.retryTime = 0
    this.id = `tid_${Math.floor(Math.random() * 1000 + 1000)}`
    this[init]()
  }
  [split] () {
    return new Promise((resolve, reject) => {
      let { needResume, file, chunks, spark, fileReader } = this
      if (needResume) {
        this.chunkCount = Math.ceil(file.size / SPLIT_SIZE)
        fileReader.onload = e => {
          let chunk = e.target.result
          chunks.push(chunk)
          spark.append(chunk)
          this.currentChunkIndex++
          if (this.currentChunkIndex < this.chunkCount) {
            this[readNext]()
          } else {
            this.hash = spark.end()
            this.currentChunkIndex = 0
            resolve()
          }
        }
        fileReader.onerror = error => {
          reject(error)
        }
        this[readNext]()
      } else {
        chunks.push(this.file)
        resolve()
      }
    })
  }
  [readNext] () {
    let { currentChunkIndex, file, fileReader } = this
    let start = currentChunkIndex * SPLIT_SIZE
    let end = start + SPLIT_SIZE >= file.size ? file.size : start + SPLIT_SIZE
    fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
  }
  [init] () {
    this[split]()
      .then(() => {
        this.ctx.opts.beforeHook(
          {
            hash: this.hash
          },
          index => {
            this.currentChunkIndex = index || 0
            this.startUpload()
          }
        )
      })
      .catch(error => {
        this.ctx.exception(error)
      })
  }
  startUpload () {
    let { uploadUrl, name, exParams } = this.ctx.opts
    let start = this.currentChunkIndex * SPLIT_SIZE
    let end = start + SPLIT_SIZE
    if (end > this.file.size) {
      end = this.file.size
    }
    let params = {
      url: uploadUrl,
      data: {
        index: this.currentChunkIndex,
        start: start,
        end: end,
        [name]: this.chunks[this.currentChunkIndex],
        ...exParams
      }
    }
    this.upload(params)
  }
  upload (params) {
    let formData = new FormData()
    for (let key in params.data) {
      formData.append(key, params.data[key])
    }
    let xhr = new XMLHttpRequest()
    xhr.open('post', params.url, true)
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 400) {
        if (params.data.end === this.file.size) {
          let loaded = params.data.end
          let total = this.file.size
          this.ctx.emit('progress', {
            id: this.id,
            name: this.file.name,
            loaded: loaded,
            total: total,
            percent: `${((loaded / total) * 100).toFixed(2)}%`
          })
        }
        this.currentChunkIndex++
        if (this.currentChunkIndex <= this.chunkCount - 1) {
          this.startUpload()
        } else {
          // 完成后的处理
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
      if (e.lengthComputable) {
        let loaded = params.data.start + e.loaded
        let total = this.file.size
        this.ctx.emit('progress', {
          id: this.id,
          name: this.file.name,
          loaded: loaded,
          total: total,
          percent: `${((loaded / total) * 100).toFixed(2)}%`
        })
      }
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
  }
}

export default Task
