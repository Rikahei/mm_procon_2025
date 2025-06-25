import { Player } from "textalive-app-api";
import * as THREE from 'three';
import { Timer } from 'three/addons/misc/Timer.js';

// TextAlive Player を初期化
export {player, mikuTimer};

const mikuTimer = new Timer();
const player = new Player({
  // トークンは https://developer.textalive.jp/profile で取得したものを使う
  app: {
    // TODO: replace this token
    token: "test",
    parameters: [
      {
        title: "Gradation start color",
        name: "gradationStartColor",
        className: "Color",
        initialValue: "#bfaefc",
      },
      {
        title: "Gradation middle color",
        name: "gradationMiddleColor",
        className: "Color",
        initialValue: "#fea3db"
      },
      {
        title: "Gradation end color",
        name: "gradationEndColor",
        className: "Color",
        initialValue: "#9ae1dd",
      },
    ],
  },

  mediaElement: document.querySelector("#media"),
  mediaBannerPosition: "bottom right",

  // オプション一覧
  // https://developer.textalive.jp/packages/textalive-app-api/interfaces/playeroptions.html
});

const overlay = document.querySelector("#overlay");
const textContainer = document.querySelector("#text");
const seekbar = document.querySelector("#seekbar");
const paintedSeekbar = seekbar.querySelector("div");
let lastTime = -1;

// const getUrlParams = new URLSearchParams(document.location.search);
// let songUrl = getUrlParams.get("song_url");

player.addListener({
  /* APIの準備ができたら呼ばれる */
  onAppReady(app) {
    if (app.managed) {
      document.querySelector("#control").className = "disabled";
    }
    if (!app.songUrl) {
      document.querySelector("#media").className = "disabled";

      // ストリートライト / 加賀(ネギシャワーP)
      player.createFromSongUrl("https://piapro.jp/t/CyPO/20250128183915", {
        video: {
          // // 音楽地図訂正履歴
          // beatId: 4694275,
          // chordId: 2830730,
          // repetitiveSegmentId: 2946478,
      
          // // 歌詞URL: https://piapro.jp/t/DPXV
          // // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FULcJ%2F20250205120202
          // lyricId: 67810,
          // lyricDiffId: 20654
        },
      });
    }
  },

  /* パラメタが更新されたら呼ばれる */
  onAppParameterUpdate: () => {
    const params = player.app.options.parameters;
    const sc = player.app.parameters.gradationStartColor,
      scString = sc ? `rgb(${sc.r}, ${sc.g}, ${sc.b})` : params[0].initialValue;
    const mc = player.app.parameters.gradationMiddleColor,
      mcString = mc ? `rgb(${mc.r}, ${mc.g}, ${mc.b})` : params[0].initialValue;
    const ec = player.app.parameters.gradationEndColor,
      ecString = ec ? `rgb(${ec.r}, ${ec.g}, ${ec.b})` : params[1].initialValue;
    document.body.style.backgroundColor = ecString;
    document.body.style.backgroundImage = `linear-gradient(0deg, ${ecString} 0%, ${mcString} 50%, ${scString} 100%)`;
  },

  /* 楽曲が変わったら呼ばれる */
  onAppMediaChange() {
    // 画面表示をリセット
    overlay.className = "";
    resetChars();
  },

  /* 楽曲情報が取れたら呼ばれる */
  onVideoReady(video) {
    // 楽曲情報を表示
    document.querySelector("#artist span").textContent =
      player.data.song.artist.name;
    document.querySelector("#song span").textContent = player.data.song.name;

    // 最後に取得した再生時刻の情報をリセット
    lastTime = -1;
    player.volume = 20;
  },

  /* 再生コントロールができるようになったら呼ばれる */
  onTimerReady() {
    overlay.className = "disabled";
    document.querySelector("#control > a#play").className = "";
    document.querySelector("#control > a#stop").className = "";
  },

  /* 再生位置の情報が更新されたら呼ばれる */
  onTimeUpdate(position) {
    // シークバーの表示を更新
    paintedSeekbar.style.width = `${
      parseInt((position * 1000) / player.video.duration) / 10
    }%`;

    // 歌詞情報がなければこれで処理を終わる
    if (!player.video.firstChar) {
      return;
    }

    // 巻き戻っていたら歌詞表示をリセットする
    if (lastTime > position + 1000) {
      resetChars();
    }

    // 500ms先に発声される文字を検出
    // 初回は開始時からの差分区間、それ以降は前回実行時からの差分区間を検出
    const chars = player.video.findCharChange(lastTime < 0 ? lastTime : lastTime + 500, position + 500);
    for (const c of chars.entered) {
      // 新しい文字が発声されようとしている
      newChar(c);
    }

    // 次回呼ばれるときのために再生時刻を保存しておく
    lastTime = position;
  },

  /* 楽曲の再生が始まったら呼ばれる */
  onPlay() {
    const a = document.querySelector("#control > a#play");
    while (a.firstChild) a.removeChild(a.firstChild);
    a.appendChild(document.createTextNode("\uf28b"));
    mikuTimer.connect( document );
    mikuTimer.reset()
  },

  /* 楽曲の再生が止まったら呼ばれる */
  onPause() {
    const a = document.querySelector("#control > a#play");
    while (a.firstChild) a.removeChild(a.firstChild);
    a.appendChild(document.createTextNode("\uf144"));
  },
});

/* 再生・一時停止ボタン */
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

/* 停止ボタン */
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