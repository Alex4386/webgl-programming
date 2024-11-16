
let daylightCycle = 0; // 0 = 0:00, 1 = 24:00
let daylightCycleSpeed = 0.001; // Speed of the daylight cycle

const SkyStatus = {
  NIGHT: 0,
  SUNRISE: 1,
  DAY: 2,
  SUNSET: 3,
};

function setSpeed(speed) {
  daylightCycleSpeed = speed / 1000;
}

function onFrame() {
  daylightCycle += daylightCycleSpeed;
  daylightCycle %= 1.0;
}

function lerp(color1, color2, t) {
  if (!color1 || !color2 || color1.length !== 3 || color2.length !== 3) {
    console.error("Invalid color input:", color1, color2);
    return [0, 0, 0];
  }

  if (isNaN(t)) throw new Error('Invalid t value: '+t);
  
  return [
    color1[0] * (1 - t) + color2[0] * t,
    color1[1] * (1 - t) + color2[1] * t,
    color1[2] * (1 - t) + color2[2] * t,
  ];
}

function getSkyStatus(rawDaylightCycle) {
  let daylightCycle = Math.max(0, Math.min(1, rawDaylightCycle % 1.0));

  if (daylightCycle < 0.2 || daylightCycle > 0.75) {
    return SkyStatus.NIGHT;
  } else if (daylightCycle < 0.25) {
    return SkyStatus.SUNRISE;
  } else if (daylightCycle < 0.7) {
    return SkyStatus.DAY;
  } else {
    return SkyStatus.SUNSET;
  }
}
function setSkyGradient() {
  // Define key points in the day cycle
  const colors = [
    { time: 0.0, colorTop: '#222222', colorBottom: '#071717' }, // Midnight
    { time: 0.2, colorTop: '#222222', colorBottom: '#071717' }, // Midnight
    { time: 0.3, colorTop: '#aa5500', colorBottom: '#ffcc00' }, // Sunrise
    { time: 0.5, colorTop: '#00ccff', colorBottom: '#0000ff' }, // Noon (Day)
    { time: 0.7, colorTop: '#ffcc00', colorBottom: '#654321' }, // Sunset
    { time: 0.8, colorTop: '#222222', colorBottom: '#071717' }, // Midnight
    { time: 1.0, colorTop: '#222222', colorBottom: '#071717' }, // Midnight
  ];

  // Convert hex colors to WebGL colors
  for (const point of colors) {
    point.colorTop = convertHexToWebGLColor(point.colorTop);
    point.colorBottom = convertHexToWebGLColor(point.colorBottom);
  }

  // Find the two key points surrounding the current daylightCycle
  let start, end;
  for (let i = 0; i < colors.length - 1; i++) {
    if (daylightCycle >= colors[i].time && daylightCycle <= colors[i + 1].time) {
      start = colors[i];
      end = colors[i + 1];
      break;
    }
  }

  // Calculate the interpolation factor `t` between the two key points
  const t = (daylightCycle - start.time) / (end.time - start.time);

  // Interpolate top and bottom colors
  const topColor = lerp(start.colorTop, end.colorTop, t);
  const bottomColor = lerp(start.colorBottom, end.colorBottom, t);

  // Set the gradient color
  setGradientColor(topColor, bottomColor);
}


function getSunMoonPosition(daylightCycle) {
  // Full circle for sun and moon path (0 to 2π radians)
  const angle = daylightCycle * Math.PI * 2 - Math.PI / 2;

  // Sun position (0 radians starts at sunrise, π at sunset)
  const sunX = Math.cos(angle) * 1.25;
  const sunY = Math.sin(angle) * 1;

  // Moon position (shifted by π radians to be opposite of the sun)
  const moonX = Math.cos(angle + Math.PI) * 1.5;
  const moonY = Math.sin(angle + Math.PI) * 1;

  return { sunX, sunY, moonX, moonY };
}

function drawSun(daylightCycle) {
  const { sunX, sunY } = getSunMoonPosition(daylightCycle);
  const status = getSkyStatus(daylightCycle);
  setColor([1, 1, 0]);
  
  if (daylightCycle < 0.2 || daylightCycle > 0.8) return;
  drawCircle(96, [sunX, sunY - 0.5, 0, 0], [0.25, 0.25, 1, 1]);
}

