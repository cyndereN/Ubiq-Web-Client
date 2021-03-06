;((doc, storage, location) => {
    const server = SERVER;
    const port = PORT;
    const ws = new WebSocket('ws:'+server+':'+port);

    const oMuteBtn = doc.querySelector('#mute');
    const oRoomname = doc.querySelector('#roomname');
    const oMap = doc.querySelector('.map');
    const oList = doc.querySelector('#clients');

    let joincode;
    let uuid;
    let roomname;
    let networkId;

    let players; // Store avatars 

    let sendPingTimer;

    const init = () => {
        getLocalStorage();
        bindMuteBtnEvent();
        ws.addEventListener('open', handleOpen, false);
        ws.addEventListener('close', handleClose, false);
        ws.addEventListener('error', handleError, false);
        ws.addEventListener('message', handleMessage, false);
    }

    function getLocalStorage() {
        joincode = storage.getItem('joincode');
        uuid = storage.getItem('uuid');
        roomname = storage.getItem('roomname');
        networkId = new NetworkId.Unique();
        players = [];
        console.log(joincode);
        console.log(uuid);
        console.log(roomname);
        console.log(networkId);
        setH1Tag(roomname);
    }

    function setH1Tag(roomname) {
        oRoomname.innerHTML = roomname;
    }

    function bindMuteBtnEvent() {
        oMuteBtn.addEventListener('click', handleMuteBtnClick, false);
    }

    function handleMuteBtnClick() {
        console.log(this.innerHTML);
        if (oMuteBtn.innerHTML=="Mute"){
            doc.muted = true;
            oMuteBtn.innerHTML="Unmute";
        } else if (oMuteBtn.innerHTML=="Unmute") {
            doc.muted = false;
            oMuteBtn.innerHTML="Mute";
        }
    }

    function handleOpen(e){
        console.log('Websocket opened.',e);
        sendUpdatePeerMessage();
        sendPingMessage();
        sendJoinMessage();
    }

    function handleClose(e){
        clearInterval(sendPingTimer);
        console.log('Websocket closed.',e);
    }

    function handleError(e){
        clearInterval(sendPingTimer);
        console.log('Websocket error.',e);
    }

    function handleMessage(e){
        //console.log('Websocket message.');
        var reader = new FileReader();
        reader.addEventListener("loadend", function() {
            var msg = Message.Wrap(reader.result);
            if (NetworkId.Compare(msg.objectId, networkId) && msg.componentId == 1){
                var message = JSON.parse(Message.toString(reader.result));
                console.log(message);

                switch(message.type){
                    case "Rejected":
                        let reason = JSON.parse(message.args).reason;
                        alert(reason);
                        location.href = 'index.html';
                        break;

                    case "SetRoom":
                        var peers = JSON.parse(message.args).peers;
                        console.log(peers);
                        for (let i=0 ; i<peers.length ; i++) { //The players taht are already in room
                            var playerUuid = peers[i].uuid;
                            
                            if (playerUuid != uuid) {
                                var playerobjectId = new NetworkId(peers[i].properties.values[0]);
                                var newPlayer = new Player(0, 0, playerobjectId, playerUuid, getRandomColor());
                                players.push(newPlayer);
                                newPlayer.draw(oMap);
                                newPlayer.addToList(oList);
                            } 
                        }
                        break;


                    case "UpdatePeer":
                        var playerUuid = JSON.parse(message.args).uuid;
                        
                        if (playerUuid != uuid){
                            var playerobjectId = new NetworkId(JSON.parse(message.args).properties.values[0]);
                            var newPlayer = new Player(0, 0, playerobjectId, playerUuid, getRandomColor());
                            players.push(newPlayer);
                            newPlayer.draw(oMap);
                            newPlayer.addToList(oList);
                        }
                        break;

                    case "RemovedPeer":
                        var playerUuid = JSON.parse(message.args).uuid;
                        Player.deletePlayer(players, playerUuid);
                        break;

                    default:
                        break;
                }

            } else {
                if(msg.componentId == 4559){ // it is an avatar
                    var buffer = msg.message;
                    var view = new DataView(buffer);
                    var x = view.getFloat32(21, true);
                    var z = view.getFloat32(8, true);
                    Player.updatePlayer(players, msg.objectId,x,z);
                }
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
        }, 1000);
        
    }

    function sendJoinMessage(){
        ws.send(            
            Message.Create(
                new NetworkId(1),
                1,
                {
                    type: "Join",
                    args: JSON.stringify({
                        joincode: joincode,
                        name: '',
                        publish: false,
                        peer: {
                            uuid: uuid,
                            networkId: networkId,
                            properties: {}
                        }
                    })
                }
        ));
    }

    function getRandomColor(){
        this.r = Math.floor(Math.random()*255);
        this.g = Math.floor(Math.random()*255);
        this.b = Math.floor(Math.random()*255);
        this.color = 'rgba('+ this.r +','+ this.g +','+ this.b +',0.8)';
        return this.color;
     }

    function drawMap(){
        players.forEach(function(p){
            p.draw(oMap);
            p.addToList(oList);
        });
    }

    

    init();

    
})(document, localStorage, location);