// myButton.addEventListener('click', (e)=>{
//     let request = new XMLHttpRequest()    // 创建一个请求对象
//     request.open('POST', '/xxxx')    // 配置参数
//     request.setRequestHeader('frank', '18')    // 这个参数需要设置在open和send之间
//     request.onreadystatechange = ()=>{
//         if(request.readyState === 4){
//             console.log('请求响应都结束了')

//             if(request.status >=200 && request.status < 300){
//                 console.log('请求成功。')
//                 console.log(request.getAllResponseHeaders())    // 获取响应头
//                 console.log(request.statusText)    // 获取状态文本
//                 console.log(request.getResponseHeader('Content-Type'))    // 获取指定响应头
//                 console.log(request.responseText)    // 读取响应的第四部分
//                 console.log(typeof request.responseText)    // String

//                 let string = request.responseText
//                 // 把符合JSON语法的字符串转换成JS对应的值
//                 let object = window.JSON.parse(string)
//                 console.log(typeof object)
//                 console.log(object.note)
//                 console.log(object.note.from)

//             }else if(request.status >= 400){
//                 console.log('请求失败。')
//             }
//         }
//     }
    
//     request.send('我偏要设置第四部分')    // 发送请求
// })

window.jQuery = {}

// 封装
window.jQuery.ajax = function({url,method, body, successFn, failFn, headers}){

    let request = new XMLHttpRequest()    // 创建一个请求对象
    request.open(method, url)    // 配置参数
    for(let key in headers){
        let value = headers[key]
        request.setRequestHeader(key, value)
    }
    request.onreadystatechange = ()=>{
        if(request.readyState === 4){
            if(request.status >=200 && request.status < 300){
                successFn.call(undefined, request.responseText)
            }else if(request.status >= 400){
                failFn.call(undefined, request)
            }
        }
    }
    request.send(body)    // 发送请求
}

window.$ = window.jQuery
// 绑定
myButton.addEventListener('click', (e)=>{
    window.jQuery.ajax({
        url: '/xxx',
        method: 'get',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'frank': '18'
        },
        successFn: (x)=>{console.log(x)},
        failFn: ()=>{}
    })
})