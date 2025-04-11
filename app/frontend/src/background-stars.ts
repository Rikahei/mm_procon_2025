import { Graphics, type Application } from "pixi.js"; // Import Application type if needed

// Function to generate a random light color (hex format)
const getRandomLightColor = (): number => {
  const r = Math.floor(Math.random() * 128 + 127);
  const g = Math.floor(Math.random() * 128 + 127);
  const b = Math.floor(Math.random() * 128 + 127);
  return (r << 16) + (g << 8) + b;
};

// Function to create and return the Graphics object with dots
export const createRandomStars = (app: Application, numberOfDots: number, dotRadius: number): Graphics => {
  const graphics = new Graphics();

  for (let i = 0; i < numberOfDots; i++) {
    const randomColor = getRandomLightColor();
    // Use app.screen dimensions for positioning
    const randomX = Math.random() * app.screen.width;
    const randomY = Math.random() * app.screen.height;

    // Using beginFill/drawCircle/endFill for robustness
    graphics.beginFill(randomColor);
    graphics.drawCircle(randomX, randomY, dotRadius);
    graphics.endFill();

    // --- Alternative using fill/circle (ensure PixiJS version supports this well) ---
    // graphics.fill(randomColor);
    // graphics.circle(randomX, randomY, dotRadius);
    // ---
  }

  return graphics; // Return the created graphics object
};
