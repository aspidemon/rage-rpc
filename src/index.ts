
// IMPORTS

import * as util from './utils';

// CODE

class RPC {
    private _listeners = new Map();
    private _pendings = new Map();

    private _callServer:(eventName:string, ...args:any[]) => void;

    constructor() {
        switch(util.getEnvriroment()) {
            case 'client': {
                this._callServer = mp.events.callRemote;
                mp.events.callRemote = (...args:any[]) => {
                    mp.game.graphics.notify('~r~Произошла ошибка: Загляните в консоль\n(Нажмите F11)');
                    return mp.console.logError('[RPC PROTECTION] К вашему сожалению разработчики этого сервера поступили умно использовав систему процедурных вызовов ивентов и теперь в ней не доступна возможность использовать читы типа executor');
                }

                mp.events.add(util.getHash('rpc.client:events:emit'), (eventName:string, ...args:any[]) => {
                    this._listeners.get(eventName)(...args);
                });

                mp.events.add(util.getHash('rpc.cef:to:server:events:emit'), (eventName:string, ...args:any[]) => {
                    this._callServer(util.getHash('rpc.server:events:emit'), eventName, ...args);
                });

                mp.events.add(util.getHash('rpc.client:to:cef:events:emit'), (browser:BrowserMp, eventName:string, ...args:any[]) => {
                    browser.execute(`rpc.emit('${eventName}', ${JSON.stringify(args)})`);
                });

                //? Ивент вызывающий события которые существуют локально на клиенте
                mp.events.add(util.getHash(`rpc.client:events:emitProc`), (eventName:string, ...args:any[]) => {
                    let _result = this._listeners.get(eventName)(...args);
                    this._callServer(util.getHash('rpc.server:pendings:emit'), eventName, _result);
                });

                //? Ивент выполняющий реализацию моста для получения данных между одной частью и клиентом
                mp.events.add(util.getHash('rpc.client:pendings:emit'), (eventName:string, result:any) => {
                    this._pendings.get(eventName).resolve(result);
                });
            }
            
            case 'server': {
                mp.events.add(util.getHash('rpc.server:events:emit'), (player:PlayerMp, eventName:string, ...args:any[]) => {
                    this._listeners.get(eventName)(player, ...args);
                });

                //? Ивент вызывающий события которые существуют локально на сервере
                mp.events.add(util.getHash('rpc.server:events:emitProc'), (player:PlayerMp, eventName:string, ...args:any[]) => {
                    let _result = this._listeners.get(eventName)(player, ...args);
                    player.call(util.getHash('rpc.client:pendings:emit'), [eventName, _result]);
                });

                //? Ивент выполняющий реализацию моста для получения данных между одной частью и сервером
                mp.events.add(util.getHash('rpc.server:pendings:emit'), (player:PlayerMp, eventName:string, result:any) => {
                    this._pendings.get(eventName).resolve(result);
                });
            }
        }
    }

    private _has(eventName:string):boolean {
        return this._listeners.has(eventName);
    }

    private _on(eventName:string, handler:(...args:any[]) => void) {
        if(!this._has(eventName)) this._listeners.set(eventName, handler);
    }

    private async _emitProc(eventName:string, ...args:any[]):Promise<any> {
        return new Promise(resolve => {
            let _result = this._listeners.get(eventName)(...args);
            resolve(_result);
        });
    }

    private _off(eventName:string) {
        if(this._has(eventName)) this._listeners.delete(eventName);
    }

    private _emit(eventName:string, ...args:any[]) {
        if(this._has(eventName)) this._listeners.get(eventName)(...args);
    }

    //? SHARED
    public on(eventName:string, handler:(...args:any[]) => void) {
        this._on(eventName, handler);
    }

    public off(eventName:string) {
        this._off(eventName);
    }

    public emit(eventName:string, ...args:any[]) {
        this._emit(eventName, ...args);
    }

    public async emitProc(eventName:string, ...args:any[]):Promise<any> {
        return await this._emitProc(eventName, ...args);
    }
    
    //? CLIENT
    // public onServer(eventName:string, handler:(...args:any[]) => void) {
    //     this._on(eventName, handler);
    // }

    public onServerProc(eventName:string, handler:(...args:any[]) => void) {
        this._on(eventName, handler);
    }

    public emitServer(eventName:string, ...args:any[]) {
        this._callServer(util.getHash('rpc.server:events:emit'), eventName, ...args);
    }

    // ...and working cef
    public async emitServerProc(eventName:string, ...args:any[]):Promise<any> {
        return new Promise((res) => {
            this._pendings.set(eventName, { resolve: res });
            this._callServer(util.getHash('rpc.server:events:emitProc'), eventName, ...args);
        });
    }

    //? SERVER
    public emitClient(player:PlayerMp, eventName:string, ...args:any[]) {
        player.call(util.getHash('rpc.client:events:emit'), [eventName, ...args]);
    }

    public emitAllClients(eventName:string, ...args:any[]) {
        mp.players.call(util.getHash('rpc.client:events:emit'), [eventName, ...args]);
    }

    // public onClient(eventName:string, handler:(player:PlayerMp, ...args:any[]) => void) {
    //     this._on(eventName, handler);
    // }

    public onClientProc(eventName:string, handler:(player:PlayerMp, ...args:any[]) => void) {
        this._on(eventName, handler);
    }

    // ...and working cef
    public async emitClientProc(player:PlayerMp, eventName:string, ...args:any[]):Promise<any> {
        return new Promise((res) => {
            this._pendings.set(eventName, { resolve: res });
            player.call(util.getHash('rpc.client:events:emitProc'), [eventName, ...args]);
        });
    }
}

const rpc = new RPC() as TAspid.RPC;
export default rpc;