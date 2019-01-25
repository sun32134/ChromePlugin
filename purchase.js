var port= chrome.runtime.connect({name: "purchase"});
const RET_FAILED=1
const DEPOSIT=2
const DIS_CONNECT=3
const BALANCE=4
const PURCHASE=5
const REPLY_MAC2=6

window.onbeforeunload=function(){
    disconnect();
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

function appendMessage(text) {
    document.getElementById('response').innerHTML += "<p>" + text + "</p>";
}

function connect(){
    port.postMessage({cmd:"connect"});
    appendMessage('connect');
}

port.onMessage.addListener(function(msg){
    appendMessage(msg);
})

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

function purchaseMessage(){
    var dealnum=document.getElementById('dealnum').value;
    console.log(dealnum);
    var dealtime=document.getElementById('dealtime').value;
    console.log(dealtime);
    var city=document.getElementById('city').value;
    console.log(city);
    var obj={
        code:PURCHASE,
        dealnum:dealnum,
        dealtime:dealtime,
        city:city
    }
    port.postMessage({
        cmd:"purchase",
        obj:obj
    })
}

var connBtn=document.getElementById('connect-button');
connBtn.addEventListener("click",connect,false);
var disconnBtn=document.getElementById('dis-connect-button');
disconnBtn.addEventListener("click",disconnect,false);
var depositBtn=document.getElementById('purchase-button');
depositBtn.addEventListener('click', purchaseMessage, false);

chrome.extension.onMessage.addListener(function(message){
    appendMessage(message);
    var obj=JSON.parse(message);

    if(obj.cmd===DIS_CONNECT){
        // TODO 提示网站本地服务器断开连接
    }
    else if(obj.cmd===BALANCE){
        // TODO 本地服务器返回余额，跳转至余额界面
        console.log(obj.res);
        var url='/balance/'+obj.res;
        console.log(url);
        redirect(url);
    }
    else if(obj.cmd===PURCHASE){
        console.log(obj.res);
       if(obj.res==RET_FAILED){
            console.log('消费失败')
       }
       else{
        console.log('消费成功')
        console.log(obj.res);
        getBalance();
       } 
    }
})