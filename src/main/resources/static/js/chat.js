var stompClient = null;
var receiver;
var username;

function connect() {
    var socket = new SockJS('/chat-websocket');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        var strFrame = frame.toString();
        var userInfo = strFrame.substr(9, 17);
        username = userInfo.split(":")[1];
        $("#online_status").text("您的状态:在线");
        stompClient.subscribe('/user/queue/notifications', function (formateMsg) {
            var jsonMsg = JSON.parse(formateMsg.body);
            var content = jsonMsg.message;
            var sender = jsonMsg.sender;
            var title = sender + "给您发了一条消息";
            if ('0' == jsonMsg.type) {//视频通话请求
                layer.open({
                    content: sender + '向你发起了视频请求，是否接听？',
                    yes: function (index, layero) {
                        makeCall();
                        layer.close(index); //如果设定了yes回调，需进行手工关闭
                    },
                    cancel: function (index, layero) {
                        if (confirm('确定要关闭么')) { //只有当点击confirm框的确定时，该层才会关闭
                            layer.close(index)
                        }
                        return false;
                    }
                });
            }else if ('1' == jsonMsg.type) {//文字消息
                showMessage(content, false);
                notify(title, content);
            } else if('2' == jsonMsg.type){//文件消息
                var strContent =content.toString();
                if(strContent.indexOf(".jpg")>0||strContent.indexOf(".png")>0){
                    showImg(content,false);
                }else{
                    showMessage(content, false);
                }

            }
        });
    });
}

function showImg(content,self) {
    var talkComponent;
    var image = '<img src="'+content+'" border="0" onclick="showImgeDeatil(this)" />';
    if (self) {
        talkComponent = '<li class="me"><img class="img_me" src="/static/images/own_head.jpg" title="' + username + '"><span style="word-wrap:break-word;width:300px">' + image + '</span></li>';
    } else {
        talkComponent = '<li class="other"><img class="img_other" src="/static/images/head/15.jpg" title="' + username + '"><span style="word-wrap:break-word;width:300px">' + image + '</span></li>';
    }

    $("#chat_history").append(talkComponent);

    //设置滚动条到最底部
    $("#chat_history").slimScroll({scrollTo: '9999999999px'});

    //设置task 元素颜色
    var talk = document.getElementById('toolbox');
    var text = document.getElementById('input_area');
    talk.style.background = "#fff";
    text.style.background = "#fff";
}
function showImgeDeatil(data) {
    layer.open({
        title: "图片详情",
        type: 2,
        content: data.src,
        area: ['500px', '500px']
    });
}

function showMessage(message, self) {
    var talkComponent;
    if (self) {
        talkComponent = '<li class="me"><img class="img_me" src="/static/images/own_head.jpg" title="' + username + '"><span style="word-wrap:break-word;width:300px">' + replace_em(message) + '</span></li>';
    } else {
        talkComponent = '<li class="other"><img class="img_other" src="/static/images/head/15.jpg" title="' + username + '"><span style="word-wrap:break-word;width:300px">' + replace_em(message) + '</span></li>';
    }

    $("#chat_history").append(talkComponent);

    //设置滚动条到最底部
    $("#chat_history").slimScroll({scrollTo: '9999999999px'});

    //设置task 元素颜色
    var talk = document.getElementById('toolbox');
    var text = document.getElementById('input_area');
    talk.style.background = "#fff";
    text.style.background = "#fff";
}

function getReceiver() {
    receiver = getUrlParam("receiver")
    $("#friend_nickName").text("您正在与" + receiver + "交流");
}

function sendMessage() {
    //发送消息到服务端
    stompClient.send("/app/chat", {}, JSON.stringify({
        'message': $("#input_area").val(),
        'type': '1',
        'receiver': receiver,
        'sender': username
    }));
    showMessage($("#input_area").val(), true);
    $("#input_area").val("");
}

function setScroll() {
    $("#chat_history").slimScroll({
        height: "473px",
        wheelStep: 10,
        alwaysVisible: true,
    });
}

function stopDefaultKey(e) {
    if (e && e.preventDefault) {
        e.preventDefault();
    } else {
        window.event.returnValue = false;
    }
    return false;
}


function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg); //匹配目标参数
    if (r != null) {
        return decodeURIComponent(r[2]);
    }
    return null;//返回参数值
}

function makeCall() {
    layer.open({
        title: "视频通话",
        type: 2,
        content: 'http://localhost:8080/webrtc?roomId=1212121',
        area: ['600px', '300px'],
        maxmin: true
    });
}
function sendImg() {
    var imageUrl = 'http://ys.file.haiyizhilian.com/2018-11-14/39debe84b6eedf0886e52e5b27b26bfbb1159a646e2466e883f24876186c629a.jpg';
    stompClient.send("/app/chat", {}, JSON.stringify({
        'message': imageUrl,
        'type': '2',
        'receiver': receiver,
        'sender': username
    }));
    showImg(imageUrl,true);
}

function videoCall() {
    stompClient.send("/app/chat", {}, JSON.stringify({
        'message': $("#input_area").val(),
        'type': '0',
        'receiver': receiver,
        'sender': username
    }));
    makeCall();
}
function replace_em(str) {
    str = str.replace(/\</g, '<');
    str = str.replace(/\>/g, '>');
    str = str.replace(/\n/g, '<br/>');
    str = str.replace(/\[em_([0-9]*)\]/g, '<img src="arclist/$1.gif" border="0" />');
    return str;

}

//页面初始化时加载
$(function () {
    connect();
    setScroll();
    getReceiver();
    //回车发送
    $(document).keydown(function (event) {
        if (event.keyCode == 13) {
            var e = e || event;
            sendMessage();
            stopDefaultKey(e)
        }
    });
    $('#emoji').qqFace({
        assign:'input_area', //给输入框赋值
        path:'/static/arclist/'    //表情图片存放的路径
    });
    $('#file').click(function(){
        sendImg();
    });
});
