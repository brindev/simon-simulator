/*
https://en.wikipedia.org/wiki/Simon_(game)

E (blue, lower right);
C♯ (yellow, lower left);
A (red, upper right).
E (green, upper left, an octave lower than blue);

Original 1978 model - B♭ minor triad:

B♭ (blue, lower right);
D♭ (yellow, lower left);
F (red, upper right).
B♭ (green, upper left, an octave higher than blue);
*/

let gameArr = [];
const color = ["green", "red", "yellow", "blue"];
const notesAmajor = ["E2", "A3", "C#3", "E3", "A1"];
const notesBflatMinor = ["Bb3", "F3", "Db3", "Bb2", "Bb1"];
const NOTE_LENGTH = "16n";
const SPEED_EASY = 1000;
const SPEED_MEDIUM = 500;
const SPEED_HARD = 300;
let gameSpeed = SPEED_MEDIUM;
let soundSelection = "a-major";
let sequenceIndex = 0;
let isPlayerTurn = false;
let aniIntervalID;
let aniCount = null;
let flashPadIndex = null;
let flashAniCount = 0;
let flashAniIntervalID;

const resetGame = () => {
  clearInterval(aniIntervalID);
  aniIntervalID = null;
  sequenceIndex = 0;
  isPlayerTurn = false;
  gameArr = [];
  msgBox.classList.remove("show-msg");
  sequenceIndex = "";
  sequenceCount.textContent = sequenceIndex;
  btnStart.style.color = "var(--black)";
};

const flashPadAni = () => {
  if (flashAniCount <= 17) {
    if (flashAniCount % 2 === 0) {
      animatePad(flashPadIndex, true);
    } else {
      animatePad(flashPadIndex, false);
    }
    flashAniCount++;
  } else {
    clearInterval(flashAniIntervalID);
    flashAniIntervalID = null;
    btnStart.style.color = "var(--black)";
    btnEnd.style.color = "var(--black)";
  }
};

const initFlashPadAni = (index) => {
  flashPadIndex = index;
  flashAniCount = 0;

  if (!flashAniIntervalID) {
    flashAniIntervalID = setInterval(flashPadAni, 300);
  }
};

const gameOver = (index) => {
  isPlayerTurn = false;
  playSound(4);
  msgService("gameover", "GAME OVER");
  btnEnd.style.color = "var(--greyLight)";
  initFlashPadAni(index);
};

const playSound = (index) => {
  if (soundSelection !== "nosound") {
    if (index < 4) {
      const synth = new Tone.Synth().toDestination();

      if (soundSelection === "a-major") {
        synth.triggerAttackRelease(notesAmajor[index], NOTE_LENGTH);
      }

      if (soundSelection === "b-flat-minor") {
        synth.triggerAttackRelease(notesBflatMinor[index], NOTE_LENGTH);
      }

      return;
    }

    // game over
    const osc = new Tone.Oscillator().toDestination();
    // start at "C4"
    osc.frequency.value = "C4";
    // ramp to "C2" over 2 seconds
    osc.frequency.rampTo("C2", 2);
    // start the oscillator for 2 seconds
    osc.start().stop("+3");
  }
};

const animatePad = (index, active) => {
  if (active) {
    padsInner[index].style.backgroundColor = `var(--${color[index]}Active)`;
    padsInner[
      index
    ].style.boxShadow = `-1px 1px 10px 8px var(--${color[index]}Active)`;
  } else {
    padsInner[index].style.backgroundColor = `var(--${color[index]})`;
    padsInner[
      index
    ].style.boxShadow = `-1px 1px 10px 8px var(--${color[index]})`;
  }
};

const renderSequence = () => {
  // re-set previous pad
  if (aniCount > 0) {
    animatePad(gameArr[aniCount - 1], false);
  }

  // stop and clear ani routine
  if (aniCount >= gameArr.length) {
    clearInterval(aniIntervalID);
    aniIntervalID = null;
    sequenceIndex++;
    isPlayerTurn = true;
  } else {
    animatePad(gameArr[aniCount], true);
    playSound(gameArr[aniCount]);
    aniCount++;
  }
};

const initSequence = () => {
  aniCount = 0;

  if (!aniIntervalID) {
    aniIntervalID = setInterval(renderSequence, gameSpeed);
  }
};

