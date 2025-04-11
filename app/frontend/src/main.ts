import { Application } from "pixi.js"; // Graphics is no longer directly needed here
import { createRandomStars } from "./background-stars"; // Import the new function

// Create a new Stage.
const createApp = async () => {
  const app = new Application();
  await app.init({ background: '#000000', resizeTo: window });
  document.body.appendChild(app.canvas);
  return app;
};

const main = async () => {
  // Create the PixiJS application
  const app = await createApp();

  // --- Use the imported function ---
  const dotRadius: number = 2;
  const numberOfDots: number = 20;

  // Call the function from dots.ts to get the graphics object
  const dotsGraphics = createRandomStars(app, numberOfDots, dotRadius);

  // Add the returned graphics object to the stage
  app.stage.addChild(dotsGraphics);

};

// Run the main function
main();
