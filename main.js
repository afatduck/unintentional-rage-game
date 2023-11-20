// Variables
const dotWidth = 16;
const pressHeight = 20;
const pressDotsNumber = 4;
const fps = 60;
const lines = [];
const lineWidth = 6;
const lineSpeed = 4;
const keyDown = [false, false, false, false];
const safeKey = [false, false, false, false];
const missTolerance = 30;
const baseSpritePath = './assets/';
const sprites = {
  'idle': 'Idle.png',
  'eyes': 'Eyes.png',
  'l': 'L.png',
  'arms1': 'Arms1.png',
  'arms2': 'Arms2.png',
}
let timeouts = []
let t = 0;
let lost = false;
let stopped = true;
let lineCooldown = 0;
let glowColor = 'skyblue';
let spacePressed = true;
let message = 0;

// Stages
class StageEnum {
  start = 0
  afterwarmup = 1
  '1to0' = 2
  '0to1' = 3
  '2to0' = 4
  '0to2' = 5
  '2to1' = 6
  '1to2' = 7
  '1to1' = 8
  '2to2' = 9
  win = 10
  lose = 11
  retry = 12
}
const Stages = new StageEnum();
let stage = Stages.start;


// Dialog
const dialog = {
  [Stages.start]: [
    {
      "text": "Hey there! Wanna play a game?",
      "sprite": "idle"
    },
    {
      "text": "I'll take that as a yes!",
      "sprite": "arms1"
    },
    {
      "text": "Let's go over the rules.",
      "sprite": "arms2"
    },
    {
      "text": "You have to press the buttons when the lines reach the dotted area.",
      "sprite": "eyes"
    },
    {
      "text": "If you press the button too early or too late, you lose.",
      "sprite": "idle"
    },
    {
      "text": "We will compete, first one to lose three times loses.",
      "sprite": "arms1"
    },
    {
      "text": "But before we start, let's warm you up a bit. Do 20 seconds without losing.",
      "sprite": "eyes"
    },
  ],
  [Stages.retry]: [
    {
      "text": "Let's try again.",
      "sprite": "idle"
    },
  ],
  [Stages.afterwarmup]: [
    {
      "text": "Nice! You're ready now.",
      "sprite": "arms1"
    },
    {
      "text": "But beware, I'm an expert at this game.",
      "sprite": "arms2"
    },
    {
      "text": "Let's go!",
      "sprite": "idle"
    },
  ],
  [Stages['1to0']]: [
    {
      "text": "Aww! I lost!",
      "sprite": "l"
    },
    {
      "text": "That's just beginner's luck.",
      "sprite": "eyes"
    },
    {
      "text": "Ill get you next round!",
      "sprite": "arms1"
    },
    {
      "text": "Let's go again!",
      "sprite": "idle"
    }]
    ,
    [Stages['0to1']]: [
      {
        "text": "I won!",
        "sprite": "arms2"
      },
      {
        "text": "I told you I was an expert.",
        "sprite": "eyes"
      },
      {
        "text": "Let's go again!",
        "sprite": "idle"
      },
    ],
    [Stages['2to0']]: [
      {
        "text": "Aww! I lost again!",
        "sprite": "l"
      },
      {
        "text": "I'm not giving up!",
        "sprite": "eyes"
      },
      {
        "text": "But I must admit, you're pretty good.",
        "sprite": "arms1"
      },
      {
        "text": "Let's go again!",
        "sprite": "idle"
      },
    ],
    [Stages['0to2']]: [
      {
        "text": "I won again!",
        "sprite": "arms2"
      },
      {
        "text": "Don't wanna discourage you, but your chances of winning are pretty slim right now.",
        "sprite": "arms1"
      },
      {
        "text": "Haha, good luck!",
        "sprite": "eyes"
      },
    ],
    [Stages['2to1']]: [
      {
        "text": () => lost ? "Hah! Look like I'm getting back on my feet!" : "Aww! I lost again! No way!",
        "sprite": () => lost ? "arms2" : "l"
      },
      {
        "text": "I'll make sure to win the next one!",
        "sprite": "eyes"
      },
      {
        "text": "And the one after that!",
        "sprite": "arms1"
      },
      {
        "text": "Show me what you got!",
        "sprite": "idle"
      }, 
    ],
    [Stages['1to2']]: [
      {
        "text": () => lost ? "I won again! I'm on a roll!" : "Oww I lost, guess I can't leave you with zero wins?",
        "sprite": () => lost ? "arms2" : "l"
      },
      {
        "text": "Just one more win and I'll be the champion!",
        "sprite": "eyes"
      },
      {
        "text": "Be careful now!",
        "sprite": "arms1"
      },
      {
        "text": "I'm coming for you!",
        "sprite": "idle"
      },
    ],
    [Stages['1to1']]: [
      {
        "text": () => lost ? "And now we are even again, hope you didn't get too comfortable!" : "Aww, how did I lose!?",
        "sprite": () => lost ? "eyes" : "l"
      },
      {
        "text": "Oh well, we are even now, but not in odds hehe.",
        "sprite": "arms1"
      },
      {
        "text": "Hope you're ready for the next one!",
        "sprite": "idle"
      },
      {
        "text": "Let's roll!",
        "sprite": "arms2"
      }
    ],
    [Stages['2to2']]: [
      {
        "text": () => lost ? "And now we are even again!" : "Ahh you're actually catching up!",
        "sprite": () => lost ? "eyes" : "arms1"
      },
      {
        "text": "This will be the final round!",
        "sprite": "arms2"
      },
      {
        "text": "This is so exciting!",
        "sprite": "arms1"
      },
      {
        "text": "Let's go!",
        "sprite": "idle"
      },
    ],
    [Stages.win]: [
      {
        "text": "Aww! I lost! Have you been cheating?",
        "sprite": "l"
      },
      {
        "text": "I'm just kidding, you're really good.",
        "sprite": "arms2"
      },
      {
        "text": "I mean I have to admit, I'm a bit disappointed.",
        "sprite": "idle"
      },
      {
        "text": "I thought I was the best at this game.",
        "sprite": "idle"
      },
      {
        "text": "But you're even better than me!",
        "sprite": "arms1"
      },
      {
        "text": "But don't worry, I'll get you next time!",
        "sprite": "eyes"
      },
      {
        "text": "See you soon!",
        "sprite": "arms2"
      },
    ],
    [Stages.lose]: [
      {
        "text": "I won! I'm the champion!",
        "sprite": "arms2"
      },
      {
        "text": "I knew I could do it!",
        "sprite": "arms1"
      },
      {
        "text": "I'm the best at this game!",
        "sprite": "arms2"
      },
      {
        "text": "I'm the best at everything!",
        "sprite": "arms1"
      },
      {
        "text": "But hey, you're pretty good too.",
        "sprite": "arms2"
      },
      {
        "text": "Maybe not as good as me, but we just can't compare.",
        "sprite": "eyes"
      },
      {
        "text": "I'm just too good.",
        "sprite": "arms1"
      },
      {
        "text": "Anyway, I'll let you go now.",
        "sprite": "arms2"
      },
      {
        "text": "See you soon!",
        "sprite": "arms1"
      },
    ],
}

