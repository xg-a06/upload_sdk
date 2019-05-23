// import SparkMD5 from 'spark-md5'

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('file').addEventListener('change', function () {
    testUpload(this.files[0])
    // var blobSlice =
    //   File.prototype.slice ||
    //   File.prototype.mozSlice ||
    //   File.prototype.webkitSlice
    // var file = this.files[0]
    // var chunkSize = 4 * 1024 * 1024 // Read in chunks of 2MB
    // var chunks = Math.ceil(file.size / chunkSize)
    // var currentChunk = 0
    // var spark = new SparkMD5.ArrayBuffer()
    // var fileReader = new FileReader()
    // fileReader.onload = function (e) {
    //   console.log('read chunk nr', currentChunk + 1, 'of', chunks)
    //   spark.append(e.target.result) // Append array buffer
    //   currentChunk++
    //   if (currentChunk < chunks) {
    //     loadNext()
    //   } else {
    //     console.log('finished loading')
    //     console.info('computed hash', spark.end()) // Compute hash
    //   }
    // }
    // fileReader.onerror = function () {
    //   console.warn('oops, something went wrong.')
    // }
    // function loadNext () {
    //   var start = currentChunk * chunkSize
    //   var end = start + chunkSize >= file.size ? file.size : start + chunkSize
    //   fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
    // }
    // loadNext()
  })
})

function testUpload (file) {
  console.log(file.size)

  let formData = new FormData()
  formData.append('start', '哈哈')
  // formData.append('end', file.size - 1)
  // formData.append('size', file.size)
  // formData.append('fileOriName', '测试图片')
  formData.append('file', file)
  let xhr = new XMLHttpRequest()
  xhr.open('post', 'http://127.0.0.1:8768/upload', true)
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (parseInt(xhr.status) === 200) {
        console.log('上传成功')
      } else {
        console.log('上传失败')
      }
    }
  }
  xhr.send(formData)
}
