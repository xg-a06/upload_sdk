/*
 * @Description: 工具模块
 * @Author: xg-a06
 * @Date: 2019-06-01 07:32:16
 * @LastEditTime: 2019-06-01 09:10:47
 * @LastEditors: xg-a06
 */

const htmlReg = /^<(.+)>?[\s\S]*<?\/\1?>$/gm

export function $ (selector) {
  if (htmlReg.test(selector)) {
    let div = document.createElement('div')
    div.innerHTML = selector
    return div.children[0]
  }
  return document.querySelector(selector)
}

export function toArray (arrayLike) {
  return Array.prototype.slice.call(arrayLike)
}

export function UserException (error) {
  ;({ name: this.name, message: this.message } = error)
}
