;((doc) => {
    
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
    
    
    
    Player.prototype.isNewPlayer = function (playerUuid){
        var flag = 1;
        for (const p of players) {
            if (playerUuid == p.uuid) {
                flag = 0;
            } 
        }
        return flag;
    }
    
    Player.deletePlayer = function (players, playerUuid){
        for (let i=0 ; i<players.length ; i++) {
            if (playerUuid == players[i].uuid) {
                players[i].removeElements();
                players.splice(i,1);
                return;
            } 
        }
    }
    
    Player.updatePlayer = function(players, playerUuid, x, y){
        for (let i=0 ; i<players.length ; i++) {
            if (playerUuid == players[i].uuid) {
                players[i].update(x, y);
                return;
            } 
        }
    }

    window.Player = Player;
})(document);