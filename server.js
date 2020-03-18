var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if(!port){
    console.log('请指定端口奥好不好？\nnode server.js 8888 这样不会吗？')
    process.exit(1)
}

var server = http.createServer(function(request, response){
    var parsedUrl = url.parse(request.url, true)
    var pathWithQuery = request.url
    var queryString = ''
    if(pathWithQuery.indexOf('?') >= 0){queryString=pathWithQuery.substring(pathWithQuery.indexOf('?'))}
    var path = parsedUrl.pathname
    var query = parsedUrl.query
    var method = request.method

    /*********从这里开始看，上面不要看*********/
    console.log('方方说：含查询字符串的路径为\n' + pathWithQuery)
    
    if(path === '/'){
        let string = fs.readFileSync('./index.html', 'utf-8')  //同步读取网页文件
        let cookies = request.headers.cookie.split('; ')
        let hash = {}
        for(let i=0; i<cookies.length; i++){
            let parts = cookies[i].split('=')
            let key = parts[0]
            let value = parts[1]
            hash[key] = value
        }
        let email = hash.sign_in_email
        let users = fs.readFileSync('./db/users', 'utf8')
        users = JSON.parse(users)
        let foundUser
        for(let i=0; i< users.length; i++){
            if(users[i].email === email){
                foundUser = users[i]
                break
            }
        }
        if(foundUser){
            string = string.replace('__password__', foundUser.password)
        }else{
            string = string.replace('__password__', '不知道')
        }

        response.statusCode = 200
        response.setHeader('Content-Type', 'text/html;charset=utf-8')
        response.write(string)    // 将网页文件写入到response中返回
        response.end()
    }else if(path==='/sign_up' && method === 'GET'){
        let string = fs.readFileSync('./sign_up.html', 'utf-8')
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/html;charset=utf-8')
        response.write(string)
        response.end()
    }else if(path==='/sign_up' && method === 'POST'){
        readBody(request).then((body)=>{
            let strings = body.split('&')    // ['email=1', 'password=2', 'password_confirmation=3']
            let hash = {}
            strings.forEach((string)=>{
                let parts = string.split('=')    // ['email', '1']
                let key = parts[0]
                let value = parts[1]
                // 进行转译，否则会拿不到@，使用%40代替
                hash[key] = decodeURIComponent(value)    // hash['email'] = '1'
            })
            // let email = hash['email']
            // let password = hash['password']
            // let password_confirmation = hash['password_confirmation']
            let {email, password, password_confirmation} = hash
            if(email.indexOf('@') === -1){
                response.statusCode = 400
                response.setHeader('Content-Type', 'application/json;charset=utf-8')
                // 我们返回JSON数据，这样就可以实现选择性展示出错误信息，最外端的''不属于JSON，只表示是一个字符串
                // JS可以理解JSON语法
                response.write(`{
                    "errors": {
                        "email": "invalid"
                    }
                }`)
            }else if(password !== password_confirmation){
                response.statusCode = 400
                response.write('password not match')
            }else{
                // 这个users拿到之后是一个字符串
                var users = fs.readFileSync('./db/users', 'utf8')
                try{
                    users = JSON.parse(users)    // []
                }catch{
                    users = []
                }
                let inUse = false
                for(let i=0; i<users.length; i++){
                    let user = users[i]
                    if(user.email === email){
                        inUse = true
                        break;
                    }
                }
                if(inUse){
                    response.statusCode = 400
                    response.write('email in use')
                }else{
                    users.push({email: email, password: password})
                    // 对象不能直接存，我们需要使用字符串化
                    var usersString = JSON.stringify(users)
                    fs.writeFileSync('./db/users', usersString)
                    response.statusCode = 200
                }
                
            }
            response.end()
        })
    }else if(path === '/sign_in' && method === 'GET'){
        let string = fs.readFileSync('./sign_in.html', 'utf-8')
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/html;charset=utf-8')
        response.write(string)
        response.end()
    }else if(path === '/sign_in' && method === 'POST'){
        readBody(request).then((body)=>{
            let strings = body.split('&')    // ['email=1', 'password=2', 'password_confirmation=3']
            let hash = {}
            strings.forEach((string)=>{
                let parts = string.split('=')    // ['email', '1']
                let key = parts[0]
                let value = parts[1]
                // 进行转译，否则会拿不到@，使用%40代替
                hash[key] = decodeURIComponent(value)    // hash['email'] = '1'
            })
            // let email = hash['email']
            // let password = hash['password']
            // let password_confirmation = hash['password_confirmation']
            let {email, password} = hash
            var users = fs.readFileSync('./db/users', 'utf8')
            try{
                users = JSON.parse(users)    // []
            }catch{
                users = []
            }
            let found
            for(let i=0;i<users.length;i++){
                if(users[i].email === email && users[i].password === password){
                    found = true
                    break
                }
            }
            console.log(found)
            if(found){
                // 设置cookie
                response.setHeader('Set-Cookie', `sign_in_email=${email}; HttpOnly`)
                response.statusCode = 200
            }else{
                response.statusCode = 401
            }
            response.end()
        })
    }else if(path==='/xxxx'){
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/json;charset=utf-8')
        // 加一个后台的响应头，告诉浏览器，这个域名可以访问我的后台
        response.setHeader('Access-Control-Allow-Origin', 'http://frank.com:8001')
        // 这边其实返回的是一个字符串，这个字符串刚好符合JSON语法，此处绝对不是一个对象
        response.write(`
            {
                "note": {
                    "to": "小谷",
                    "from": "芳芳",
                    "heading": "打招呼",
                    "content": "hi"
                }
            }
        `)
        response.end()
    }else if(path='/main.js'){
        let string = fs.readFileSync('./main.js')  //同步读取网页文件
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/javascript;charset=utf-8')
        response.write(string)    // 将网页文件写入到response中返回
        response.end()
    }else{
        response.statusCode = 404
        response.setHeader('Content-Type', 'text/html;charset=utf-8')
        response.write('呜呜呜')
        response.end()
    }

    /*********代码结束，下面不要看*********/
})

function readBody(request){
    return new Promise((resolve, reject)=>{
        let body = [];    // 请求体
        // request监听data事件，每次data事件会给一小块数据
        request.on('data', (chunk) => {
            // 将一小块数据放入body中
            body.push(chunk);
        }).on('end', () => {
            // end就是上传结束，将body里面的数据全部连成字符串
            body = Buffer.concat(body).toString();
            resolve(body)
        })
    })
}

server.listen(port)
console.log('监听 ' + port + ' 成功\n请在空中转体720度然后用电饭煲打开 http://localhost:' + port)