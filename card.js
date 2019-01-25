var port= chrome.runtime.connect({name: "card"});
const RET_FAILED=1
const DEPOSIT=2
const DIS_CONNECT=3
const BALANCE=4
const PURCHASE=5
const REPLY_MAC2=6

window.onbeforeunload=function(){
    disconnect();
}

function appendMessage(text) {
    document.getElementById('response').innerHTML += "<p>" + text + "</p>";
}

function connect(){
    port.postMessage({cmd:"connect"});
    appendMessage('connect');
}

function depositMessage(){
    var volume=document.getElementById('volume').value;
    console.log(volume);
    var terminatorno=document.getElementById('terminatorno').value;
    console.log(terminatorno);
    var transtime=document.getElementById('transtime').value;
    console.log(transtime);
    var obj={
        code:DEPOSIT,
        dealnum:volume,
        posnum:terminatorno,
        dealtime:transtime
    }
    port.postMessage({
        cmd:"deposit",
        obj:obj
    })
}

function disconnect(){
    var obj={
        code:DIS_CONNECT
    }
    port.postMessage({
        cmd:"disconnect",
        obj:obj
    })
}

function replyMAC2(MAC2){
    var transtime=document.getElementById('transtime').value;
    console.log("MAC2");
    console.log(MAC2)
    var obj={
        code:REPLY_MAC2,
        MAC2:MAC2,
        dealtime:transtime
    }
    port.postMessage({
        cmd:'mac2',
        obj:obj
    });
}

function getBalance(){
    var obj={
        code:BALANCE,
    }
    port.postMessage({
        cmd:'balance',
        obj:obj
    });
}

function redirect(url){
    window.location.href=url;
}

function sendToServer(message){
    const http=new XMLHttpRequest();
    
    var data="80190000F4"+message
    console.log(data);
    http.open('POST','/');
    http.setRequestHeader('Content-type','application/text');
    http.send(data);
    http.onload=function(){
        console.log(http.responseText);
        // TODO: 收到服务器发来的MAC2，对卡完成认证后，得到卡的余额，跳转到新网页，展示余额
        // window.open('http://192.168.1.49:30000/','_self');
        replyMAC2(http.responseText);
    }
    // window.location.href="/balance";
}

port.onMessage.addListener(function(msg){
    appendMessage(msg);
})

var connBtn=document.getElementById('connect-button');
connBtn.addEventListener("click",connect,false);
var disconnBtn=document.getElementById('dis-connect-button');
disconnBtn.addEventListener("click",disconnect,false);
var depositBtn=document.getElementById('deposit-button');
depositBtn.addEventListener('click',depositMessage,false);


chrome.extension.onMessage.addListener(function(message){
    appendMessage(message);
    var obj=JSON.parse(message);
    if(obj.cmd===DEPOSIT){
        // TODO 将证书，签名发送到服务器
        if(obj.res==RET_FAILED){
            console.log("圈存初始化失败")
        }
        else{
            console.log(obj.res);
            sendToServer(obj.res);
        }
    }
    else if(obj.cmd===DIS_CONNECT){
        // TODO 提示网站本地服务器断开连接
        console.log('读卡器断开连接')
    }
    else if(obj.cmd===BALANCE){
        // TODO 本地服务器返回余额，跳转至余额界面
        if(obj.res==RET_FAILED){
            console.log('取余额失败')
        }
        else{
            console.log(obj.res);
            var url='/balance/'+obj.res;
            console.log(url);
            redirect(url);
        }
        
    }
    else if(obj.cmd===REPLY_MAC2){
        // TODO 检查返回值是否合法，合法则获取余额，转到余额界面
        if(obj.res==RET_FAILED){
            console.log('圈存失败')
        }
        else{
            console.log('圈存成功')
            console.log(obj.res);
            getBalance();
        }
    }
})