function getHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash += (char << 5) - char;
    }
    return String(`0x${hash & 0x7fffffff}`);
}
class RPC {
    _listeners = new Map();
    _pendings = new Map();
    constructor() {
        window.on = (eventName, handler) => {
            this._on(eventName, handler);
        };
        window.emit = (eventName, ...args) => {
            this._emit(eventName, ...args);
        };
        window.off = (eventName) => {
            this._off(eventName);
        };
        const mp = window.mp;
        window.on(getHash('rpc.cef:events:emit'), (eventName, ...args) => {
            let _event = this._listeners.get(eventName);
            if (_event !== undefined)
                _event(...args);
            else
                console.log(`[RPC] Название ивента не было найдено (EventName: ${eventName})`);
        });
        window.on(getHash('rpc.cef:events:emitProc'), (eventName, ...args) => {
            let _event = this._listeners.get(eventName);
            if (_event === undefined)
                return console.log(`[RPC] Название ивента не было найдено (EventName: ${eventName})`);
            let _result = _event(...args);
            mp.trigger(getHash('rpc.client:pendings:emit'), eventName, _result);
        });
        window.on(getHash('rpc.cef:pendings:emit'), (eventName, result) => {
            let _event = this._pendings.get(eventName);
            if (_event !== undefined) {
                _event.resolve(result);
            }
            else
                console.log(`[RPC] Название ивента не было найдено (EventName: ${eventName})`);
        });
    }
    _has(eventName) {
        return this._listeners.has(eventName);
    }
    _on(eventName, handler) {
        if (!this._has(eventName))
            this._listeners.set(eventName, handler);
    }
    async _emitProc(eventName, ...args) {
        return new Promise(resolve => {
            let _result = this._listeners.get(eventName)(...args);
            resolve(_result);
        });
    }
    _off(eventName) {
        if (this._has(eventName))
            this._listeners.delete(eventName);
    }
    _emit(eventName, ...args) {
        if (this._has(eventName))
            this._listeners.get(eventName)(...args);
    }
    on(eventName, handler) {
        this._on(eventName, handler);
    }
    off(eventName) {
        this._off(eventName);
    }
    emit(eventName, ...args) {
        this._emit(eventName, ...args);
    }
    async emitProc(eventName, ...args) {
        return await this._emitProc(eventName, ...args);
    }
    onServerProc(eventName, handler) {
        this._on(eventName, handler);
    }
    emitClient(eventName, ...args) {
        window.mp.trigger(getHash('rpc.client:events:emit'), eventName, ...args);
    }
    emitServer(eventName, ...args) {
        window.mp.trigger(getHash('rpc.cef:to:server:events:emit'), eventName, ...args);
    }
    onClientProc(eventName, handler) {
        this._on(eventName, handler);
    }
    async emitClientProc(player, eventName, ...args) {
        return new Promise((res) => {
            this._pendings.set(eventName, { resolve: res });
            window.mp.trigger(getHash('rpc.client:events:emitProc'), [eventName, ...args]);
        });
    }
}
const rpc = new RPC();
export default rpc;
