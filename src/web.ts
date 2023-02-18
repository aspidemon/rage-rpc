
// IMPORTS

// CODE

function getHash(str:string) {
    let hash: number = 0;

    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash += (char << 5) - char;
    }

    return String(`0x${hash & 0x7fffffff}`);
}

declare global {
    interface Window {
        emit:(eventName:string, ...args:any[]) => void;
        on:(eventName:string, handler:Function) => void;
        off:(eventName:string) => void;
    }
}

class RPC {
    private _listeners = new Map();
    private _pendings = new Map();

    constructor() {
        const mp = window.mp;
        window.on(getHash('rpc.cef:events:emit'), (eventName:string, ...args:any[]) => {
            let _event = this._listeners.get(eventName);
            if(_event !== undefined) _event(...args);
            else console.log(`[RPC] Название ивента не было найдено (EventName: ${eventName})`);
        });

        //? Ивент вызывающий события которые существуют локально на веб-части
        window.on(getHash('rpc.cef:events:emitProc'), (eventName:string, ...args:any[]) => {
            let _event = this._listeners.get(eventName)
            if(_event === undefined) return console.log(`[RPC] Название ивента не было найдено (EventName: ${eventName})`);

            let _result = _event(...args);
            mp.trigger(getHash('rpc.client:pendings:emit'), eventName, _result);
        });

        //? Ивент выполняющий реализацию моста для получения данных между одной частью и вебом
        window.on(getHash('rpc.cef:pendings:emit'), (eventName:string, result:any) => {
            let _event = this._pendings.get(eventName);
            if(_event !== undefined) {
                _event.resolve(result);
            } else console.log(`[RPC] Название ивента не было найдено (EventName: ${eventName})`);
        });
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

    // public emitServer(eventName:string, ...args:any[]) {
    //     this._callServer(getHash('rpc.server:events:emit'), eventName, ...args);
    // }

    // // ...and working cef
    // public async emitServerProc(eventName:string, ...args:any[]):Promise<any> {
    //     return new Promise((res) => {
    //         this._pendings.set(eventName, { resolve: res });
    //         this._callServer(util.getHash('rpc.server:events:emitProc'), eventName, ...args);
    //     });
    // }

    //? CEF
    public emitClient(eventName:string, ...args:any[]) {
        window.mp.trigger(getHash('rpc.client:events:emit'), eventName, ...args);
    }

    public emitServer(eventName:string, ...args:any[]) {
        window.mp.trigger(getHash('rpc.cef:to:server:events:emit'), eventName, ...args);
    }

    // public emitAllClients(eventName:string, ...args:any[]) {
    //     mp.players.call(getHash('rpc.client:events:emit'), [eventName, ...args]);
    // }

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
            window.mp.trigger(getHash('rpc.client:events:emitProc'), [eventName, ...args]);
        });
    }
}

const rpc = new RPC() as TAspid.RPC;
export default rpc;