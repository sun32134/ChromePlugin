var port=null;
const RET_FAILED=1
const DEPOSIT=2
const DIS_CONNECT=3
const BALANCE=4
const PURCHASE=5
const REPLY_MAC2=6

var getKeys = function(obj){
    var keys = [];
    for(var key in obj){
       keys.push(key);
    }
    return keys;
 }

function sendNativeMessage(obj) {
    if(!port){
        return;
    }
    port.postMessage(obj);
}
  
function onNativeMessage(message) {
    chrome.tabs.query({active:true,currentWindow:true},function(tabs){
        chrome.tabs.sendMessage(tabs[0].id,JSON.stringify(message));
    })
}

function onDisconnected() {
    var message={
        "cmd":DIS_CONNECT
    }
    chrome.tabs.query({active:true,currentWindow:true},function(tabs){
        chrome.tabs.sendMessage(tabs[0].id,JSON.stringify(message));
    })
    port = null;
}

function connect(){
	var hostName="com.lianxin.card";
	port=chrome.runtime.connectNative(hostName);
	port.onMessage.addListener(onNativeMessage);
	port.onDisconnect.addListener(onDisconnected);
}


chrome.runtime.onConnect.addListener(function(port){
    console.assert(port.name=="card" || port.name=="purchase");
    port.onMessage.addListener(function(msg){
        if(msg.cmd==="connect"){
            connect();
        }
        else if(msg.cmd==="deposit"){
            port.postMessage("send deposit cmd to native host");
            console.log(msg.obj);
            sendNativeMessage(msg.obj);
        }
        else if(msg.cmd==="disconnect"){
            port.postMessage("disconnect native host");
            sendNativeMessage(msg.obj);
        }
        else if(msg.cmd==="mac2"){
            port.postMessage("reply mac2 to localhost");
            sendNativeMessage(msg.obj);
        }
        else if(msg.cmd==='balance'){
            port.postMessage('get balance');
            sendNativeMessage(msg.obj);
        }
        else if(msg.cmd==="purchase"){
            port.postMessage("purchase");
            sendNativeMessage(msg.obj);
        }
        else if(msg.cmd==="debug"){
            console.log(msg.obj);
        }
    })
})