const generateRndNum = () => {
  return (randNum = Math.floor(Math.random() * 4));
};

const simonTurn = () => {
  initSequence();
};

const initSimonTurn = () => {
  gameArr.push(generateRndNum());
  const delay = setTimeout(initSequence, 400);
};

const sequenceCount = document.getElementById("sequence-count");

const playerTurn = (index) => {
  const correctChoice = gameArr[sequenceIndex - 1];

  // wrong selection
  if (index !== correctChoice) {
    gameOver(correctChoice);
    return;
  }

  // correct selection
  if (index === correctChoice) {
    playSound(index);

    if (sequenceIndex === gameArr.length) {
      sequenceCount.textContent = sequenceIndex;
      isPlayerTurn = false;
      sequenceIndex = 0;
      initSimonTurn();
    } else {
      sequenceIndex++;
    }
  }
};

const play = () => {
  if (!isPlayerTurn && !flashAniIntervalID) {
    initSimonTurn();
  }
};

const msgBox = document.querySelector(".game-msg");

const msgService = (type, text) => {
  msgBox.textContent = text;

  if (type === "gameover") {
    msgBox.classList.add("show-msg");
  }

  if (type === "ingame") {
    // for future in game messages
    // 1. pause simonTurn
    // 2. display msg with short timer
  }
};

const btnStart = document.getElementById("btnStart");
btnStart.addEventListener("click", async () => {
  if (flashAniIntervalID) return;
  await Tone.start();
  resetGame();
  btnStart.style.color = "var(--greyLight)";
  play();
});

const btnEnd = document.getElementById("btnEnd");
btnEnd.addEventListener("click", () => {
  if (flashAniIntervalID) return;
  resetGame();
});

const pads = document.querySelectorAll(".pad");
const padsInner = document.querySelectorAll(".pad-inner");

pads.forEach((pad, index) => {
  pad.addEventListener("mousedown", (e) => {
    if (isPlayerTurn) {
      animatePad(index, true);
    }
  });
  pad.addEventListener("mouseup", (e) => {
    if (isPlayerTurn) {
      animatePad(index, false);
      playerTurn(index);
    }
  });
});

/* options - speed */

const speedContainer = document.getElementById("speed-selector-container");
const speedPannel = document.querySelector(".speed-panel");
speedContainer.addEventListener("click", (e) => {
  e.preventDefault();

  if (e.target.classList.contains("speed-selector")) {
    speedPannel.classList.toggle("options-open");
  }
});

const speedOptions = document.querySelectorAll(".speed-select");
speedOptions.forEach((option) => {
  option.addEventListener("click", (e) => {
    const speed = e.target.dataset.value;

    if (speed === "easy") gameSpeed = SPEED_EASY;
    if (speed === "medium") gameSpeed = SPEED_MEDIUM;
    if (speed === "hard") gameSpeed = SPEED_HARD;

    document.querySelector(".speed-value").textContent =
      speed.charAt(0).toUpperCase() + speed.slice(1);
    speedPannel.classList.toggle("options-open");
  });
});

const speedSelectContainer = document.querySelector(".speed-option-container");
speedSelectContainer.addEventListener("mouseleave", function () {
  if (speedPannel.classList.contains("options-open"))
    speedPannel.classList.toggle("options-open");
});

/* options - sound */

const soundSelect = document.getElementById("sound-selector-container");
const soundPannel = document.querySelector(".sound-panel");
soundSelect.addEventListener("click", (e) => {
  e.preventDefault();

  if (e.target.classList.contains("sound-selector")) {
    soundPannel.classList.toggle("options-open");
  }
});

const soundOptions = document.querySelectorAll(".sound-select");
soundOptions.forEach((option) => {
  option.addEventListener("click", (e) => {
    let text = "";
    const sound = e.target.dataset.value;
    soundSelection = e.target.dataset.value;

    if (sound === "nosound") text = "None";
    if (sound === "a-major") text = "A maj";
    if (sound === "b-flat-minor") text = "B♭ min";

    document.querySelector(".sound-value").textContent = text;
    soundPannel.classList.toggle("options-open");
  });
});

const soundSelectContainer = document.querySelector(".sound-option-container");
soundSelectContainer.addEventListener("mouseleave", function () {
  if (soundPannel.classList.contains("options-open"))
    soundPannel.classList.toggle("options-open");
});
