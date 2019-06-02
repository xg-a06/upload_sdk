/*
 * @Description: 上传类
 * @Author: xg-a06
 * @Date: 2019-05-23 00:04:31
 * @LastEditTime: 2019-06-03 01:02:36
 * @LastEditors: xg-a06
 */

import EventEmitter from './event'
import Task from './task'
import { $, toArray, UserException } from './utils'
import mime from 'mime'

const init = Symbol('init')
const createElement = Symbol('createElement')
const analysisAccepts = Symbol('analysisAccepts')
const changeHandler = Symbol('changeHandler')
const check = Symbol('check')

let defaultOptions = {
  exParams: {},
  beforeHook (params, next) {
    next()
  },
  uploadUrl: '',
  afterHook (next) {
    next({ index: 1 })
  },
  accepts: [],
  name: 'file',
  multiple: false,
  resume: true
}

class UploadSDK extends EventEmitter {
  constructor (options) {
    super()
    this.id = null
    this.el = null
    this._accepts = []
    this.tasks = []
    this.opts = Object.assign({}, defaultOptions, options)
    this[init]()
  }
  [init] () {
    this[createElement]()
    this.el.addEventListener('change', e => this[changeHandler](e))
  }
  [createElement] () {
    this.id = `file${Math.floor(Math.random() * 1000 + 1000)}`
    let { name, multiple, accepts } = this.opts
    this.el = $(
      `<input 
      type="file" 
      name="${name}" 
      id="${this.id}" 
      accept="${this[analysisAccepts](accepts).toString()}"
      ${multiple ? 'multiple' : ''} />`
    )
  }
  [analysisAccepts] (accepts) {
    if (accepts.length === 0) {
      this._accepts = ['*']
    } else {
      this._accepts = accepts.reduce((prev, next) => {
        prev.push(mime.getType(next))
        return prev
      }, [])
    }
    return this._accepts
  }
  [changeHandler] (e) {
    if (this.el.files.length > 0) {
      let files = toArray(this.el.files)
      this.el.value = ''
      let checkResult = this[check](files)
      if (checkResult !== true) {
        this.exception({
          name: 'formatError',
          message: `选择的文件格式不在设置项accept(${this.opts.accepts.toString()})中`
        })
        return
      }
      files.forEach(file => this.addTask(file))
    }
  }
  [check] (files) {
    return (
      this._accepts[0] === '*' ||
      files.every(file => {
        return this._accepts.indexOf(mime.getType(file.name)) !== -1
      })
    )
  }
  exception (error) {
    if (!this.emit('error', error)) throw new UserException(error)
  }
  select () {
    this.el.click()
  }
  addTask (file) {
    let task = new Task(file, this)
    this.tasks.push(task)
  }
  removeTask (taskId) {
    let index = this.tasks.findIndex(task => task.id === taskId)
    if (index !== -1) {
      this.tasks.splice(index, 1)
    }
  }
  pauseTask (tid) {
    let task = this.tasks.find(task => task.id === tid)
    task.pause()
  }
  resumeTask (tid) {
    let task = this.tasks.find(task => task.id === tid)
    task.resume()
  }
}

export default UploadSDK
