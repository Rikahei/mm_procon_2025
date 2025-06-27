import GUI from 'lil-gui';
import { player } from './textalive-player';

export { gui };

const gui = new GUI();
const playerVolume: number = parseInt(localStorage.getItem("playerVolume") ?? "80");
const guiParams = { 
    Volume: playerVolume,
    FullScreen: () => { document.querySelector( '#mainCanvas' )?.requestFullscreen() }
};
gui.add( guiParams, 'FullScreen' );
// Set default player volume
player.volume = playerVolume;
gui.add( guiParams, 'Volume', 0, 100, 1 ).onChange( function ( value ) {
    player.volume = value;
    localStorage.setItem("playerVolume", value);
} );
// Add setlist
const folder = gui.addFolder( 'SetList' );
const setList = {
    ロンリーラン: () => changeMedia(''),
    パレードレコード: () => changeMedia('https://piapro.jp/t/GCgy/20250202202635'),
    インフォーマルダイブ: () => changeMedia('https://piapro.jp/t/Ppc9/20241224135843')
};
folder.add(setList, 'ロンリーラン');
folder.add(setList, 'パレードレコード');
folder.add(setList, 'インフォーマルダイブ');
gui.title( 'TextAlive controls' );
gui.close();

function changeMedia(url) {
    let urlParams = new URLSearchParams(window.location.search);
    urlParams.set('ta_song_url', url);
    window.location.search = urlParams.toString();
}