function drawMoon(daylightCycle) {
  const { moonX, moonY } = getSunMoonPosition(daylightCycle);
  const status = getSkyStatus(daylightCycle);
  setColor([1, 1, 1]);

  if (daylightCycle > 0.3 && daylightCycle < 0.7) return;

  // Adjust opacity based on the time of day for smooth transitions
  let moonAlpha = 1;
  if (daylightCycle > 0.2 && daylightCycle < 0.8) {
    moonAlpha = 0; // Day time
  } else if (daylightCycle < 0.1 || daylightCycle > 0.9) {
    moonAlpha = 1; // Night time
  } else if (daylightCycle < 0.2) {
    moonAlpha = (0.2 - daylightCycle) / 0.1; // Moonset transition
  } else if (daylightCycle > 0.8) {
    moonAlpha = (daylightCycle - 0.8) / 0.1; // Moonrise transition
  }

  setColor([1, 1, 1, moonAlpha]);
  drawCircle(96, [moonX, moonY - 0.5, 0, 0], [0.25, 0.25, 1, 1]);
}

function drawSky() {
  const status = getSkyStatus(daylightCycle);
  
  setSkyGradient(status);
  drawSquare([0, 0, 0, 0], [2, 2, 1, 1]);

  drawSun(daylightCycle);
  drawMoon(daylightCycle);
}

function setGroundColor(daylightCycle) {
  const nightColor = convertHexToWebGLColor('#222222');
  const sunriseColor = convertHexToWebGLColor('#aa5500');
  const dayColor = convertHexToWebGLColor('#008808');
  const sunsetColor = convertHexToWebGLColor('#ffcc00');

  let color;

  if (daylightCycle < 0.2) {
    setColor(nightColor);
  } else if (daylightCycle < 0.25) {
    // Night to Sunrise
    const t = (daylightCycle - 0.2) / 0.05;
    color = lerp(nightColor, sunriseColor, t);
  } else if (daylightCycle < 0.3) {
    // Sunrise to Day
    const t = (daylightCycle - 0.25) / 0.05;
    color = lerp(sunriseColor, dayColor, t);
  } else if (daylightCycle < 0.65) {
    // Daytime
    color = dayColor;
  } else if (daylightCycle < 0.7) {
    // Day to Sunset
    const t = (daylightCycle - 0.65) / 0.05;
    color = lerp(dayColor, sunsetColor, t);
  } else if (daylightCycle < 0.75) {
    // Day to Sunset
    const t = (daylightCycle - 0.7) / 0.05;
    color = lerp(sunsetColor, nightColor, t);
  } else {
    setColor(nightColor);
  }

  setColor(color);
}

function drawGround() {
  setGroundColor(daylightCycle);
  drawSquare([0, -1, 0, 0], [2, 1, 1, 1]);
}

// === Mountains ===
let scrollOffset = 0; // Controls the horizontal scrolling of the mountains
const mountainBuffer = []; // Buffer to store generated mountain data
const mountainSpeed = 0.01; // Speed of parallax scrolling
const mountainWidth = 0.4; // Width of each mountain
const bufferSize = 10; // Number of mountains in the buffer

function initializeMountains() {
  for (let i = 0; i < bufferSize; i++) {
    mountainBuffer.push(generateRandomMountain(i * mountainWidth));
  }
}

function generateRandomMountain(xOffset) {
  const height = Math.random() * 0.5 + 0.2; // Random height between 0.2 and 0.7
  const z = Math.random() * 0.5; // Random z value between 0 and 0.5
  return { xOffset, height, z };
}

