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
        if(!roomname){
            location.href = 'entry.html';
            return;
        }
        console.log(joincode);
        console.log(uuid);
        console.log(roomname);
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
        //sendJoinMessage();
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

        //getRoomDetail();
        //drawMap();
    }

    init();

    // --------------------------------------------------- after getRoom detail --------------------------------
 

    function getRandomColor(){
        this.r = Math.floor(Math.random()*255);
        this.g = Math.floor(Math.random()*255);
        this.b = Math.floor(Math.random()*255);
        this.color = 'rgba('+ this.r +','+ this.g +','+ this.b +',0.8)';
        return this.color;
     }

    function Player(x, y, uuid, color) {
        this.x = x; 
        this.y = y; 
        this.uuid = uuid;
        this.color = color;
        this.elements = []; // store div on map
    }

    Player.prototype.draw = function(map){
        var div = doc.createElement('div');
        map.appendChild(div);
        div.id = "map-element:" + this.uuid;
        div.className = "center-in-center";
        div.style.width = "20px";
        div.style.height = "20px";
        div.style.backgroundColor = this.color;
        div.style.position = "absolute";
        div.style.left = 70*(this.x + 5) + "px";  // top-left is (0,0), map is 700 * 700
        div.style.top = 70*(5 - this.y) + "px";
        div.title = "(" + this.x + ", " + this.y + ")";
        this.elements.push(div);
        console.log(this.uuid+" draw");
    }

    Player.prototype.addToList = function(list){
        var li = doc.createElement('li');
        list.appendChild(li);
        li.id = "list-element:" + this.uuid;
        li.style.height = 30 + "px";
        var div = doc.createElement('div');
        li.appendChild(div);
        div.style.width = "20px";
        div.style.height = "20px";
        div.style.backgroundColor = this.color;
        div.style.position = "absolute";
        div.title = "(" + this.x + ", " + this.y + ")";
        var txt = doc.createElement('text');
        li.appendChild(txt);
        txt.innerHTML = this.uuid;
        txt.style.padding = 30+"px";
        this.elements.push(li);
        console.log(this.uuid+" add to list");
    }

    Player.prototype.removeElements = function() {
        for (var i = 0; i < this.elements.length; i++) {
            var ele = this.elements[i];
            ele.parentNode.removeChild(ele);
        }
        
        console.log(this.uuid+" remove");
    }

    Player.prototype.updateElements = function() {
        for (var i = 0; i < this.elements.length; i++) {
            var ele = this.elements[i];
            if (ele.getAttribute("id") == "map-element:" + this.uuid){
                if (this.x<=-5.5 || this.x>=5.5 || this.y<=-5.5 || this.y>=5.5) {
                    ele.style = "display: None;";
                } else {
                    ele.style.display = null;
                    ele.style.width = "20px";
                    ele.style.height = "20px";
                    ele.style.backgroundColor = this.color;
                    ele.style.position = "absolute";
                    ele.style.left = 70*(this.x + 5) + "px";  // top-left is (0,0), map is 700 * 700
                    ele.style.top = 70*(5 - this.y) + "px";
                    ele.title = "(" + this.x + ", " + this.y + ")";
                }
            }

            if (ele.getAttribute("id") == "list-element:" + this.uuid){
                ele.children[0].title = "(" + this.x + ", " + this.y + ")";
            }
        }
    }

    Player.prototype.update = function(x, y) {
        this.x = x;
        this.y = y;
        // Only changes the x, y position, not the position of divs.
        this.updateElements();
        console.log(this.uuid+" update");
    }

    

    function isNewPlayer(playerUuid){
        var flag = 1;
        for (const p of players) {
            if (playerUuid == p.uuid) {
                flag = 0;
            } 
        }
        return flag;
    }

    function deletePlayer(playerUuid){
        for (let i=0 ; i<players.length ; i++) {
            if (playerUuid == players[i].uuid) {
                players[i].removeElements();
                players.splice(i,1);
                return;
            } 
        }
    }

    function updatePlayer(playerUuid, x, y){
        for (let i=0 ; i<players.length ; i++) {
            if (playerUuid == players[i].uuid) {
                players[i].update(x, y);
                return;
            } 
        }
    }

    function drawMap(){
        players.forEach(function(p){
            p.draw(oMap);
            p.addToList(oList);
        });
    }


    // ----------------------------------------------- test---------------------


    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function demo() {
        // console.log(players)
        // console.log(players[0])
        // console.log(players[1])
        // console.log(players[2])
        // console.log(isNewPlayer('3333-3333'));
        // console.log(isNewPlayer('1333-3333'));
        drawMap();
        console.log('Taking a break...');
        await sleep(2000);
        console.log('Two second later');
        
        updatePlayer("5555-5555",5,-5.5);
        // console.log(players)
        // console.log(players[0])
        // console.log(players[1])
        
        console.log('Taking a break...');
        await sleep(2000);
        console.log('Two second later');
        updatePlayer("3333-3333",1,-1.5);
        updatePlayer("5555-5555",5,-5);
        // console.log(players[0])
        console.log('Taking a break...');
        await sleep(2000);
        console.log('Two second later');
        updatePlayer("3333-3333",1,-2);
        deletePlayer("5555-5555");
    }


    
    var players = [];
    var newPlayer = new Player(0,0,"1111-1111",getRandomColor())
    players.push(newPlayer)
    var newPlayer = new Player(1,1,"2222-2222",getRandomColor())
    players.push(newPlayer)
    var newPlayer = new Player(1,-1,"3333-3333",getRandomColor())
    players.push(newPlayer)
    var newPlayer = new Player(-5,5,"4444-4444",getRandomColor())
    players.push(newPlayer)
    var newPlayer = new Player(5,-5,"5555-5555",getRandomColor())
    players.push(newPlayer)
    demo();
    




    
})(document, localStorage, location);