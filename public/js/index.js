;((doc, storage, location) => {
    const server = SERVER;
    const port = PORT;
    const ws = new WebSocket('ws:'+server+':'+port);

    const oList = doc.querySelector('#list');
    const oJoincode = doc.querySelector('#joincode');
    const oJoinBtn = doc.querySelector('#join'); 

    let joincode;
    let uuid;
    let roomname;
    let networkId;
    let rooms;

    let sendPingTimer;
    let sendGetRoomsTimer;

    const init = () => {
        initValues();
        bindJoinBtnEvent();
        ws.addEventListener('open', handleOpen, false);
        ws.addEventListener('close', handleClose, false);
        ws.addEventListener('error', handleError, false);
        ws.addEventListener('message', handleMessage, false);
    }

    function initValues() {
        uuid = Uuid();
        storage.setItem(`uuid`, uuid);
        console.log(uuid);

        networkId = new NetworkId.Unique();
        console.log(networkId);

    }

    function bindJoinBtnEvent() {
        oJoinBtn.addEventListener('click', handleJoinBtnClick, false);
    }

    function handleJoinBtnClick() {
        joincode = oJoincode.value.trim().toLowerCase();
        roomname = "Roomname";
        
        if (joincode.length != 3) {
            alert(`Please enter a 3-digit code!`);
            return;
        }

        storage.setItem(`joincode`, joincode);
        storage.setItem(`roomname`, roomname);
        location.href = `room.html`;
    }

    function handleOpen(e){
        console.log('Websocket opened.',e);
        sendUpdatePeerMessage()
        sendPingMessage();
        sendGetRoomsMessage();
    }

    function handleClose(e){
        clearInterval(sendPingTimer);
        clearInterval(sendGetRoomsTimer);
        console.log('Websocket closed.',e);
    }

    function handleError(e){
        clearInterval(sendPingTimer);
        clearInterval(sendGetRoomsTimer);
        console.log('Websocket error.',e);
    }

    function handleMessage(e){
        console.log('Websocket message.');
        var reader = new FileReader();
        reader.addEventListener("loadend", function() {
            var message = JSON.parse(Message.toString(reader.result));
            console.log(message);

            switch(message.type){
                case "Rooms":
                    rooms = JSON.parse(message.args).rooms;
                    updateRooms();
                    break;
                default:
                    break;
            }
        });
        reader.readAsArrayBuffer(e.data);
    }

    function sendUpdatePeerMessage(){
        ws.send(            
            Message.Create(
                new NetworkId(1),
                1,
                {
                    type: "UpdatePeer",
                    args: JSON.stringify({
                        uuid: uuid,
                        networkId: networkId,
                        properties: {}
                    })
                }
        ));
    }

    function sendPingMessage() {
        sendPingTimer = setInterval(function(){ 
            ws.send(            
                Message.Create(
                    new NetworkId(1),
                    1,
                    {
                        type: "Ping",
                        args: JSON.stringify({
                            id: networkId
                        })
                    }
            ));
        }, 300);
    }

    function sendGetRoomsMessage() {
        sendGetRoomsTimer = setInterval(function(){ 
            ws.send(            
                Message.Create(
                    new NetworkId(1),
                    1,
                    {
                        type: "RequestRooms",
                        args: JSON.stringify({})
                    }
            ));
        }, 300);
    }

    function updateRooms(){
        oList.innerHTML = '';
        for(var i = 0; i < rooms.length; i++) {
            //console.log(rooms[i])
            updateTag(rooms[i]);
        }
        
    }

    function updateTag(room){
        let roomname = room.name;
        let joincode = room.joincode;
        let scene = room.properties.values[0];
        createTag(roomname, joincode, scene);
    }

    function createTag(roomname, joincode, scene){
        var li = doc.createElement('li');
        li.className = "list-group-item";
        li.innerHTML = `
            <span class="pull-left">${joincode}</span>
            <text> : </text>
            <span>${roomname}</span>
            <span class="pull-right">${scene}</span>
        `
        li.onclick = function(){
            const joincode = this.children[0].innerHTML+"";
            const roomname = this.children[2].innerHTML+"";
            storage.setItem(`roomname`, roomname);
            storage.setItem(`joincode`, joincode);
            location.href = `room.html`;
        }

        oList.appendChild(li);

    }

    init();
    
})(document, localStorage, location);

