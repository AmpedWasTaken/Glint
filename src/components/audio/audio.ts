const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
    }
    .audio-container {
      background: var(--gl-panel);
      border: 1px solid var(--gl-border);
      border-radius: var(--gl-radius);
      padding: var(--gl-space-4);
      display: flex;
      align-items: center;
      gap: var(--gl-space-3);
    }
    .audio-button {
      all: unset;
      cursor: pointer;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--gl-primary);
      color: var(--gl-primary-fg);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all var(--gl-dur-1) var(--gl-ease);
    }
    .audio-button:hover {
      background: var(--gl-primary-hover);
      transform: scale(1.05);
    }
    .audio-button:active {
      transform: scale(0.95);
    }
    .audio-info {
      flex: 1;
      min-width: 0;
    }
    .audio-title {
      font-weight: 600;
      font-size: var(--gl-text-md);
      line-height: var(--gl-line-md);
      margin: 0 0 var(--gl-space-1);
      color: var(--gl-fg);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .audio-artist {
      font-size: var(--gl-text-sm);
      color: var(--gl-muted);
      margin: 0 0 var(--gl-space-2);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .audio-controls {
      display: flex;
      align-items: center;
      gap: var(--gl-space-2);
      width: 100%;
    }
    .audio-progress {
      flex: 1;
      height: 4px;
      background: var(--gl-hover);
      border-radius: 2px;
      position: relative;
      cursor: pointer;
    }
    .audio-progress-bar {
      height: 100%;
      background: var(--gl-primary);
      border-radius: 2px;
      transition: width 0.1s linear;
      width: 0%;
    }
    .audio-time {
      font-size: var(--gl-text-sm);
      color: var(--gl-muted);
      font-variant-numeric: tabular-nums;
      min-width: 80px;
      text-align: right;
    }
    .audio-volume {
      display: flex;
      align-items: center;
      gap: var(--gl-space-2);
    }
    .audio-volume-slider {
      width: 80px;
      height: 4px;
      background: var(--gl-hover);
      border-radius: 2px;
      position: relative;
      cursor: pointer;
    }
    .audio-volume-bar {
      height: 100%;
      background: var(--gl-muted);
      border-radius: 2px;
      width: 100%;
    }
    .audio-volume-button {
      all: unset;
      cursor: pointer;
      padding: var(--gl-space-1);
      color: var(--gl-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color var(--gl-dur-1) var(--gl-ease);
    }
    .audio-volume-button:hover {
      color: var(--gl-fg);
    }
    :host([compact]) .audio-container {
      padding: var(--gl-space-2);
    }
    :host([compact]) .audio-button {
      width: 40px;
      height: 40px;
    }
    :host([compact]) .audio-title,
    :host([compact]) .audio-artist {
      display: none;
    }
  </style>
  <div class="audio-container" part="container">
    <button class="audio-button" part="play-pause" type="button" aria-label="Play/Pause">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z"></path>
      </svg>
    </button>
    <div class="audio-info" part="info">
      <div class="audio-title" part="title">
        <slot name="title">Audio Title</slot>
      </div>
      <div class="audio-artist" part="artist">
        <slot name="artist">Artist Name</slot>
      </div>
      <div class="audio-controls" part="controls">
        <div class="audio-progress" part="progress">
          <div class="audio-progress-bar" part="progress-bar"></div>
        </div>
        <div class="audio-time" part="time">0:00 / 0:00</div>
        <div class="audio-volume" part="volume">
          <button class="audio-volume-button" part="volume-button" type="button" aria-label="Mute/Unmute">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          </button>
          <div class="audio-volume-slider" part="volume-slider">
            <div class="audio-volume-bar" part="volume-bar"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

export class GlAudio extends HTMLElement {
  static tagName = "gl-audio";
  static get observedAttributes() {
    return ["src", "autoplay", "loop", "muted", "volume", "compact"];
  }

  #audio!: HTMLAudioElement;
  #playPauseBtn!: HTMLButtonElement;
  #volumeBtn!: HTMLButtonElement;
  #progressBar!: HTMLElement;
  #progressContainer!: HTMLElement;
  #volumeBar!: HTMLElement;
  #volumeSlider!: HTMLElement;
  #timeDisplay!: HTMLElement;
  #isPlaying = false;
  #isDragging = false;
  #isVolumeDragging = false;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    
    this.#audio = document.createElement("audio");
    this.#playPauseBtn = this.shadowRoot!.querySelector('[part="play-pause"]') as HTMLButtonElement;
    this.#volumeBtn = this.shadowRoot!.querySelector('[part="volume-button"]') as HTMLButtonElement;
    this.#progressBar = this.shadowRoot!.querySelector('[part="progress-bar"]') as HTMLElement;
    this.#progressContainer = this.shadowRoot!.querySelector('[part="progress"]') as HTMLElement;
    this.#volumeBar = this.shadowRoot!.querySelector('[part="volume-bar"]') as HTMLElement;
    this.#volumeSlider = this.shadowRoot!.querySelector('[part="volume-slider"]') as HTMLElement;
    this.#timeDisplay = this.shadowRoot!.querySelector('[part="time"]') as HTMLElement;

    this.#playPauseBtn.addEventListener("click", () => this.#togglePlay());
    this.#volumeBtn.addEventListener("click", () => this.#toggleMute());
    this.#progressContainer.addEventListener("click", (e) => this.#seek(e));
    this.#progressContainer.addEventListener("mousedown", () => { this.#isDragging = true; });
    this.#volumeSlider.addEventListener("click", (e) => this.#setVolume(e));
    this.#volumeSlider.addEventListener("mousedown", () => { this.#isVolumeDragging = true; });
    
    document.addEventListener("mouseup", () => {
      this.#isDragging = false;
      this.#isVolumeDragging = false;
    });
    document.addEventListener("mousemove", (e) => {
      if (this.#isDragging) this.#seek(e);
      if (this.#isVolumeDragging) this.#setVolume(e);
    });

    this.#audio.addEventListener("play", () => {
      this.#isPlaying = true;
      this.#updatePlayButton();
    });
    this.#audio.addEventListener("pause", () => {
      this.#isPlaying = false;
      this.#updatePlayButton();
    });
    this.#audio.addEventListener("timeupdate", () => this.#updateProgress());
    this.#audio.addEventListener("loadedmetadata", () => this.#updateTime());
    this.#audio.addEventListener("volumechange", () => this.#updateVolume());

    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    const src = this.getAttribute("src");
    if (src) {
      this.#audio.src = src;
    }

    this.#audio.autoplay = this.hasAttribute("autoplay");
    this.#audio.loop = this.hasAttribute("loop");
    this.#audio.muted = this.hasAttribute("muted");

    const volume = this.getAttribute("volume");
    if (volume) {
      this.#audio.volume = Math.max(0, Math.min(1, parseFloat(volume)));
    }
  }

  #togglePlay() {
    if (this.#audio.paused) {
      this.#audio.play();
    } else {
      this.#audio.pause();
    }
  }

  #toggleMute() {
    this.#audio.muted = !this.#audio.muted;
    this.#updateVolumeButton();
  }

  #seek(e: MouseEvent) {
    const rect = this.#progressContainer.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    this.#audio.currentTime = percent * this.#audio.duration;
  }

  #setVolume(e: MouseEvent) {
    const rect = this.#volumeSlider.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    this.#audio.volume = Math.max(0, Math.min(1, percent));
  }

  #updateProgress() {
    if (this.#isDragging) return;
    const percent = (this.#audio.currentTime / this.#audio.duration) * 100;
    this.#progressBar.style.width = `${percent}%`;
    this.#updateTime();
  }

  #updateTime() {
    const current = this.#formatTime(this.#audio.currentTime);
    const duration = this.#formatTime(this.#audio.duration || 0);
    this.#timeDisplay.textContent = `${current} / ${duration}`;
  }

  #updateVolume() {
    const percent = this.#audio.volume * 100;
    this.#volumeBar.style.width = `${percent}%`;
    this.#updateVolumeButton();
  }

  #updateVolumeButton() {
    const svg = this.#volumeBtn.querySelector("svg");
    if (svg) {
      if (this.#audio.muted || this.#audio.volume === 0) {
        svg.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M23 9l-6 6M17 9l6 6"></path>';
      } else if (this.#audio.volume < 0.5) {
        svg.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>';
      } else {
        svg.innerHTML = '<path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>';
      }
    }
  }

  #formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  #updatePlayButton() {
    const svg = this.#playPauseBtn.querySelector("svg");
    if (svg) {
      svg.innerHTML = this.#isPlaying
        ? '<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"></path>'
        : '<path d="M8 5v14l11-7z"></path>';
    }
  }

  play() {
    return this.#audio.play();
  }

  pause() {
    this.#audio.pause();
  }

  get src() {
    return this.getAttribute("src") || "";
  }

  set src(v: string) {
    this.setAttribute("src", v);
  }
}

