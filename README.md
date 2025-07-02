# Magical Universe - 初音ミク「マジカルミライ 2025」』プログラミング・コンテスト応募作品

Magical Universeは、音楽と光を演出するWEBアプリケーションです。TextAliveの機能を使って、文字と光エフェクトを連動させて、イラストと共にパフォーマンスします。

画面を横に置いて、`地球`:earth_asia:を`タップ`して、「Magical Universe」を体験してみましょう。

Magical Universe - A music and lighting performance web application powered by TextAlive. Combines lyrics, light effects and illustrations to build an immersive 3D universe experience.

Set your screen horizontally, `tap` the `Earth` :earth_asia:, Enjoy!

### Keypoints

- デモページ / Demo page: [GitHub Pages](https://rikahei.github.io/mm_procon_2025/)
- 推奨画面アスペクト比 / Recommended screen aspect-ratio: `16:9` `21:9`
- 設定は、画面右上の「コントロールボックス」で変更できます / Settings can be changed in the "Controls Box" at the top right of the screen: 
 `楽曲、イラスト、全画面 & 音量 / Tracks, illustrations, Full screen & Volume`

![ezgif-6f1f5cebcc3197](https://github.com/user-attachments/assets/f85d5642-b243-469d-ad96-f60e2619c125)

### Creators team

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
>textalive-app-api (Read the license permission & condition at [TextAlive.jp](https://textalive.jp/) )
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

From [DotGothic16](https://fonts.google.com/specimen/DotGothic16/license?lang=ja_Jpan) (SIL Open Font License (OFL) version 1.1), converted to typeface.json format for textloader in three.js.
