
// CODE

declare namespace TAspid {
    class RPC {
        constructor(debug:boolean);

        //? SHARED
        /** Метод создающий локальное прослушивание событий */
        public on(eventName:string, handler:(...args:any[]) => void):void;
        /** Метод создающий локальное прослушивание процедурных событий */
        // public onProc(eventName:string, handler:(...args:any[]) => void):void;

        /** Метод удаляющий существующее локальное прослушивание */
        public off(eventName:string):void;
        /** Метод удаляющий существующие локальные просложивания процедурных событий */
        // public offProc(eventName:string):void;

        /** Метод вызова существующих событий */
        public emit(eventName:string, ...args:any[]):void;
        /** Метод вызова существующих процедурных событий */
        public emitProc(eventName:string, ...args:any[]):Promise<any>;

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

        //? SERVER
        /** Метод создающий прослушивателя достуного только для сервера */
        // public onServer(eventName:string, handler:(...args:any[]) => void):void;
        /** Метод создающий прослушивателя процедурных событий доступного только для сервера */
        public onServerProc(eventName:string, handler:(...args:any[]) => void):void;

        /** Метод удаления существующих прослушивателей доступных только для сервера */
        // public offServer(eventName:string):void;
        /** Метод удаления существующих прослушивателей процедурных событий доступных только для сервера */
        // public offServerProc(eventName:string):void;

        /** Метод вызовал существующих прослушивателей доступных только для сервера */
        // public emitServer(eventName:string, ...args:any[]):void;
        /** Метод вызова существующих процедурных событий доступных только для сервера */
        public emitServerProc(eventName:string, ...args:any[]):Promise<any>;
    }
}