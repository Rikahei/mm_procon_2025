# Magical Universe - 初音ミク「マジカルミライ 2025」』プログラミング・コンテスト応募作品

Magical Universeは、音楽と光を演出するWEBアプリケーションです。TextAliveの機能を使って、文字と光エフェクトを連動させて、イラストと共にパフォーマンスします。

画面を横に置いて、`地球`:earth_asia:を`タップ`して、「Magical Universe」を体験してみましょう。

Magical Universe - A music and lighting performance web application powered by TextAlive. Combines lyrics, light effects and illustrations to build an immersive 3D universe experience.

Set your screen horizontally, `tap` the `Earth` :earth_asia: and enjoy!

デモページ / Demo page: [GitHub Pages](https://rikahei.github.io/mm_procon_2025/)

### Keypoints
- 推奨環境： Chrome ブラウザ(PC版) / Recommended environment: Google Chrome (PC version)
  - 高解像度推奨 / Recommended high-resolution : `4k`, `1440p`, `1080p` etc.
  - 推奨画面アスペクト比 / Recommended screen aspect-ratio: `16:9`, `21:9`
  - スマートフォン・タブレット対応 / Mobile & tablet support
- 『初音ミク「マジカルミライ 2025」楽曲コンテスト』4楽曲に対応 / Supports 4 tracks from "Hatsune Miku “Magical Mirai 2025” Song Contest" :cd:
  - [TextAlive App Customizer](https://developer.textalive.jp/app/run/?ta_app_url=https%3A%2F%2Frikahei.github.io%2Fmm_procon_2025%2F)で別の楽曲も動作可能 / Other tracks can be played using TextAlive App Customizer.
- `イラスト`、`全画面` & `音量` は画面右上の「コントロールボックス」で変更可能 / `illustrations`, `Full screen` & `Volume` can be changed via the "Controls Box" at the top right of the screen.
- 開演時の`地球`における光線の変化 / Light transitions on `Earth` at the start :sunny:
- 3D文字の構成色と光エフェクトの演出 / Visual effects of light on 3D text color combinations :fireworks:
- 初音ミクのイラストの動作 / Hatsune Miku's illustration animation

<img width="371" height="215" alt="Screenshot 2025-10-22 at 16 10 16" src="https://github.com/user-attachments/assets/8a5bfbaa-7293-4c8f-ba6d-e987b41e7cd2" />

![ezgif-6f1f5cebcc3197](https://github.com/user-attachments/assets/f85d5642-b243-469d-ad96-f60e2619c125)

### Our team

- Program & Model by <ins>Aless Li</ins>
- Illustrations & Models by <ins>Yohki</ins>

投稿者コメント
>ようこそ、マジカル宇宙ヘ！
>
>「マジカル宇宙」は、初音ミク×奏の森リゾートというグランピングイベントから着想を得て、伊豆高原で見えた夕暮れから夜への「星河一天」の景色を、光と音楽のパフォーマンスとして再現するWEBアプリケーションです。
>
>地球🌏をタップすると、演出が開始されます。
>また、選曲や音量などの設定を変更することができます。
>
>パフォーマンスの最後、ミクの姿が．．．？
>
>※横画面での演出を推奨

## Development environment
### Docker local environment
```
docker compose up --build
```
### Run with NPM (no docker)
To install packages & run development environment
```
cd app/frontend
npm install
npm run dev -- --host
```
To build production
```
npm run build
```
TextAlive API token

In `.env` file, replace `VITE_TEXTALIVE_TOKEN`

## TextAlive App API

![TextAlive](https://i.gyazo.com/thumb/1000/5301e6f642d255c5cfff98e049b6d1f3-png.png)

TextAlive App API is the JavaScript API for developing "lyric apps" (cf. lyric videos) that show lyrics synchronized with the music playback.

For more details on the TextAlive App API, please visit the website [TextAlive for Developers](https://developer.textalive.jp/).

## Libraries and Licenses

>axios (MIT)
>
>textalive-app-api (Read the license permissions & conditions at [TextAlive.jp](https://textalive.jp/) )
>
>three.js (MIT)
>
>[threejs-gif-texture](https://github.com/bandinopla/threejs-gif-texture) (BSD 2-Clause)
>
>lil-gui (MIT)
>
>typescript	(Apache-2.0)
>
>vite	(MIT)

## Font

- [DotGothic16](https://fonts.google.com/specimen/DotGothic16/license?lang=ja_Jpan) (SIL Open Font License (OFL) version 1.1), converted to typeface.json format for textloader in three.js.

- [Shippori Mincho B1](https://fonts.google.com/specimen/Shippori+Mincho+B1) (SIL Open Font License (OFL) version 1.1)

- [font-awesome](https://fontawesome.com/v4/license/) (SIL Open Font License (OFL) version 1.1)
