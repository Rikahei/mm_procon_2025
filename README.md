# Magical Universe - 初音ミク「マジカルミライ 2025」』プログラミング・コンテスト応募作品

- Demo page at [GitHub Pages](https://rikahei.github.io/mm_procon_2025/)

- Recommend aspect-ratio: 16:9, 21:9

![Image](https://github.com/user-attachments/assets/e80a4c4e-cf6d-477a-846b-bfa7d3760332)

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
## TextAlive App API

![TextAlive](https://i.gyazo.com/thumb/1000/5301e6f642d255c5cfff98e049b6d1f3-png.png)

TextAlive App API is the JavaScript API for developing "lyric apps" (cf. lyric videos) that show lyrics synchronized with the music playback.

For more details on the TextAlive App API, please visit the website [TextAlive for Developers](https://developer.textalive.jp/).
