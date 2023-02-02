import * as util from './utils';
class RPC {
    _listeners = new Map();
    _pendings = new Map();
    _callServer;
    constructor() {
        switch (util.getEnvriroment()) {
            case 'client': {
                this._callServer = mp.events.callRemote;
                mp.events.callRemote = (...args) => {
                    mp.game.graphics.notify('~r~Произошла ошибка: Загляните в консоль\n(Нажмите F11)');
                    return mp.console.logError('[RPC PROTECTION] К вашему сожалению разработчики этого сервера поступили умно использовав систему процедурных вызовов ивентов и теперь в ней не доступна возможность использовать читы типа executor');
                };
                mp.events.add(util.getHash('rpc.client:events:emit'), (eventName, ...args) => {
                    this._listeners.get(eventName)(...args);
                });
                mp.events.add(util.getHash(`rpc.client:events:emitProc`), (eventName, ...args) => {
                    let _result = this._listeners.get(eventName)(...args);
                    this._callServer(util.getHash('rpc.server:pendings:emit'), eventName, _result);
                });
                mp.events.add(util.getHash('rpc.client:pendings:emit'), (eventName, result) => {
                    this._pendings.get(eventName).resolve(result);
                });
            }
            case 'server': {
                mp.events.add(util.getHash('rpc.server:events:emit'), (player, eventName, ...args) => {
                    this._listeners.get(eventName)(player, ...args);
                });
                mp.events.add(util.getHash('rpc.server:events:emitProc'), (player, eventName, ...args) => {
                    let _result = this._listeners.get(eventName)(player, ...args);
                    player.call(util.getHash('rpc.client:pendings:emit'), [eventName, _result]);
                });
                mp.events.add(util.getHash('rpc.server:pendings:emit'), (player, eventName, result) => {
                    this._pendings.get(eventName).resolve(result);
                });
            }
            case 'cef': {
                const mp = window.mp;
                mp.events.add(util.getHash('rpc.cef:events:emit'), (eventName, ...args) => {
                    this._listeners.get(eventName)(...args);
                });
                mp.events.add(util.getHash('rpc.cef:events:emitProc'), (eventName, ...args) => {
                    let _result = this._listeners.get(eventName)(...args);
                    mp.trigger(util.getHash('rpc.client:pendings:emit'), eventName, _result);
                });
                mp.events.add(util.getHash('rpc.cef:pendings:emit'), (eventName, result) => {
                    this._pendings.get(eventName).resolve(result);
                });
            }
        }
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
    emitServer(eventName, ...args) {
        this._callServer(util.getHash('rpc.server:events:emit'), eventName, ...args);
    }
    async emitServerProc(eventName, ...args) {
        return new Promise((res) => {
            this._pendings.set(eventName, { resolve: res });
            this._callServer(util.getHash('rpc.server:events:emitProc'), eventName, ...args);
        });
    }
    emitClient(player, eventName, ...args) {
        if (util.getEnvriroment() == 'server')
            player.call(util.getHash('rpc.client:events:emit'), [eventName, ...args]);
        else
            window.mp.trigger(util.getHash('rpc.client:events:emit'), eventName, ...args);
    }
    emitAllClients(eventName, ...args) {
        mp.players.call(util.getHash('rpc.client:events:emit'), [eventName, ...args]);
    }
    onClientProc(eventName, handler) {
        this._on(eventName, handler);
    }
    async emitClientProc(player, eventName, ...args) {
        return new Promise((res) => {
            this._pendings.set(eventName, { resolve: res });
            player.call(util.getHash('rpc.client:events:emitProc'), [eventName, ...args]);
        });
    }
}
const rpc = new RPC();
export default rpc;
