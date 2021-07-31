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
        console.log('Websocket message.');
        var reader = new FileReader();
        reader.addEventListener("loadend", function() {
            var msg = Message.Wrap(reader.result);
            if (JSON.stringify(msg.objectId) === JSON.stringify(networkId) && msg.componentId == 1){
                var message = JSON.parse(Message.toString(reader.result));
                console.log(message);

                switch(message.type){
                    case "Rejected":
                        let reason = JSON.parse(message.args).reason;
                        alert(reason);
                        location.href = 'index.html';
                        break;
                    default:
                        break;
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

    // ----------------------------------------------- test---------------------


    // function sleep(ms) {
    //     return new Promise(resolve => setTimeout(resolve, ms));
    // }

    // async function demo() {
    //     // console.log(players)
    //     // console.log(players[0])
    //     // console.log(players[1])
    //     // console.log(players[2])
    //     // console.log(isNewPlayer('3333-3333'));
    //     // console.log(isNewPlayer('1333-3333'));
    //     drawMap();
    //     console.log('Taking a break...');
    //     await sleep(2000);
    //     console.log('Two second later');
        
    //     Player.updatePlayer(players,"5555-5555",5,-5.5);
    //     // console.log(players)
    //     // console.log(players[0])
    //     // console.log(players[1])
        
    //     console.log('Taking a break...');
    //     await sleep(2000);
    //     console.log('Two second later');
    //     Player.updatePlayer(players,"3333-3333",1,-1.5);
    //     Player.updatePlayer(players,"5555-5555",5,-5);
    //     // console.log(players[0])
    //     console.log('Taking a break...');
    //     await sleep(2000);
    //     console.log('Two second later');
    //     Player.updatePlayer(players,"3333-3333",1,-2);
    //     Player.deletePlayer(players,"5555-5555");
    // }


    
    // var players = [];
    // var newPlayer = new Player(0,0,"1111-1111",getRandomColor())
    // players.push(newPlayer)
    // var newPlayer = new Player(1,1,"2222-2222",getRandomColor())
    // players.push(newPlayer)
    // var newPlayer = new Player(1,-1,"3333-3333",getRandomColor())
    // players.push(newPlayer)
    // var newPlayer = new Player(-5,5,"4444-4444",getRandomColor())
    // players.push(newPlayer)
    // var newPlayer = new Player(5,-5,"5555-5555",getRandomColor())
    // players.push(newPlayer)
    // demo();
    




    
})(document, localStorage, location);