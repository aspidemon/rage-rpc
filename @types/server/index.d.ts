
// CODE

declare namespace TAspid {
    class RPC {
        constructor(debug:boolean);

        //? SHARED
        /** Метод создающий локальное прослушивание событий */
        public on(eventName:string, handler:(...args:any[]) => void):void;
        /** Метод создающий локальное прослушивание процедурных событий */
        public onProc(eventName:string, handler:(...args:any[]) => void):void;

        /** Метод удаляющий существующее локальное прослушивание */
        public off(eventName:string):void;
        /** Метод удаляющий существующие локальные просложивания процедурных событий */
        public offProc(eventName:string):void;

        /** Метод вызова существующих событий */
        public emit(eventName:string, ...args:any[]):void;
        /** Метод вызова существующих процедурных событий */
        public emitProc(eventName:string, ...args:any[]):Promise<any>;

        //? CEF
        /** Метод создающий прослушивателя доступного только для клиентской части */
        // public onClient(eventName:string, handler:(player:PlayerMp, ...args:any[]) => void):void;
        /** Метод создающий прослушивателя процедурного события доступного только для клиентской части */
        public onClientProc(eventName:string, handler:(player:PlayerMp, ...args:any[]) => void):void;

        /** Метод удаления существующих прослушивателей доступного для клиента */
        // public offClient(eventName:string):void;
        /** Метод удаления прослушивателей процедурного события доступного для клиента */
        // public offClientProc(eventName:string):void;

        /** Метод вызова существующих событий доступных только для клиента */
        public emitClient(player:PlayerMp, eventName:string, ...args:any[]):void;
        /** Метод вызова существующих процедурных событий доступных только для клиента */
        public emitClientProc(player:PlayerMp, eventName:string, ...args:any[]):Promise<any>;

        //? CLIENT
        /** Метод создающий прослушивателя доступного только для веб-части */
        // public onCef(eventName:string, handler:(...args:any[]) => void):void;
        /** Метод создающий процедурное событие доступное только для веб-части */
        // public onCefProc(eventName:string, handler:(...args:any[]) => void):void;

        /** Метод удаления существующих прослушивателей доступных только для веб-части */
        // public offCef(eventName:string):void;
        /** Метод удаления существующих прослушивателей процедурных событий доступных только для веб-части */
        // public offCefProc(eventName:string):void;

        /** Метод вызова существующих событий доступных только для веб-части */
        // public emitCef(eventName:string, ...args:any[]):void;
        /** Метод вызова существующих процедурных событий доступных только для веб-части */
        // public emitCefProc(eventName:string, ...args:any[]):Promise<any>;
    }
}