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
    'ロンリーラン': () => changeMedia(songs.song0),
    'ハロー、フェルミ': () => changeMedia(songs.song1),
    'インフォーマルダイブ': () => changeMedia(songs.song2),
    'アリフレーション': () => changeMedia(songs.song3)
};
folder.add(setList, 'ロンリーラン');
folder.add(setList, 'ハロー、フェルミ');
folder.add(setList, 'インフォーマルダイブ');
folder.add(setList, 'アリフレーション');
gui.title( 'TextAlive controls' );
gui.close();

function changeMedia(songObj) {
    player.createFromSongUrl(songObj.url);
}

const songs = {
    // ロンリーラン
    song0 : {
        url: "https://piapro.jp/t/CyPO/20250128183915",
        video: {
            beatId: 4694280,
            chordId: 2830735,
            repetitiveSegmentId: 2946483,
            lyricId: 67815,
            lyricDiffId: 20659
        }
    },
    // ハロー、フェルミ
    song1 : {
        url: "https://piapro.jp/t/oTaJ/20250204234235", 
        video: {
            lyricId: 67813,
            lyricDiffId: 22504
        }
    },
    // インフォーマルダイブ
    song2: {
        url: 'https://piapro.jp/t/Ppc9/20241224135843',
        video: {
            lyricId: 67812,
            lyricDiffId: 22133
        }
    },
    // アリフレーション
    song3: {
        url: 'https://piapro.jp/t/SuQO/20250127235813',
        video: {
            lyricId: 67811,
            lyricDiffId: 22500
        }
    }
}