function setMountainColor() {
  const nightBaseColor = convertHexToWebGLColor('#000000');
  const nightPeakColor = convertHexToWebGLColor('#111111');
  const sunriseBaseColor = convertHexToWebGLColor('#aa5500');
  const sunrisePeakColor = convertHexToWebGLColor('#ffcc00');
  const dayBaseColor = convertHexToWebGLColor('#96c94a');
  const dayPeakColor = convertHexToWebGLColor('#478a0b');
  const sunsetBaseColor = convertHexToWebGLColor('#ffcc00');
  const sunsetPeakColor = convertHexToWebGLColor('#654321');

  let baseColor, peakColor;

  if (daylightCycle < 0.2) {
    peakColor = nightPeakColor;
    baseColor = nightBaseColor;
  } else if (daylightCycle < 0.25) {
    // Night to Sunrise
    const t = (daylightCycle - 0.2) / 0.05;
    peakColor = lerp(nightPeakColor, sunrisePeakColor, t);
    baseColor = lerp(nightBaseColor, sunriseBaseColor, t);
  } else if (daylightCycle < 0.3) {
    // Sunrise to Day
    const t = (daylightCycle - 0.25) / 0.05;
    peakColor = lerp(sunrisePeakColor, dayPeakColor, t);
    baseColor = lerp(sunriseBaseColor, dayBaseColor, t);
  } else if (daylightCycle < 0.65) {
    // Daytime
    peakColor = dayPeakColor;
    baseColor = dayBaseColor;
  } else if (daylightCycle < 0.7) {
    // Day to Sunset
    const t = (daylightCycle - 0.65) / 0.05;
    peakColor = lerp(dayPeakColor, sunsetPeakColor, t);
    baseColor = lerp(dayBaseColor, sunsetBaseColor, t);
  } else if (daylightCycle < 0.75) {
    // Day to Sunset
    const t = (daylightCycle - 0.7) / 0.05;
    peakColor = lerp(sunsetPeakColor, nightPeakColor, t);
    baseColor = lerp(sunsetBaseColor, nightBaseColor, t);
  } else {
    peakColor = nightPeakColor;
    baseColor = nightBaseColor;
  }

  setGradientColor(
    peakColor,
    baseColor,
  );
}

function updateMountains() {
  scrollOffset -= (daylightCycleSpeed / 1.2);

  // Check if the leftmost mountain is out of view
  if (mountainBuffer[0].xOffset + scrollOffset < -1 - mountainWidth) {
    // Remove the leftmost mountain
    mountainBuffer.shift();

    // Generate a new mountain on the right
    const newXOffset = mountainBuffer[mountainBuffer.length - 1].xOffset + mountainWidth;
    mountainBuffer.push(generateRandomMountain(newXOffset));
  }
}

function drawMountains() {
  setMountainColor();

  for (const mountain of mountainBuffer) {
    const x = mountain.xOffset + scrollOffset;
    const baseY = -0.25;
    const peakY = baseY + mountain.height;

    // Draw the mountain using a triangle with interpolated colors
    drawTriangle([x + mountainWidth / 2, -.5, 0, 0], [2, mountain.height, 1, 1]);
  }
}

// === STARS ===
const starBuffer = [];
const maxStars = 200;
const generateStars = 100;
const starSpeed = 0.001;

function initializeStars() {
  for (let i = 0; i < generateStars; i++) {
    starBuffer.push(generateRandomStar());
  }

  registerStarGeneration();
}

function generateRandomStar() {
  return {
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
    size: Math.random() * 0.01,
  };
}

function updateStars() {
  for (const star of starBuffer) {
    star.y -= starSpeed;
    if (star.y < -1) {
      star.y = 1;
    }
  }
}

function registerStarGeneration() {
  document.getElementById('gl-canvas').addEventListener('click', (e) => {
    // create new star at mouse position
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log(x, y);

    const star = {
      x: x / rect.width * 2 - 1,
      y: 1 - y / rect.height * 2,
      size: Math.random() * 0.01,
    };

    if (starBuffer.length >= maxStars) {
      starBuffer.shift();
    }
    starBuffer.push(star);
  });
}

function drawStars() {
  if (daylightCycle > 0.3 && daylightCycle < 0.7) return;

  setColor([1, 1, 1]);
  for (const star of starBuffer) {
    drawCircle(16, [star.x, star.y, 0, 0], [star.size, star.size, 1, 1]);
  }
}

let hasInit = false;
function drawFrame() {
  const gl = globalGL;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (!hasInit) {
    hasInit = true;
    initializeMountains();
    initializeStars();
  }

  drawSky();

  // Update and draw stars
  updateStars();
  drawStars();

  // Update and draw mountains
  updateMountains();
  drawMountains();


  drawGround();
}