// Hint

const hint = document.getElementById('hint');
const hideHint = () => hint.style.color = 'transparent';
const showHint = () => hint.style.color = '#aaa';
hideHint();

// Text
const text = document.getElementById('text');
let textDone = true;

const writeText = textToWrite => {
  textDone = false;
  hideHint();
  text.innerHTML = '';
  if (!textToWrite) return;
  let t = 0;
  const me = setInterval(() => {
    if (textDone) return;
    text.innerHTML += textToWrite[t];
    t++;
    if (t >= textToWrite.length) {
      textDone = true;
      showHint();
      clearInterval(me);
    }
  }, 30);
}

// Images
for(const sprite in sprites) {
  const loader = new Image();
  loader.src = baseSpritePath + sprites[sprite];
}

const character = document.getElementById('character');
character.src = baseSpritePath + sprites['idle'];

// Character dancing
let danceInterval;
const dance = () => {
  let a = 1;
  danceInterval = setInterval(() => {
    if (a === 1) {
      character.src = baseSpritePath + sprites['arms1'];
      a = 2;
      return;
    }
    character.src = baseSpritePath + sprites['arms2'];
    a = 1;
  }, 500);
}

const stopDance = () => {
  clearInterval(danceInterval);
  character.src = baseSpritePath + sprites['idle'];
}


// Utils
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Canvas

const canvas = document.getElementsByTagName("canvas");
const ctx = canvas[0].getContext("2d");
const canvasHeight = canvas[0].height;
const canvasWidth = canvas[0].width;

// Keyboard
// [arrow left, arrow up, arrow down, arrow right]

const keyDownHandler = (e) => {
  if (e.keyCode === 37) keyDown[0] = true;
  if (e.keyCode === 38) keyDown[1] = true;
  if (e.keyCode === 40) keyDown[2] = true;
  if (e.keyCode === 39) keyDown[3] = true;
  if (e.keyCode === 32) spacePressed = true;
}

