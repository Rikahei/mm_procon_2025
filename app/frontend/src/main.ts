import { Application, Assets, Sprite } from "pixi.js";

// Create a new Stage.
const createApp = async () => {

  const app = new Application();

  await app.init({ background: '#cccccc', resizeTo: window });

  document.body.appendChild(app.canvas);
  return app
}

const main = async () => {
  const app = await createApp()
  const texture = await Assets.load('https://pixijs.com/assets/bunny.png');
  const sprite = new Sprite(texture)
  app.stage.addChild(sprite)
}

main()