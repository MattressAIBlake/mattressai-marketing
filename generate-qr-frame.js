const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Function to draw a rounded rectangle
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Generate a simple gray QR code frame
function generateGrayFrame() {
  // Create a 400x400 canvas for the frame
  const canvas = createCanvas(400, 400);
  const ctx = canvas.getContext('2d');
  
  // Set background to transparent
  ctx.clearRect(0, 0, 400, 400);
  
  // Draw a gray rounded rectangle frame
  ctx.fillStyle = 'rgba(128, 128, 128, 0.3)'; // Semi-transparent gray
  roundRect(ctx, 0, 0, 400, 400, 20); // Rounded corners with 20px radius
  ctx.fill();
  
  // Draw a inner white area for the QR code
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // Semi-transparent white
  roundRect(ctx, 40, 40, 320, 320, 10); // Inner area with 10px radius
  ctx.fill();
  
  // Save the image
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(__dirname, 'public', 'images', 'qr-background.png');
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`Gray QR frame saved to ${outputPath}`);
}

// Run the function
generateGrayFrame(); 