const keyUpHandler = (e) => {
  if (e.keyCode === 37) keyDown[0] = false;
  if (e.keyCode === 38) keyDown[1] = false;
  if (e.keyCode === 40) keyDown[2] = false;
  if (e.keyCode === 39) keyDown[3] = false;
}

// Buttons
const bttns = document.querySelectorAll('.buttons i')
bttns.forEach((bttn, index) => {
  bttn.addEventListener('mousedown', () => keyDown[index] = true)
  bttn.addEventListener('mouseup', () => keyDown[index] = false);
  // for mobile
  bttn.addEventListener('touchstart', () => keyDown[index] = true)
  bttn.addEventListener('touchend', () => keyDown[index] = false);
})

const secureKey = index => {
  if (keyDown[index]) {
    safeKey[index] = true;
  }

  timeouts.forEach((timeout, i) => {
    if (timeout.index === index) {
      clearTimeout(timeout.to);
      timeouts.splice(i, 1);
    }
  })

  const to = setTimeout(() => {
    safeKey[index] = false;
  }, 400);
  timeouts.push({to, index});
}

const buttonGlow = () => {
  for (let i = 0; i < pressDotsNumber; i++) {
    if (keyDown[i]) {
      bttns[i].style.color = glowColor;
      return;
    }
    bttns[i].style.color = 'black';
  }
}

// Lines
class Line {
  x = 0;
  y = 0;
  height = 0;
  position = null;
  width = lineWidth;
  constructor(x, y, height, position) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.position = position;
  }

  updateAndCheckIfShouldBeRemoved() {
    this.y += lineSpeed;
    return this.y > canvasHeight + this.height - pressHeight - dotWidth / 2;
  }

  shouldBePressed() {
    return (this.y >= (canvasHeight - pressHeight - dotWidth / 2 + missTolerance / 2));
  }

  isPressed() {
    return keyDown[this.position];
  }

  draw() {
    const shouldBePressed = this.shouldBePressed();
    let col = "black";
    if (shouldBePressed && this.isPressed()) {
      ctx.fillStyle = glowColor;
    }
    if (shouldBePressed && !this.isPressed()) {
      lost = true;
      col = 'red';
      drawPressDots(this.position);
      bttns[this.position].style.color = 'red';
    }

    ctx.fillStyle = col;
    ctx.fillRect(this.x, this.y - this.height, this.width, this.height);

    // small circle on top and bottom
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y - this.height, this.width * 1.2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y, this.width * 1, 0, 2 * Math.PI);
    ctx.fill();
  }
}

// Generate lines
const generateLines = () => {
  let generatedNow = 0;
  let height = getRandomInt(40, 120);
  for (let i = 0; i < pressDotsNumber; i++) {
    if (getRandomInt(0,5 + i * 2) === 0) {
      lines.push(new Line((i+1) * spaceBetweenDots + i * dotWidth + lineWidth / 2 + 2, 0, height, i));
      generatedNow++;
    }
    if (generatedNow === 2) break;
  }
  if (generatedNow === 0) {
    lineCooldown = Math.random() * .3;
    return;
  }
  lineCooldown = Math.random() * .9 + .6;
}

// Drawing press dots

