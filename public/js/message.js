;(() => {

    Uint16Array.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
        offset = offset >>> 0
        if (!noAssert) checkOffset(offset, 2, this.length)
        return this[offset] | (this[offset + 1] << 8)
      }
      

    function NetworkId(data){
        if(typeof(data) == 'string'){
            data = data.replace("-","");
            a = data.substring(0, 8);
            b = data.substring(8, 16);
            this.a = parseInt(a, 16);
            this.b = parseInt(b, 16);
            return;
        } 
        if(typeof(data) == 'number'){
            this.a = 0;
            this.b = data;
            return;
        } 
        d = new Uint32Array(data,0,2)
        this.a = d[0];
        this.b = d[1];
        return;
    }

    NetworkId.Unique = function(){
        var d = new Date().getTime();//Timestamp
        var d2 = (performance && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
        var id = 'xxxxxxxx-xxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16;//random number between 0 and 16
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
            return r.toString(16);
        });
        return new NetworkId(id);
    }

    DataView.prototype.writeNetworkId = function(networkId, offset){
        NetworkId.WriteBuffer(networkId, this, offset);
    }

    ArrayBuffer.prototype.readNetworkId = function(offset){
        return new NetworkId(this.slice(offset));
    }

    function Message() {
    }

    Message.Wrap = function(buffer){
        let dataView = new DataView(buffer);
        var msg = new Message();
        msg.buffer = buffer;
        msg.length = dataView.getUint32(0,true);
        msg.objectId = buffer.readNetworkId(4);
        msg.componentId = dataView.getUint16(12,true);
        msg.message = buffer.slice(14);
        return msg;
    }

    function bufferToString(buf) {
        return String.fromCharCode.apply(null, new Uint8Array(buf));
        }


    function stringToBuffer(string) {
        let value = ""
        for (let i = 0; i < string.length; i++) {
        if (value === '') {
            value = string.charCodeAt(i).toString(16)
        } else {
            value += ',' + string.charCodeAt(i).toString(16)
        }
        }
        return new Uint8Array(value.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16)
        })).buffer
    }

    function mergeArrayBuffer(...arrays) {
        let totalLen = 0
        for (let i = 0; i < arrays.length; i++) {
            arrays[i] = new Uint8Array(arrays[i]) 
            totalLen += arrays[i].length
        }
    
        let res = new Uint8Array(totalLen)
    
        let offset = 0
        for(let arr of arrays) {
            res.set(arr, offset)
            offset += arr.length
        }
    
        return res.buffer
    }

    Message.toString = function (buffer) {
        return bufferToString(Message.Wrap(buffer).message)
    }


    Message.Create = function(objectId, componentId, message){

        if(typeof(message) == 'object'){
            message = JSON.stringify(message);
        }
        if(typeof(message) == 'string'){
            message = stringToBuffer(message);
        }

        var length = message.byteLength + MESSAGE_HEADER_SIZE;
        var buffer = new ArrayBuffer(14);

        let dataView = new DataView(buffer);
        dataView.setInt32(0, length, true);
        dataView.setUint32(4, objectId.a, true);
        dataView.setUint32(8, objectId.b, true);
        dataView.setUint16(12, componentId, true);
        
        buffer = mergeArrayBuffer(buffer, message);

        return buffer;
    }

    window.NetworkId = NetworkId;
    window.Message = Message;
})();