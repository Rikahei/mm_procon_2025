import { Player } from "textalive-app-api";
import { Timer } from 'three/addons/misc/Timer.js';

// TextAlive Player を初期化
export {player, mikuTimer};

const mikuTimer = new Timer();
const player = new Player({
  // トークンは https://developer.textalive.jp/profile で取得したものを使う
  app: {
    token: import.meta.env.VITE_TEXTALIVE_TOKEN ?? "test",
  },

  mediaElement: document.querySelector("#media"),
  mediaBannerPosition: "bottom right",
});

const overlay = document.querySelector("#overlay");
const textContainer = document.querySelector("#text");
const seekbar = document.querySelector("#seekbar");
const paintedSeekbar = seekbar.querySelector("div");
let lastTime = -1;

player.addListener({
  onAppReady(app) {
    if (app.managed) {
      document.querySelector("#control").className = "disabled";
    }
    if (!app.songUrl) {
      document.querySelector("#media").className = "disabled";
      // ロンリーラン
      player.createFromSongUrl("https://piapro.jp/t/CyPO/20250128183915", {
        video: {
          // 音楽地図訂正履歴
          beatId: 4694280,
          chordId: 2830735,
          repetitiveSegmentId: 2946483,

          // 歌詞URL: https://piapro.jp/t/DPXV
          // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FULcJ%2F20250205120202
          lyricId: 67815,
          lyricDiffId: 20659
        },
      });
    }
  },

  onAppParameterUpdate: () => {},

  onAppMediaChange() {},

  onVideoReady(video) {
    // Show media info
    document.querySelector("#artist span").textContent = player.data.song.artist.name;
    document.querySelector("#song span").textContent = player.data.song.name;

    // reset last time
    lastTime = -1;
  },

  onTimerReady() {
    overlay.className = "disabled";
    document.querySelector("#control > a#play").className = "";
    document.querySelector("#control > a#stop").className = "";
  },

  onTimeUpdate(position) {
    // update seekbar
    paintedSeekbar.style.width = `${
      parseInt((position * 1000) / player.video.duration) / 10
    }%`;
    // End when video has no firstChar
    if (!player.video.firstChar) {
      return;
    }
    // Save last time to position
    lastTime = position;
  },

  onPlay() {
    const a = document.querySelector("#control > a#play");
    while (a.firstChild) a.removeChild(a.firstChild);
    a.appendChild(document.createTextNode("\uf28b"));
    mikuTimer.connect( document );
    mikuTimer.reset()
  },

  onPause() {
    const a = document.querySelector("#control > a#play");
    while (a.firstChild) a.removeChild(a.firstChild);
    a.appendChild(document.createTextNode("\uf144"));
  },
});

// Play / Pause button
document.querySelector("#control > a#play").addEventListener("click", (e) => {
  e.preventDefault();
  if (player) {
    if (player.isPlaying) {
      player.requestPause();
    } else {
      player.requestPlay();
    }
  }
  return false;
});

// Stop button
document.querySelector("#control > a#stop").addEventListener("click", (e) => {
  e.preventDefault();
  if (player) {
    player.requestStop();
    mikuTimer.disconnect()
  }
  return false;
});

/* シークバー */
seekbar.addEventListener("click", (e) => {
  e.preventDefault();
  if (player) {
    player.requestMediaSeek(
      (player.video.duration * e.offsetX) / seekbar.clientWidth
    );
  }
  return false;
});