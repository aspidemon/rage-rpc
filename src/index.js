const utils = require('./utils');
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
                    let _event = this._listeners.get(eventName);
                    if (_event !== undefined)
                        _event(...args);
                    else
                        mp.console.logError(`[RPC] Название ивента не было найдено (EventName: ${eventName})`);
                });
                mp.events.add(util.getHash('rpc.cef:to:server:events:emit'), (eventName, ...args) => {
                    this._callServer(util.getHash('rpc.server:events:emit'), eventName, ...args);
                });
                mp.events.add(util.getHash('rpc.client:to:cef:events:emit'), (browserID, eventName, ...args) => {
                    let _browser = mp.browsers.at(browserID);
                    if (_browser !== undefined)
                        _browser.execute(`rpc.emit('${eventName}', ${JSON.stringify(args)})`);
                    else
                        mp.console.logError(`[RPC] Браузер не был найден, возможно его не существует (ID: ${browserID}, EventName: ${eventName})`);
                });
                mp.events.add(util.getHash(`rpc.client:events:emitProc`), (eventName, ...args) => {
                    let _event = this._listeners.get(eventName);
                    if (_event !== undefined) {
                        let _result = _event(...args);
                        this._callServer(util.getHash('rpc.server:pendings:emit'), eventName, _result);
                    }
                    else
                        mp.console.logError(`[RPC] Название ивента не было найдено (EventName: ${eventName})`);
                });
                mp.events.add(util.getHash('rpc.client:pendings:emit'), (eventName, result) => {
                    let _event = this._pendings.get(eventName);
                    if (_event !== undefined)
                        _event.resolve(result);
                    else
                        mp.console.logFatal(`[RPC] Ивент не был найден, невозможно возвратить значение процедурного вызова (EventName: ${eventName})`);
                });
            }
            case 'server': {
                mp.events.add(util.getHash('rpc.server:events:emit'), (player, eventName, ...args) => {
                    let _event = this._listeners.get(eventName);
                    if (_event !== undefined)
                        _event(player, ...args);
                    else
                        console.log(`[RPC] Название ивента не было найдено (EventName: ${eventName})`);
                });
                mp.events.add(util.getHash('rpc.server:events:emitProc'), (player, eventName, ...args) => {
                    let _event = this._listeners.get(eventName);
                    if (_event !== undefined) {
                        let _result = _event(player, ...args);
                        player.call(util.getHash('rpc.client:pendings:emit'), [eventName, _result]);
                    }
                    else
                        console.log(`[RPC] Название ивента не было найдено (EventName: ${eventName})`);
                });
                mp.events.add(util.getHash('rpc.server:pendings:emit'), (player, eventName, result) => {
                    let _event = this._pendings.get(eventName);
                    if (_event !== undefined)
                        _event.resolve(result);
                    else
                        console.log(`[RPC] Название ивента не было найдено (EventName: ${eventName})`);
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
        player.call(util.getHash('rpc.client:events:emit'), [eventName, ...args]);
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
module.exports = rpc;
