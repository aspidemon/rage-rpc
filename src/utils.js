export function getHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash += (char << 5) - char;
    }
    return String(`0x${hash & 0x7fffffff}`);
}
export function getEnvriroment() {
    if (mp && typeof mp.joaat == 'function')
        return 'server';
    if (mp && typeof mp.game.joaat == 'function')
        return 'client';
    if (typeof window.mp.trigger == 'function')
        return 'cef';
}
