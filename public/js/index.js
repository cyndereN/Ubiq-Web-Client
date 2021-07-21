;((doc, storage, location) => {

    const server = SERVER;
    const port = PORT;
    const ws = new WebSocket('ws:'+server+':'+port);
    const oList = doc.querySelector('#list');
    const oJoincode = doc.querySelector('#joincode');
    const oJoinBtn = doc.querySelector('#join'); 

    const init = () => {
        initValues();
        bindJoinBtnEvent();
        ws.addEventListener('open', handleOpen, false);
        ws.addEventListener('close', handleClose, false);
        ws.addEventListener('error', handleError, false);
        ws.addEventListener('message', handleMessage, false);
    }

    function initValues() {
        const uuid = Uuid();
        console.log(uuid);
        storage.setItem(`uuid`, uuid);
        //const networkId = NetworkId.Unique();
    }

    function bindJoinBtnEvent() {
        oJoinBtn.addEventListener('click', handleJoinBtnClick, false);
    }

    function handleJoinBtnClick() {
        const joincode = oJoincode.value.trim();
        const roomname = getRoomName();
        
        if (joincode.length != 3) {
            alert(`Please enter a 3-digit code!`);
            return;
        }
        storage.setItem(`joincode`, joincode);
        storage.setItem(`roomname`, roomname);
        location.href = `room.html`;
    }

    function getRoomName(){
        return "Searched room name";
    }

    function handleOpen(e){
        console.log('Websocket opened.',e);
        //sendGetRoomsMessage();
        //sendPingMessage();
    }

    function handleClose(e){
        console.log('Websocket closed.',e);
    }

    function handleError(e){
        console.log('Websocket error.',e);
    }

    function handleMessage(e){
        console.log('Websocket message.');
        console.log(e);
        const msgData = JSON.parse(e.data);
        console.log(msgData)
    }

    function sendGetRoomsMessage() {
        console.log("Send getRooms request.");
        ws.send(            
            Message.Create(
                0,
                1,
                {
                    type: "Ping",
                    args: JSON.stringify({
                        uuid: this.uuid,
                        networkId: this.objectId,
                        properties: null
                    })
                }
        ));
    }

    init();

    // testing

    var itemli = doc.getElementsByTagName("li");

    for(var i = 0; i<itemli.length; i++){
    
        itemli[i].index = i; //给每个li定义一个属性索引值
    
        itemli[i].onclick = function(){
            const joincode = this.children[0].innerHTML+"";
            const roomname = this.children[2].innerHTML+"";
            storage.setItem(`roomname`, roomname);
            storage.setItem(`joincode`, joincode);
            location.href = `room.html`;

        }
    
    }

})(document, localStorage, location);

