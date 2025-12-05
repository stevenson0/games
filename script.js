class ShadowMirrorMaze {
  constructor() {
    this.levels = this.createLevels();
    this.currentLevel = 0;

    this.gridCols = 10;
    this.gridRows = 10;

    this.keys = {};
    this.keyTimestamps = {};
    this.keyRepeatDelay = 140;
    this.lastKeyPressed = null;
    this.gameState = "start"; // start, playing, paused, complete, finished, over
    this.hasMoved = false;

    // DOM refs
    this.leftGrid = null;
    this.rightGrid = null;
    this.leftPlayer = null;
    this.rightPlayer = null;
    this.leftExit = null;
    this.rightExit = null;
    this.particlesContainer = null;
    this.gameWorld = null;
    this.levelCounter = null;
    this.restartButton = null;
    this.pauseButton = null;

    this.timerContainer = null;
    this.timerLabel = null;
    this.starDisplay = null;

    this.startScreen = null;
    this.playButton = null;
    this.levelCompleteScreen = null;
    this.nextLevelButton = null;
    this.gameCompleteScreen = null;
    this.homeButton = null;
    this.gameOverScreen = null;
    this.retryButton = null;
    this.gameOverHomeButton = null;
    this.resultStars = null;
    this.controlsOverlay = null;

    // menus
    this.levelSelectScreen = null;
    this.levelGrid = null;
    this.backToMenuBtn = null;
    this.levelSelectOpenBtn = null;

    this.pauseMenu = null;
    this.resumeBtn = null;
    this.pauseRestartBtn = null;
    this.pauseLevelsBtn = null;
    this.pauseSettingsBtn = null;
    this.pauseHomeBtn = null;

    this.settingsScreen = null;
    this.settingsBackBtn = null;
    this.volumeSlider = null;
    this.settingsMusicToggle = null;
    this.settingsSfxToggle = null;

    // audio toggles in start screen
    this.musicToggle = null;
    this.sfxToggle = null;

    this.leftTiles = [];
    this.rightTiles = [];

    // audio state
    this.musicEnabled = true;
    this.sfxEnabled = true;
    this.masterVolume = 0.8;

    this.menuMusic = null;
    this.exitSfxSrc = null;
    this.leftOnExit = false;
    this.rightOnExit = false;

    // progress
    this.highestUnlockedLevel = 1; // level id, not index

    // timer
    this.timerActive = false;
    this.levelDuration = 120; // seconds (2 minutes)
    this.timeRemaining = 0;
    this.timerIntervalId = null;
    this.currentStars = 3;

    this.initializeGame();
    this.initializeAudio();
    this.loadProgress();

    this.setupEventListeners();
    this.showStartScreen();
    this.gameLoop();
  }

  /* ============================================
   LEVEL DEFINITIONS (20 levels)
  ============================================ */
  createLevels() {
    return [
      // =========================================================================
      // PHASE 1: MIRROR DISCOVERY (1-5)
      // Symmetric to asymmetric; build intuition without pressure
      // =========================================================================
      {
        id: 1,
        difficulty: "Intro",
        grid: [
          "##########",
          "#P     E#",
          "#        #",
          "#        #",
          "#        #",
          "#        #",
          "#        #",
          "#        #",
          "#E      M#",
          "##########"
        ]
      }, // Pure mirror walk
      {
        id: 2,
        difficulty: "Intro",
        grid: [
          "##########",
          "#P  ##  E#",
          "#   ##   #",
          "#        #",
          "#        #",
          "#        #",
          "#   ##   #",
          "#E  ##  M#",
          "##########"
        ]
      }, // First dodge
      {
        id: 3,
        difficulty: "Easy",
        grid: [
          "##########",
          "#P      E#",
          "####   ###",
          "#      # #",
          "#        #",
          "###   ####",
          "#      # #",
          "#        #",
          "#E      M#",
          "##########"
        ]
      }, // Park P right to free M left
      {
        id: 4,
        difficulty: "Easy",
        grid: [
          "##########",
          "#P#     E#",
          "#  #   # #",
          "#  ##    #",
          "#        #",
          "#   ##   #",
          "#  #  #  #",
          "#E     #M#",
          "##########"
        ]
      }, // Offset forces swap priority
      {
        id: 5,
        difficulty: "Easy",
        grid: [
          "##########",
          "#P####  E#",
          "#E     # #",
          "# ##   # #",
          "#  #     #",
          "# #   ## #",
          "# ### #  #",
          "####M    #",
          "##########"
        ]
      }, // Wind P first, loop M

      // =========================================================================
      // PHASE 2: PARKING PUZZLES (6-10)
      // Tight spaces; think "where to stash the other"
      // =========================================================================
      {
        id: 6,
        difficulty: "Medium",
        grid: [
          "##### ####",
          "#P       E",
          "# ####### ",
          "# #     # ",
          "# #     # ",
          "# #     # ",
          "# ####### ",
          "#M       E",
          "##### ####"
        ]
      }, // Classic parking bay
      {
        id: 7,
        difficulty: "Medium",
        grid: [
          "##########",
          "#P#     E#",
          "# ##  ## #",
          "#  #  #  #",
          "# ### ## #",
          "#  #      ",
          "# ##  ## #",
          "#E     #M#",
          "##########"
        ]
      }, // Double park alcoves
      {
        id: 8,
        difficulty: "Medium",
        grid: [
          "##########",
          "#P  ####E#",
          "#   #    #",
          "#  ## ###",
          "#   #    #",
          "# ###  # #",
          "#      ###",
          "#M####  E#",
          "##########"
        ]
      }, // Snake with park mid-way
      {
        id: 9,
        difficulty: "Medium",
        grid: [
          "##########",
          "#P#####E #",
          "#      # #",
          "# # #  # #",
          "# ## #   #",
          "# #  ####",
          "# #### # #",
          "#M     E #",
          "##########"
        ]
      }, // Backtrack park
      {
        id: 10,
        difficulty: "Hard",
        grid: [
          "##########",
          "#P# # # E#",
          "# #   #  #",
          "#  ## # ##",
          "# ###    #",
          "#     # # ",
          "# ## #  # ",
          "#E # #  M#",
          "##########"
        ]
      }, // Interlocking parks

      // =========================================================================
      // PHASE 3: BUTTON COORDINATION (11-15)
      // Buttons on one side unlock other's path
      // =========================================================================
      {
        id: 11,
        difficulty: "Medium",
        grid: [
          "##########",
          "#P B  D E#",
          "#### # ###",
          "#   #    #",
          "# # D#   #",
          "#   #  # #",
          "# ### #  #",
          "#    #   #",
          "#M    E  #",
          "##########"
        ],
        buttons: [{ x: 3, y: 1, opens: "d11" }],
        doors: [{ id: "d11", x: 6, y: 1 }, { id: "d11", x: 4, y: 4 }]
      },
      {
        id: 12,
        difficulty: "Medium",
        grid: [
          "##########",
          "#P    B E#",
          "# ####D###",
          "#  #    # ",
          "# ###   # ",
          "#   # # D#",
          "# ##### # ",
          "#   #    #",
          "#E     M #",
          "##########"
        ],
        buttons: [{ x: 6, y: 1, opens: "d12" }],
        doors: [{ id: "d12", x: 6, y: 2 }, { id: "d12", x: 8, y: 5 }]
      },
      {
        id: 13,
        difficulty: "Hard",
        grid: [
          "##########",
          "#P B # DE#", // Fixed length to 10
          "# # #  ## ",
          "#   #    #",
          "# # D # B#",
          "#   # # # ",
          "# ### #   #",
          "#    #   M",
          "#E      # #",
          "##########"
        ],
        buttons: [{ x: 3, y: 1, opens: "d13" }, { x: 8, y: 4, opens: "d13" }],
        doors: [{ id: "d13", x: 7, y: 1 }, { id: "d13", x: 4, y: 4 }]
      },
      {
        id: 14,
        difficulty: "Hard",
        grid: [
          "##########",
          "#P####B#E#",
          "#   # #  #",
          "# ###D# ##",
          "#  #  #   ",
          "# ## #D# #",
          "# ###  #  #",
          "#   #     ",
          "#M      # #",
          "##########"
        ],
        buttons: [{ x: 6, y: 1, opens: "cross14" }],
        doors: [{ id: "cross14", x: 5, y: 3 }, { id: "cross14", x: 6, y: 5 }]
      },
      {
        id: 15,
        difficulty: "Hard",
        grid: [
          "##########",
          "#P B###DE#", // Fixed length to 10
          "#  # # # #",
          "# ##D  ###",
          "#   #B   #",
          "# ### #  #",
          "#  # #   #",
          "# ####   #",
          "#M     E #",
          "##########"
        ],
        buttons: [{ x: 3, y: 1, opens: "pair15" }, { x: 5, y: 4, opens: "pair15" }],
        doors: [{ id: "pair15", x: 7, y: 1 }, { id: "pair15", x: 4, y: 3 }]
      },

      // =========================================================================
      // PHASE 4: SEQUENCE MASTERY (16-20)
      // Multi-step: park-press-unpark-swap; fake buttons/decoys
      // =========================================================================
      {
        id: 16,
        difficulty: "Very Hard",
        grid: [
          "##########",
          "#PBB###DE#",
          "#  # #   #",
          "# ## #B ##",
          "#   D#   #",
          "# ###D#B #",
          "#  # #   #",
          "# ####M# #",
          "#E     # #",
          "##########"
        ],
        buttons: [{ x: 2, y: 1, opens: "seq1" }, { x: 3, y: 1, opens: "seq2" }, { x: 6, y: 3, opens: "seq1" }],
        doors: [{ id: "seq1", x: 7, y: 1 }, { id: "seq2", x: 4, y: 4 }]
      },
      {
        id: 17,
        difficulty: "Expert",
        grid: [
          "##########",
          "#P B#D#BE#",
          "### # ### ",
          "#   D#   #",
          "# #B#D# ##",
          "#   # #  #",
          "# ## #D# B",
          "#    #   #",
          "#M E  #  #",
          "##########"
        ],
        buttons: [{ x: 3, y: 1, opens: "chain17" }, { x: 7, y: 1, opens: "chain17" }, { x: 9, y: 6, opens: "chain17" }],
        doors: [{ id: "chain17", x: 5, y: 1 }, { id: "chain17", x: 4, y: 3 }, { id: "chain17", x: 6, y: 6 }]
      },
      {
        id: 18,
        difficulty: "Expert",
        grid: [
          "##########",
          "#PB#D####E#",
          "## # #B # ",
          "# D# #  # ",
          "# #B#D# ##",
          "# ### # B#",
          "#  #D#   #",
          "# ## #   #",
          "#M  E B  #",
          "##########"
        ],
        buttons: [{ x: 1, y: 1, opens: "multi18" }, { x: 6, y: 2, opens: "multi18" }],
        doors: [{ id: "multi18", x: 4, y: 1 }, { id: "multi18", x: 2, y: 3 }, { id: "multi18", x: 4, y: 6 }]
      },
      {
        id: 19,
        difficulty: "Master",
        grid: [
          "##########",
          "#P B D#BE#", // Fixed length to 10
          "###D# ### ",
          "#   #B # #",
          "# #D##B  #",
          "#B# #D# ##",
          "# ## #  B#",
          "# D#    # ",
          "#M E#B  ##",
          "##########"
        ],
        buttons: [{ x: 3, y: 1, opens: "master1" }, { x: 7, y: 1, opens: "master2" }, { x: 8, y: 6, opens: "master1" }],
        doors: [{ id: "master1", x: 5, y: 1 }, { id: "master2", x: 3, y: 2 }, { id: "master1", x: 6, y: 5 }]
      },
      {
        id: 20,
        difficulty: "Grandmaster",
        grid: [
          "##########",
          "#PB#D B#E#", // Fixed length to 10
          "##D# # ## ",
          "# B#D B # ",
          "# #B D# B#",
          "#D# B#D B#",
          "# B#D#B # ",
          "# ##D# ## ",
          "#M E#D B# ",
          "##########"
        ],
        buttons: [{ x: 2, y: 1, opens: "final1" }, { x: 6, y: 1, opens: "final2" }, { x: 2, y: 3, opens: "final1" }],
        doors: [{ id: "final1", x: 4, y: 1 }, { id: "final2", x: 2, y: 2 }, { id: "final1", x: 5, y: 4 }, { id: "final2", x: 4, y: 8 }]
      }
    ];
  }


  /* ============================================
     INITIALIZE DOM
  ============================================ */
  initializeGame() {
    this.leftGrid = document.getElementById("leftGrid");
    this.rightGrid = document.getElementById("rightGrid");
    this.leftPlayer = document.getElementById("leftPlayer");
    this.rightPlayer = document.getElementById("rightPlayer");
    this.leftExit = document.getElementById("leftExit");
    this.rightExit = document.getElementById("rightExit");
    this.levelCounter = document.getElementById("levelCounter");
    this.restartButton = document.getElementById("restartButton");
    this.pauseButton = document.getElementById("pauseButton");
    this.particlesContainer = document.getElementById("particlesContainer");
    this.gameWorld = document.getElementById("gameWorld");

    this.timerContainer = document.getElementById("timerContainer");
    this.timerLabel = document.getElementById("timerLabel");
    this.starDisplay = document.getElementById("starDisplay");

    this.startScreen = document.getElementById("startScreen");
    this.playButton = document.getElementById("playButton");
    this.levelCompleteScreen = document.getElementById("levelCompleteScreen");
    this.nextLevelButton = document.getElementById("nextLevelButton");
    this.gameCompleteScreen = document.getElementById("gameCompleteScreen");
    this.homeButton = document.getElementById("homeButton");
    this.gameOverScreen = document.getElementById("gameOverScreen");
    this.retryButton = document.getElementById("retryButton");
    this.gameOverHomeButton = document.getElementById("gameOverHomeButton");
    this.resultStars = document.getElementById("resultStars");
    this.controlsOverlay = document.getElementById("controlsOverlay");

    // level select
    this.levelSelectScreen = document.getElementById("levelSelectScreen");
    this.levelGrid = document.getElementById("levelGrid");
    this.backToMenuBtn = document.getElementById("backToMenu");
    this.levelSelectOpenBtn = document.getElementById("levelSelectOpen");

    // pause menu
    this.pauseMenu = document.getElementById("pauseMenu");
    this.resumeBtn = document.getElementById("resumeBtn");
    this.pauseRestartBtn = document.getElementById("pauseRestartBtn");
    this.pauseLevelsBtn = document.getElementById("pauseLevelsBtn");
    this.pauseSettingsBtn = document.getElementById("pauseSettingsBtn");
    this.pauseHomeBtn = document.getElementById("pauseHomeBtn");

    // settings
    this.settingsScreen = document.getElementById("settingsScreen");
    this.settingsBackBtn = document.getElementById("settingsBackBtn");
    this.volumeSlider = document.getElementById("volumeSlider");
    this.settingsMusicToggle = document.getElementById("settingsMusicToggle");
    this.settingsSfxToggle = document.getElementById("settingsSfxToggle");

    // audio toggles
    this.musicToggle = document.getElementById("musicToggle");
    this.sfxToggle = document.getElementById("sfxToggle");

    // grid css
    this.leftGrid.style.gridTemplateColumns = `repeat(${this.gridCols}, 1fr)`;
    this.leftGrid.style.gridTemplateRows = `repeat(${this.gridRows}, 1fr)`;
    this.rightGrid.style.gridTemplateColumns = `repeat(${this.gridCols}, 1fr)`;
    this.rightGrid.style.gridTemplateRows = `repeat(${this.gridRows}, 1fr)`;
  }

  /* ============================================
     AUDIO INITIALIZATION
  ============================================ */
  initializeAudio() {
    const musicStored = localStorage.getItem("smm_musicEnabled");
    const sfxStored = localStorage.getItem("smm_sfxEnabled");
    const volStored = localStorage.getItem("smm_masterVolume");

    this.musicEnabled = musicStored !== null ? musicStored === "true" : true;
    this.sfxEnabled = sfxStored !== null ? sfxStored === "true" : true;
    this.masterVolume = volStored !== null ? parseFloat(volStored) : 0.8;

    if (this.volumeSlider) {
      this.volumeSlider.value = this.masterVolume.toString();
    }

    this.menuMusic = new Audio("assets/audio/cyberpunk-132336.mp3");
    this.menuMusic.loop = true;
    this.applyVolumeToMusic();

    this.exitSfxSrc = "assets/audio/going-to-the-next-level-114480.mp3";
    this.stepSfxSrc = "assets/audio/bubblepop.mp3";

    this.updateAudioUI();
    this.setupAutoplayHandler();
  }

  setupAutoplayHandler() {
    const handler = () => {
      if (this.musicEnabled && this.gameState === "start" && this.menuMusic && this.menuMusic.paused) {
        this.playMenuMusic();
      }
      document.removeEventListener("click", handler);
      document.removeEventListener("keydown", handler);
    };
    document.addEventListener("click", handler);
    document.addEventListener("keydown", handler);
  }

  applyVolumeToMusic() {
    if (this.menuMusic) {
      this.menuMusic.volume = this.masterVolume * 0.1;
    }
  }

  applyVolumeToSfx(base = 0.8) {
    return base * this.masterVolume;
  }

  updateAudioUI() {
    if (this.musicToggle) {
      this.musicToggle.textContent = `Music: ${this.musicEnabled ? "ON" : "OFF"}`;
      this.musicToggle.classList.toggle("off", !this.musicEnabled);
    }
    if (this.sfxToggle) {
      this.sfxToggle.textContent = `SFX: ${this.sfxEnabled ? "ON" : "OFF"}`;
      this.sfxToggle.classList.toggle("off", !this.sfxEnabled);
    }

    if (this.settingsMusicToggle) {
      this.settingsMusicToggle.textContent = `Music: ${this.musicEnabled ? "ON" : "OFF"}`;
      this.settingsMusicToggle.classList.toggle("off", !this.musicEnabled);
    }
    if (this.settingsSfxToggle) {
      this.settingsSfxToggle.textContent = `SFX: ${this.sfxEnabled ? "ON" : "OFF"}`;
      this.settingsSfxToggle.classList.toggle("off", !this.sfxEnabled);
    }

    this.applyVolumeToMusic();
  }

  playMenuMusic() {
    if (!this.musicEnabled || !this.menuMusic) return;
    this.menuMusic.currentTime = 0;
    this.menuMusic.play().catch(() => { });
  }

  stopMenuMusic() {
    if (this.menuMusic) {
      this.menuMusic.pause();
    }
  }

  updateMenuMusicState() {
    if (this.gameState === "start" && this.musicEnabled) {
      this.playMenuMusic();
    } else {
      this.stopMenuMusic();
    }
  }

  playExitSfx() {
    if (!this.sfxEnabled || !this.exitSfxSrc) return;
    const sfx = new Audio(this.exitSfxSrc);
    sfx.volume = this.applyVolumeToSfx(0.1);
    sfx.play().catch(() => { });
  }

  playStepSfx() {
    if (!this.sfxEnabled || !this.stepSfxSrc) return;
    // Clone or new Audio to allow overlapping sounds for fast movement
    const sfx = new Audio(this.stepSfxSrc);
    // slightly lower volume for repetitive steps
    sfx.volume = this.applyVolumeToSfx(0.1);
    sfx.play().catch(() => { });
  }

  /* ============================================
     PROGRESS LOAD / SAVE
  ============================================ */
  loadProgress() {
    const storedLevel = localStorage.getItem("smm_highestLevel");
    if (storedLevel) {
      const n = parseInt(storedLevel, 10);
      if (!Number.isNaN(n)) {
        this.highestUnlockedLevel = Math.max(1, Math.min(n, this.levels.length));
      }
    }
  }

  saveProgress() {
    localStorage.setItem("smm_highestLevel", String(this.highestUnlockedLevel));
  }

  unlockNextLevel() {
    const currId = this.levels[this.currentLevel].id;
    if (currId >= this.highestUnlockedLevel && currId < this.levels.length) {
      this.highestUnlockedLevel = currId + 1;
      this.saveProgress();
    }
  }

  /* ============================================
     TIMER
  ============================================ */
  startTimerForLevel(levelId) {
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }

    // Levels 1–2: no timer (tutorial)
    if (levelId <= 2) {
      this.timerActive = false;
      this.timeRemaining = 0;
      if (this.timerLabel) this.timerLabel.textContent = "--:--";
      if (this.starDisplay) this.starDisplay.textContent = "";
      return;
    }

    this.timerActive = true;
    this.timeRemaining = this.levelDuration;
    this.updateTimerUI();

    this.timerIntervalId = setInterval(() => {
      if (this.gameState !== "playing") return;

      this.timeRemaining -= 1;
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.updateTimerUI();
        clearInterval(this.timerIntervalId);
        this.timerIntervalId = null;
        this.onTimeOut();
      } else {
        this.updateTimerUI();
      }
    }, 1000);
  }

  updateTimerUI() {
    if (this.timerLabel) {
      const m = Math.floor(this.timeRemaining / 60);
      const s = this.timeRemaining % 60;
      this.timerLabel.textContent = `${m.toString().padStart(2, "0")}:${s
        .toString()
        .padStart(2, "0")}`;
    }

    if (!this.starDisplay) return;

    if (!this.timerActive) {
      this.starDisplay.textContent = "";
      return;
    }

    // star thresholds based on remaining time out of 120
    let stars = 1;
    if (this.timeRemaining > 90) stars = 3; // finished extremely fast
    else if (this.timeRemaining > 60) stars = 2; // fast
    else stars = 1; // slow but within time

    this.currentStars = stars;
    const starStr = stars === 3 ? "★★★" : stars === 2 ? "★★☆" : "★☆☆";
    this.starDisplay.textContent = starStr;
  }

  onTimeOut() {
    // Only relevant from level 3 onwards
    if (!this.timerActive) return;

    this.gameState = "over";
    this.keys = {};

    this.pauseMenu.classList.add("hidden");
    this.levelCompleteScreen.classList.add("hidden");

    this.gameOverScreen.classList.remove("hidden");
  }

  /* ============================================
     EVENT LISTENERS
  ============================================ */
  setupEventListeners() {
    const movementKeys = [
      "w", "a", "s", "d",
      "arrowup", "arrowleft", "arrowdown", "arrowright"
    ];


    document.addEventListener("keydown", (e) => {
      const key = (e.key || "").toLowerCase();
      if (!movementKeys.includes(key)) return;
      if (this.gameState !== "playing") return;

      e.preventDefault();
      this.keys[key] = true;
      this.lastKeyPressed = key;

      if (!this.keyTimestamps[key]) this.keyTimestamps[key] = 0;

      if (!this.hasMoved) {
        this.controlsOverlay.classList.add("fade-out");
        this.hasMoved = true;
      }
    });

    document.addEventListener("keyup", (e) => {
      const key = (e.key || "").toLowerCase();
      if (movementKeys.includes(key)) {
        this.keys[key] = false;
      }
    });

    // restart from HUD
    this.restartButton.addEventListener("click", () => {
      if (this.gameState !== "playing") return;
      this.resetLevelWithFlash();
    });

    // pause button
    this.pauseButton.addEventListener("click", () => {
      if (this.gameState !== "playing") return;
      this.openPauseMenu();
    });

    // main menu buttons
    this.playButton.addEventListener("click", () => this.startGame());
    this.nextLevelButton.addEventListener("click", () => this.nextLevel());
    this.homeButton.addEventListener("click", () => this.showStartScreen());

    // game over buttons
    this.retryButton.addEventListener("click", () => {
      this.gameOverScreen.classList.add("hidden");
      this.resetLevelWithFlash();
    });

    this.gameOverHomeButton.addEventListener("click", () => {
      this.gameOverScreen.classList.add("hidden");
      this.showStartScreen();
    });

    // level select open from start
    this.levelSelectOpenBtn.addEventListener("click", () => {
      this.openLevelSelectFromMenu();
    });

    this.backToMenuBtn.addEventListener("click", () => {
      this.closeLevelSelectToMenu();
    });

    // pause menu buttons
    this.resumeBtn.addEventListener("click", () => this.closePauseMenu());
    this.pauseRestartBtn.addEventListener("click", () => {
      this.pauseMenu.classList.add("hidden");
      this.resetLevelWithFlash();
    });
    this.pauseLevelsBtn.addEventListener("click", () => {
      this.pauseMenu.classList.add("hidden");
      this.openLevelSelectFromPause();
    });
    this.pauseSettingsBtn.addEventListener("click", () => {
      this.pauseMenu.classList.add("hidden");
      this.openSettings();
    });
    this.pauseHomeBtn.addEventListener("click", () => {
      this.closePauseMenu();
      this.showStartScreen();
    });

    // settings screen
    this.settingsBackBtn.addEventListener("click", () => {
      this.settingsScreen.classList.add("hidden");
      // always return to pause menu (settings only opened from pause)
      this.pauseMenu.classList.remove("hidden");
    });

    if (this.volumeSlider) {
      this.volumeSlider.addEventListener("input", () => {
        this.masterVolume = parseFloat(this.volumeSlider.value);
        localStorage.setItem("smm_masterVolume", String(this.masterVolume));
        this.updateAudioUI();
      });
    }

    // audio toggles
    if (this.musicToggle) {
      this.musicToggle.addEventListener("click", () => {
        this.musicEnabled = !this.musicEnabled;
        localStorage.setItem("smm_musicEnabled", this.musicEnabled);
        this.updateAudioUI();
        this.updateMenuMusicState();
      });
    }
    if (this.sfxToggle) {
      this.sfxToggle.addEventListener("click", () => {
        this.sfxEnabled = !this.sfxEnabled;
        localStorage.setItem("smm_sfxEnabled", this.sfxEnabled);
        this.updateAudioUI();
      });
    }

    if (this.settingsMusicToggle) {
      this.settingsMusicToggle.addEventListener("click", () => {
        this.musicEnabled = !this.musicEnabled;
        localStorage.setItem("smm_musicEnabled", this.musicEnabled);
        this.updateAudioUI();
        this.updateMenuMusicState();
      });
    }
    if (this.settingsSfxToggle) {
      this.settingsSfxToggle.addEventListener("click", () => {
        this.sfxEnabled = !this.sfxEnabled;
        localStorage.setItem("smm_sfxEnabled", this.sfxEnabled);
        this.updateAudioUI();
      });
    }
    /* ================= MOBILE D-PAD ================= */

    const dpad = {
      up: document.getElementById("dpad-up"),
      down: document.getElementById("dpad-down"),
      left: document.getElementById("dpad-left"),
      right: document.getElementById("dpad-right"),
      container: document.getElementById("dpadContainer")
    };

    // show D-pad on mobile only
    if (window.innerWidth < 769) {
      dpad.container.classList.add("active");
    }

    const press = (dir) => {
      if (this.gameState !== "playing") return;

      switch (dir) {
        case "up": this.keys["w"] = true; this.lastKeyPressed = "w"; break;
        case "down": this.keys["s"] = true; this.lastKeyPressed = "s"; break;
        case "left": this.keys["a"] = true; this.lastKeyPressed = "a"; break;
        case "right": this.keys["d"] = true; this.lastKeyPressed = "d"; break;
      }

      if (!this.hasMoved) {
        this.controlsOverlay.classList.add("fade-out");
        this.hasMoved = true;
      }
    };

    const release = (dir) => {
      switch (dir) {
        case "up": this.keys["w"] = false; break;
        case "down": this.keys["s"] = false; break;
        case "left": this.keys["a"] = false; break;
        case "right": this.keys["d"] = false; break;
      }
    };

    // bind touch events
    ["up", "down", "left", "right"].forEach((dir) => {
      const el = dpad[dir];
      el.addEventListener("touchstart", (e) => {
        e.preventDefault();
        press(dir);
      });

      el.addEventListener("touchend", () => {
        release(dir);
      });

      el.addEventListener("touchcancel", () => {
        release(dir);
      });
    });

  }

  /* ============================================
     START / MENU FLOW
  ============================================ */
  showStartScreen() {
    this.gameState = "start";
    this.startScreen.classList.remove("hidden");
    this.levelSelectScreen.classList.add("hidden");
    this.pauseMenu.classList.add("hidden");
    this.settingsScreen.classList.add("hidden");
    this.levelCompleteScreen.classList.add("hidden");
    this.gameCompleteScreen.classList.add("hidden");
    this.gameOverScreen.classList.add("hidden");
    this.controlsOverlay.classList.remove("fade-out");
    this.hasMoved = false;

    this.keys = {};
    this.updateAudioUI();
    this.updateMenuMusicState();

    // stop level timer if any
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
    this.timerActive = false;
    if (this.timerLabel) this.timerLabel.textContent = "--:--";
    if (this.starDisplay) this.starDisplay.textContent = "";
  }

  startGame() {
    this.stopMenuMusic();

    this.startScreen.classList.add("hidden");
    this.levelSelectScreen.classList.add("hidden");
    this.pauseMenu.classList.add("hidden");
    this.settingsScreen.classList.add("hidden");
    this.gameOverScreen.classList.add("hidden");

    this.currentLevel = 0;
    this.gameState = "playing";
    this.loadLevel(0);

    this.hasMoved = false;
    this.controlsOverlay.classList.remove("fade-out");
  }

  openPauseMenu() {
    this.gameState = "paused";
    this.pauseMenu.classList.remove("hidden");
  }

  closePauseMenu() {
    this.pauseMenu.classList.add("hidden");
    // resume gameplay if not finished
    if (this.gameState !== "finished" && this.gameState !== "complete" && this.gameState !== "over") {
      this.gameState = "playing";
    }
  }

  openSettings() {
    this.settingsScreen.classList.remove("hidden");
    this.updateAudioUI();
  }

  openLevelSelectFromMenu() {
    this.startScreen.classList.add("hidden");
    this.levelSelectScreen.classList.remove("hidden");
    this.buildLevelGrid();
  }

  openLevelSelectFromPause() {
    this.gameState = "start"; // treat as menu
    this.levelSelectScreen.classList.remove("hidden");
    this.buildLevelGrid();
  }

  closeLevelSelectToMenu() {
    this.levelSelectScreen.classList.add("hidden");
    this.showStartScreen();
  }

  /* ============================================
     RESET FLASH
  ============================================ */
  resetLevelWithFlash() {
    this.gameWorld.classList.add("reset-flash");
    setTimeout(() => {
      this.loadLevel(this.currentLevel);
      this.gameWorld.classList.remove("reset-flash");
    }, 150);
  }

  /* ============================================
     LEVEL SELECT GRID
  ============================================ */
  buildLevelGrid() {
    this.levelGrid.innerHTML = "";
    const total = this.levels.length;

    for (let i = 0; i < total; i++) {
      const level = this.levels[i];
      const tile = document.createElement("div");
      tile.className = "level-tile";
      const unlocked = level.id <= this.highestUnlockedLevel;

      if (!unlocked) {
        tile.classList.add("locked");
      }

      const num = document.createElement("div");
      num.className = "level-number";
      num.textContent = level.id;
      tile.appendChild(num);

      if (!unlocked) {
        const lock = document.createElement("img");
        lock.src = "assets/icons/lock-keyhole-minimalistic-svgrepo-com.svg";
        lock.className = "lock-icon";
        tile.appendChild(lock);
      } else {
        tile.addEventListener("click", () => {
          this.startFromLevelIndex(i);
        });
      }

      this.levelGrid.appendChild(tile);
    }
  }

  startFromLevelIndex(index) {
    this.levelSelectScreen.classList.add("hidden");
    this.pauseMenu.classList.add("hidden");
    this.settingsScreen.classList.add("hidden");
    this.startScreen.classList.add("hidden");
    this.gameOverScreen.classList.add("hidden");

    this.currentLevel = index;
    this.gameState = "playing";
    this.loadLevel(index);
    this.hasMoved = false;
    this.controlsOverlay.classList.remove("fade-out");
  }

  nextLevel() {
    this.levelCompleteScreen.classList.add("hidden");

    if (this.currentLevel < this.levels.length - 1) {
      this.loadLevel(++this.currentLevel);
    } else {
      this.gameComplete();
    }
  }

  gameComplete() {
    this.gameState = "finished";
    this.gameCompleteScreen.classList.remove("hidden");
  }

  /* ============================================
     LOAD LEVEL
  ============================================ */
  loadLevel(levelIndex) {
    const level = this.levels[levelIndex];

    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }

    this.levelCounter.textContent = level.id;
    this.gameState = "playing";

    this.leftGrid.innerHTML = "";
    this.rightGrid.innerHTML = "";

    this.leftTiles = [];
    this.rightTiles = [];
    this.keyTimestamps = {};
    this.keys = {};
    this.lastKeyPressed = null;
    this.openDoors = new Set();
    this.leftOnExit = false;
    this.rightOnExit = false;

    this.parseLevel(level);

    this.createParticles(12, this.leftPlayer);
    this.createParticles(12, this.rightPlayer);

    // Set up timer if level >= 3
    this.startTimerForLevel(level.id);

    if (levelIndex === 0) {
      this.controlsOverlay.classList.remove("fade-out");
      this.hasMoved = false;
    }
  }

  /* ============================================
     PARSE LEVEL GRID
  ============================================ */
  parseLevel(level) {
    for (let y = 0; y < this.gridRows; y++) {
      this.leftTiles[y] = [];
      this.rightTiles[y] = [];
      for (let x = 0; x < this.gridCols; x++) {
        const L = document.createElement("div");
        const R = document.createElement("div");

        L.className = "tile";
        R.className = "tile";

        this.leftGrid.appendChild(L);
        this.rightGrid.appendChild(R);

        this.leftTiles[y][x] = L;
        this.rightTiles[y][x] = R;
      }
    }

    let playerPos = null;
    let mirrorPos = null;
    let exit1Pos = null;
    let exit2Pos = null;
    this.buttons = level.buttons || [];
    this.doors = level.doors || [];
    this.walls = [];

    for (let y = 0; y < level.grid.length; y++) {
      for (let x = 0; x < level.grid[y].length; x++) {
        const ch = level.grid[y][x];

        if (ch === "#") {
          this.walls.push({ x, y });
          this.leftTiles[y][x].classList.add("wall");
          this.rightTiles[y][x].classList.add("wall");
        }

        if (ch === "P") playerPos = { x, y };
        if (ch === "M") mirrorPos = { x, y };

        if (ch === "E") {
          if (!exit1Pos) exit1Pos = { x, y };
          else exit2Pos = { x, y };
        }

        if (ch === "B") {
          this.leftTiles[y][x].classList.add("button");
          this.rightTiles[y][x].classList.add("button");
        }

        if (ch === "D") {
          this.leftTiles[y][x].classList.add("door");
          this.rightTiles[y][x].classList.add("door");
        }
      }
    }

    this.buttons.forEach(btn => {
      const L = this.leftTiles[btn.y][btn.x];
      const R = this.rightTiles[btn.y][btn.x];
      L.dataset.opens = btn.opens;
      R.dataset.opens = btn.opens;
      L.classList.add("button");
      R.classList.add("button");
    });

    this.doors.forEach(door => {
      const L = this.leftTiles[door.y][door.x];
      const R = this.rightTiles[door.y][door.x];
      L.dataset.doorId = door.id;
      R.dataset.doorId = door.id;
      L.classList.add("door");
      R.classList.add("door");
    });

    this.playerPos = playerPos;
    this.mirrorPos = mirrorPos;
    this.exit1Pos = exit1Pos;
    this.exit2Pos = exit2Pos;

    this.positionElement(this.leftPlayer, playerPos.x, playerPos.y);
    this.positionElement(this.rightPlayer, mirrorPos.x, mirrorPos.y);
    this.positionElement(this.leftExit, exit1Pos.x, exit1Pos.y);
    this.positionElement(this.rightExit, exit2Pos.x, exit2Pos.y);
  }

  /* ============================================
     POSITIONING
  ============================================ */
  positionElement(el, x, y) {
    const world = el.id.includes("left")
      ? document.getElementById("leftWorld")
      : document.getElementById("rightWorld");

    const rect = world.getBoundingClientRect();

    const tileW = rect.width / this.gridCols;
    const tileH = rect.height / this.gridRows;

    el.style.left = `${x * tileW + tileW / 2 - el.offsetWidth / 2}px`;
    el.style.top = `${y * tileH + tileH / 2 - el.offsetHeight / 2}px`;
  }

  /* ============================================
     GAME LOOP
  ============================================ */
  gameLoop() {
    if (this.gameState === "playing") {
      this.handleInput();
      this.checkButtonPress();
      this.checkWinCondition();
    }
    requestAnimationFrame(() => this.gameLoop());
  }

  /* ============================================
     INPUT
  ============================================ */
  handleInput() {
    let dx = 0, dy = 0;

    if (this.keys["w"] || this.keys["arrowup"]) dy = -1;
    if (this.keys["s"] || this.keys["arrowdown"]) dy = 1;
    if (this.keys["a"] || this.keys["arrowleft"]) dx = -1;
    if (this.keys["d"] || this.keys["arrowright"]) dx = 1;

    if (dx !== 0 && dy !== 0) {
      if (["w", "s", "arrowup", "arrowdown"].includes(this.lastKeyPressed)) dx = 0;
      else dy = 0;
    }

    if (dx === 0 && dy === 0) return;

    const triggerKey = this.lastKeyPressed;
    if (!triggerKey) return;

    const now = performance.now();
    const last = this.keyTimestamps[triggerKey] || 0;

    if (now - last < this.keyRepeatDelay) return;
    this.keyTimestamps[triggerKey] = now;

    this.movePlayer(dx, dy);
  }

  /* ============================================
     MOVEMENT
  ============================================ */
  movePlayer(dx, dy) {
    const newPlayer = { x: this.playerPos.x + dx, y: this.playerPos.y + dy };
    const newMirror = { x: this.mirrorPos.x - dx, y: this.mirrorPos.y - dy };

    let moved = false;

    if (this.canMoveTo(newPlayer)) {
      this.playerPos = newPlayer;
      this.positionElement(this.leftPlayer, newPlayer.x, newPlayer.y);
      this.createParticles(3, this.leftPlayer);
      moved = true;
    }

    if (this.canMoveTo(newMirror)) {
      this.mirrorPos = newMirror;
      this.positionElement(this.rightPlayer, newMirror.x, newMirror.y);
      this.createParticles(3, this.rightPlayer);
      moved = true;
    }

    if (!moved) return;

    this.playStepSfx();
  }

  canMoveTo(p) {
    if (p.x < 0 || p.x >= this.gridCols || p.y < 0 || p.y >= this.gridRows) return false;
    if (this.walls.some(w => w.x === p.x && w.y === p.y)) return false;

    const door = this.doors.find(d => d.x === p.x && d.y === p.y);
    if (door && !this.openDoors.has(door.id)) return false;

    return true;
  }

  /* ============================================
     BUTTONS
  ============================================ */
  checkButtonPress() {
    if (!this.buttons) return;

    this.buttons.forEach(button => {
      const onButton =
        (this.playerPos.x === button.x && this.playerPos.y === button.y) ||
        (this.mirrorPos.x === button.x && this.mirrorPos.y === button.y);

      if (onButton) {
        this.openDoors.add(button.opens);
        document
          .querySelectorAll(`[data-door-id="${button.opens}"]`)
          .forEach(d => d.classList.add("open"));
      }
    });
  }

  /* ============================================
     WIN CONDITION + SFX + PROGRESS
  ============================================ */
  checkWinCondition() {
    const A = this.playerPos;
    const B = this.mirrorPos;

    const atLeftExit = A.x === this.exit1Pos.x && A.y === this.exit1Pos.y;
    const atRightExit = B.x === this.exit2Pos.x && B.y === this.exit2Pos.y;

    if (this.sfxEnabled) {
      if (atLeftExit && !this.leftOnExit) {
        this.playExitSfx();
      }
      if (atRightExit && !this.rightOnExit) {
        this.playExitSfx();
      }
    }
    this.leftOnExit = atLeftExit;
    this.rightOnExit = atRightExit;

    if (atLeftExit && atRightExit) this.levelComplete();
  }

  levelComplete() {
    this.gameState = "complete";
    this.keys = {};
    this.screenShake();

    this.createParticles(30, this.leftExit);
    this.createParticles(30, this.rightExit);

    // stop timer
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }

    // unlock next level
    this.unlockNextLevel();

    // compute stars for result popup
    let stars;
    if (!this.timerActive) {
      stars = 3;
    } else {
      stars = this.currentStars || 1;
    }

    if (this.resultStars) {
      const starStr = stars === 3 ? "★★★" : stars === 2 ? "★★☆" : "★☆☆";
      this.resultStars.textContent = starStr;
    }

    setTimeout(() => {
      this.levelCompleteScreen.classList.remove("hidden");
    }, 500);
  }

  /* ============================================
     EFFECTS
  ============================================ */
  screenShake() {
    this.gameWorld.classList.add("shake");
    setTimeout(() => this.gameWorld.classList.remove("shake"), 400);
  }

  createParticles(count, el) {
    const rect = el.getBoundingClientRect();
    const parentRect = this.particlesContainer.getBoundingClientRect();

    const cx = rect.left + rect.width / 2 - parentRect.left;
    const cy = rect.top + rect.height / 2 - parentRect.top;

    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "particle";

      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 50 + 15;

      p.style.left = `${cx}px`;
      p.style.top = `${cy}px`;
      p.style.setProperty("--tx", `${Math.cos(angle) * dist}px`);
      p.style.setProperty("--ty", `${Math.sin(angle) * dist}px`);

      if (el.id.includes("left"))
        p.style.background = "var(--primary-color)";
      else
        p.style.background = "var(--secondary-color)";

      this.particlesContainer.appendChild(p);
      setTimeout(() => p.remove(), 800);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => new ShadowMirrorMaze());
