/*
 * @Description: 工具模块
 * @Author: xg-a06
 * @Date: 2019-06-01 07:32:16
 * @LastEditTime: 2019-06-03 00:36:11
 * @LastEditors: xg-a06
 */

const htmlReg = /^<(.+)>?[\s\S]*<?\/\1?>$/m
const wrapMap = {
  option: [1, "<select multiple='multiple'>", '</select>'],
  thead: [1, '<table>', '</table>'],
  col: [2, '<table><colgroup>', '</colgroup></table>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  _default: [0, '', '']
}
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption =
  wrapMap.thead
wrapMap.th = wrapMap.td

export function $ (selector) {
  if (htmlReg.test(selector)) {
    let tmp = document.createElement('div')
    let tag = /<([\w:]+)/.exec(selector)[1].toLowerCase()
    let wrap = wrapMap[tag] || wrapMap._default
    tmp.innerHTML = wrap[1] + selector + wrap[2]
    let j = wrap[0]
    while (j--) {
      tmp = tmp.lastChild
    }
    return tmp.children[0]
  }
  return document.querySelector(selector)
}

export function toArray (arrayLike) {
  return Array.prototype.slice.call(arrayLike)
}

export function UserException (error) {
  ;({ name: this.name, message: this.message } = error)
}
