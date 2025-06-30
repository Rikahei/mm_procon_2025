import GUI from 'lil-gui';
import { player } from './textalive-player';
import { loadMiku } from './theMiku';

export { gui };

const gui = new GUI();
const playerVolume: number = parseInt(localStorage.getItem("playerVolume") ?? "80");
const guiParams = { 
    "Miku's Pixel Art Level": 'Animation',
    Volume: playerVolume,
    'Full Screen': () => { document.querySelector( '#mainCanvas' )?.requestFullscreen() }
};
const appFolder = gui.addFolder( 'App Controls' );
appFolder.add( guiParams, "Miku's Pixel Art Level", ['Animation', 'x1', 'x3', 'x10' ] ).onChange( 
    (val) => {
        switch(val) {
            case 'x10':
                loadMiku(3, 3);
                break;
            case 'x3':
                loadMiku(2, 2);
                break;
            case 'x1':
                loadMiku(1, 1);
                break;
            default:
                // unlock gui lock to gif
                loadMiku(0, -1);
        }
    }
);
// Set default player volume
player.volume = playerVolume;
appFolder.add( guiParams, 'Volume', 0, 100, 1 ).onChange( function ( value ) {
    player.volume = value;
    localStorage.setItem("playerVolume", value);
} );
const visualFolder = gui.addFolder( 'Visual' );
visualFolder.add( guiParams, 'Full Screen' );

// Add setlist
const setListFolder = gui.addFolder( 'TextAlive Setlist' );
const setList = {
    'ロンリーラン - 海風太陽': () => changeMedia(songs.song0),
    'ハロー、フェルミ - ど～ぱみん': () => changeMedia(songs.song1),
    'インフォーマルダイブ - r99piano': () => changeMedia(songs.song2),
    'アリフレーション - 雨良 Amala': () => changeMedia(songs.song3)
};
setListFolder.add(setList, 'アリフレーション - 雨良 Amala');
setListFolder.add(setList, 'インフォーマルダイブ - r99piano');
setListFolder.add(setList, 'ハロー、フェルミ - ど～ぱみん');
setListFolder.add(setList, 'ロンリーラン - 海風太陽');
gui.title( 'TextAlive Controls' );
gui.close();

function changeMedia(songObj) {
    player.createFromSongUrl(songObj.url);
    loadMiku(0);
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
            lyricDiffId: 22065
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
            lyricDiffId: 22525
        }
    }
}