const spaceBetweenDots = (canvasWidth - (pressDotsNumber * dotWidth)) / (pressDotsNumber + 1);
const pressedGlowRadius = 2;
const drawPressDots = (err = null) => {

  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, canvasHeight - pressHeight - dotWidth / 2, canvasWidth, pressHeight + dotWidth);

  for(let i = 0; i < pressDotsNumber; i++) {
    const x = (i+1) * spaceBetweenDots + i * dotWidth + dotWidth / 2;
    const y = canvasHeight - pressHeight - dotWidth / 2;
    if (keyDown[i] || err === i) {
      ctx.fillStyle = glowColor;
      if (err === i) ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(x, y, dotWidth / 2 + pressedGlowRadius, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(x, y, dotWidth / 2, 0, 2 * Math.PI);
    ctx.fillStyle = "black";
    ctx.fill();
  }
}

// Forbidden press

const forbiddenPress = () => {
  let forbidden = false;
  for (let i = 0; i < pressDotsNumber; i++) {
    if (!keyDown[i] || safeKey[i]) continue;
    forbidden = i;
    const linesToCheck = lines.filter(line => line.position === i);
    if (linesToCheck.length === 0) continue;
    for (let j = 0; j < linesToCheck.length; j++) {
      const l = linesToCheck[j];
      const checkY = canvasHeight - pressHeight - dotWidth / 2;
      if (checkY - missTolerance <= l.y) return false; 
    }
  }
  return forbidden;
}

// Dialog loop
let dialogDone = false;
const dialogLoop = () => {
  spacePressed = false;
  const rn = dialog[stage][message];
  if (rn === undefined) { dialogDone = true; return; };
  character.src = baseSpritePath + sprites[(typeof rn.sprite === "function" ? rn.sprite() : rn.sprite)];
  writeText(typeof rn.text === "function" ? rn.text() : rn.text);
  message++;
}

const resetDialog = () => {
  message = 0;
  dialogDone = false;
  character.src = baseSpritePath + sprites['idle'];
  writeText("");
}

// Main loop

let mainTimeout = null;
const mainLoop = () => {
  if (text.innerHTML == "") text.style.borderColor = "transparent";
  else text.style.borderColor = "black";

  if (lost || stopped) {
    switch (stage) {

      case Stages.start:
        if (lost) {
          clearTimeout(mainTimeout);
          stage = Stages.retry;
          dialogLoop();
          return;
        }
        if (!dialogDone && textDone && spacePressed) {
          dialogLoop()
        };
        if (dialogDone && spacePressed) {
          stopped = false;
          resetDialog();
          mainTimeout = setTimeout(() => {
            stopped = true;
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            stage = Stages.afterwarmup;
            lines.length = 0;
            resetDialog();
            dialogLoop();
          }, 20 * 1000);
        }
        break;

      case Stages.retry:
        if (spacePressed) {
          dialogDone = true;
          lost = false;
          stopped = true;
          stage = Stages.start;
          lines.length = 0;
        }
        break;

      case Stages.afterwarmup:
        if (lost) {
          stopDance();
          resetDialog();
          clearTimeout(mainTimeout);
          stage = Stages['0to1'];
          dialogLoop();
          lost = false;
          stopped = true;
          return;
        }
        if (spacePressed && !dialogDone && textDone) {
          dialogLoop();
        }
        if (dialogDone && spacePressed) {
          resetDialog();
          stopped = false;
          dance();
          lines.length = 0;
          ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          mainTimeout = setTimeout(() => {
            stage = Stages['1to0'];
            resetDialog();
            stopDance();
            dialogLoop();
            dialogDone = false;
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            lines.length = 0;
            stopped = true;
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          }, getRandomInt(10, 22) * 1000);
        }
        break;

      case Stages['0to1']:
        if (lost) {
          stopDance();
          clearTimeout(mainTimeout);
          stage = Stages['0to2'];
          resetDialog();
          dialogLoop();
          lost = false;
          stopped = true;
          return;
        }
        if (spacePressed && !dialogDone && textDone) {
          dialogLoop();
        }
        if (dialogDone && spacePressed) {
          resetDialog();
          stopped = false;
          dance();
          lines.length = 0;
          ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          mainTimeout = setTimeout(() => {
            stage = Stages['1to1'];
            stopDance();
            resetDialog();
            dialogLoop();
            stopped = true;
            lines.length = 0;
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          }, getRandomInt(9, 17) * 1000);
        }
        break;

      case Stages['0to2']:
        if (lost) {
          stopDance();
          clearTimeout(mainTimeout);
          stage = Stages['lose'];
          dialogLoop();
          resetDialog();
          lost = false;
          stopped = true;
          return;
        }
        if (spacePressed && !dialogDone && textDone) {
          dialogLoop();
        }
        if (dialogDone && spacePressed) {
          resetDialog();
          stopped = false;
          dance();
          lines.length = 0;
          ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          mainTimeout = setTimeout(() => {
            stage = Stages['1to2'];
            stopDance();
            resetDialog();
            dialogLoop();
            stopped = true;
            lines.length = 0;
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          }, getRandomInt(6, 16) * 1000);
        }
        break;

      case Stages['1to0']:
        if (lost) {
          stopDance();
          clearTimeout(mainTimeout);
          stage = Stages['1to1'];
          resetDialog();
          dialogLoop();
          lost = false;
          stopped = true;
          return;
        }
        if (spacePressed && !dialogDone && textDone) {
          dialogLoop();
        }
        if (dialogDone && spacePressed) {
          resetDialog();
          stopped = false;
          dance();
          lines.length = 0;
          ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          mainTimeout = setTimeout(() => {
            stage = Stages['2to0'];
            stopDance();
            resetDialog();
            dialogLoop();
            stopped = true;
            lines.length = 0;
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          }, getRandomInt(12, 30) * 1000);
        }
        break;

      case Stages['1to1']:
        if (lost) {
          stopDance();
          clearTimeout(mainTimeout);
          stage = Stages['1to2'];
          resetDialog();
          dialogLoop();
          lost = false;
          stopped = true;
          return;
        }
        if (spacePressed && !dialogDone && textDone) {
          dialogLoop();
        }
        if (dialogDone && spacePressed) {
          resetDialog();
          stopped = false;
          dance();
          lines.length = 0;
          ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          mainTimeout = setTimeout(() => {
            stage = Stages['2to1'];
            stopDance();
            resetDialog();
            dialogLoop();
            stopped = true;
            lines.length = 0;
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          }, getRandomInt(12, 25) * 1000);
        }
        break;

      case Stages['1to2']:
        if (lost) {
          stopDance();
          clearTimeout(mainTimeout);
          stage = Stages['lose'];
          resetDialog();
          dialogLoop();
          lost = false;
          stopped = true;
          return;
        }
        if (spacePressed && !dialogDone && textDone) {
          dialogLoop();
        }
        if (dialogDone && spacePressed) {
          resetDialog();
          stopped = false;
          dance();
          lines.length = 0;
          ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          mainTimeout = setTimeout(() => {
            stage = Stages['2to2'];
            stopDance();
            resetDialog();
            dialogLoop();
            stopped = true;
            lines.length = 0;
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          }, getRandomInt(10, 24) * 1000);
        }
        break;

      case Stages['2to1']:
        if (lost) {
          stopDance();
          clearTimeout(mainTimeout);
          stage = Stages['2to2'];
          resetDialog();
          dialogLoop();
          lost = false;
          stopped = true;
          return;
        }
        if (spacePressed && !dialogDone && textDone) {
          dialogLoop();
        }
        if (dialogDone && spacePressed) {
          resetDialog();
          stopped = false;
          dance();
          lines.length = 0;
          ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          mainTimeout = setTimeout(() => {
            stage = Stages.win;
            stopDance();
            resetDialog();
            dialogLoop();
            stopped = true;
            lines.length = 0;
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          }, getRandomInt(14, 29) * 1000);
        }
        break;

      case Stages['2to2']:
        if (lost) {
          stopDance();
          clearTimeout(mainTimeout);
          stage = Stages.lose;
          resetDialog();
          dialogLoop();
          lost = false;
          stopped = true;
          return;
        }
        if (spacePressed && !dialogDone && textDone) {
          dialogLoop();
        }
        if (dialogDone && spacePressed) {
          resetDialog();
          stopped = false;
          dance();
          lines.length = 0;
          ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          mainTimeout = setTimeout(() => {
            stage = Stages.win;
            stopDance();
            resetDialog();
            dialogLoop();
            stopped = true;
            lines.length = 0;
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          }, getRandomInt(15, 30) * 1000);
        }
        break;

      case Stages['2to0']:
        if (lost) {
          stopDance();
          clearTimeout(mainTimeout);
          stage = Stages['2to1'];
          resetDialog();
          dialogLoop();
          lost = false;
          stopped = true;
          return;
        }
        if (spacePressed && !dialogDone && textDone) {
          dialogLoop();
        }
        if (dialogDone && spacePressed) {
          resetDialog();
          stopped = false;
          dance();
          lines.length = 0;
          ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          mainTimeout = setTimeout(() => {
            stage = Stages.win;
            stopDance();
            resetDialog();
            dialogLoop();
            stopped = true;
            lines.length = 0;
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          }, getRandomInt(18, 28) * 1000);
        }
        break;

        case Stages.lose:
          if (spacePressed && !dialogDone && textDone) {
            dialogLoop();
          }
          if (dialogDone) hideHint();
        break;

      case Stages.win:
        if (spacePressed && !dialogDone && textDone) {
          dialogLoop();
        }
        if (dialogDone) hideHint();
        break;

    }
    drawPressDots();
    return;
  }
  buttonGlow();
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  lineCooldown -= 1 / fps;
  if (lineCooldown <= 0) generateLines();
  lines.forEach((line, index) => {
    if (line.updateAndCheckIfShouldBeRemoved()) {
      secureKey(line.position);
      lines.splice(index, 1);
    } else {
      line.draw();
    }
  });
  drawPressDots();
  const fp = forbiddenPress();
  if (fp !== false) {
    lost = true;
    drawPressDots(fp);
    bttns[fp].style.color = 'red';
  }
  t += fps;
}

setInterval(mainLoop, 1000 / fps);
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// for phones if tapped
document.addEventListener("touchstart", () => {
  spacePressed = true;
}, false);