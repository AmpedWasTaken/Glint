const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      position: relative;
    }
    .video-container {
      position: relative;
      width: 100%;
      background: var(--gl-panel);
      border-radius: var(--gl-radius);
      overflow: hidden;
    }
    .video {
      width: 100%;
      height: 100%;
      display: block;
    }
    .video-controls {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
      padding: var(--gl-space-4);
      display: flex;
      align-items: center;
      gap: var(--gl-space-2);
      opacity: 0;
      transition: opacity var(--gl-dur-2) var(--gl-ease);
      pointer-events: none;
    }
    :host([show-controls]) .video-controls,
    .video-container:hover .video-controls {
      opacity: 1;
      pointer-events: auto;
    }
    .video-button {
      all: unset;
      cursor: pointer;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: background var(--gl-dur-1) var(--gl-ease);
    }
    .video-button:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    .video-progress {
      flex: 1;
      height: 4px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
      position: relative;
      cursor: pointer;
    }
    .video-progress-bar {
      height: 100%;
      background: var(--gl-primary);
      border-radius: 2px;
      transition: width 0.1s linear;
    }
    .video-time {
      color: white;
      font-size: var(--gl-text-sm);
      font-variant-numeric: tabular-nums;
      min-width: 80px;
      text-align: right;
    }
    :host([rounded]) .video-container {
      border-radius: var(--gl-radius);
    }
    :host([rounded="sm"]) .video-container {
      border-radius: var(--gl-radius-sm);
    }
    :host([rounded="lg"]) .video-container {
      border-radius: var(--gl-radius-lg);
    }
  </style>
  <div class="video-container" part="container">
    <video class="video" part="video"></video>
    <div class="video-controls" part="controls">
      <button class="video-button" part="play-pause" type="button" aria-label="Play/Pause">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"></path>
        </svg>
      </button>
      <div class="video-progress" part="progress">
        <div class="video-progress-bar" part="progress-bar"></div>
      </div>
      <div class="video-time" part="time">0:00 / 0:00</div>
      <button class="video-button" part="fullscreen" type="button" aria-label="Fullscreen">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
        </svg>
      </button>
    </div>
  </div>
`;

export class GlVideo extends HTMLElement {
  static tagName = "gl-video";
  static get observedAttributes() {
    return ["src", "autoplay", "loop", "muted", "controls", "show-controls", "poster", "rounded"];
  }

  #video!: HTMLVideoElement;
  #playPauseBtn!: HTMLButtonElement;
  #fullscreenBtn!: HTMLButtonElement;
  #progressBar!: HTMLElement;
  #progressContainer!: HTMLElement;
  #timeDisplay!: HTMLElement;
  #isPlaying = false;
  #isDragging = false;

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));
    
    this.#video = this.shadowRoot!.querySelector(".video") as HTMLVideoElement;
    this.#playPauseBtn = this.shadowRoot!.querySelector('[part="play-pause"]') as HTMLButtonElement;
    this.#fullscreenBtn = this.shadowRoot!.querySelector('[part="fullscreen"]') as HTMLButtonElement;
    this.#progressBar = this.shadowRoot!.querySelector('[part="progress-bar"]') as HTMLElement;
    this.#progressContainer = this.shadowRoot!.querySelector('[part="progress"]') as HTMLElement;
    this.#timeDisplay = this.shadowRoot!.querySelector('[part="time"]') as HTMLElement;

    this.#playPauseBtn.addEventListener("click", () => this.#togglePlay());
    this.#fullscreenBtn.addEventListener("click", () => this.#toggleFullscreen());
    this.#progressContainer.addEventListener("click", (e) => this.#seek(e));
    this.#progressContainer.addEventListener("mousedown", () => { this.#isDragging = true; });
    document.addEventListener("mouseup", () => { this.#isDragging = false; });
    document.addEventListener("mousemove", (e) => {
      if (this.#isDragging) this.#seek(e);
    });

    this.#video.addEventListener("play", () => {
      this.#isPlaying = true;
      this.#updatePlayButton();
    });
    this.#video.addEventListener("pause", () => {
      this.#isPlaying = false;
      this.#updatePlayButton();
    });
    this.#video.addEventListener("timeupdate", () => this.#updateProgress());
    this.#video.addEventListener("loadedmetadata", () => this.#updateTime());

    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    const src = this.getAttribute("src");
    if (src) {
      this.#video.src = src;
    }

    this.#video.autoplay = this.hasAttribute("autoplay");
    this.#video.loop = this.hasAttribute("loop");
    this.#video.muted = this.hasAttribute("muted");
    this.#video.controls = this.hasAttribute("controls");

    const poster = this.getAttribute("poster");
    if (poster) {
      this.#video.poster = poster;
    }
  }

  #togglePlay() {
    if (this.#video.paused) {
      this.#video.play();
    } else {
      this.#video.pause();
    }
  }

  #toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.#video.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  #seek(e: MouseEvent) {
    const rect = this.#progressContainer.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    this.#video.currentTime = percent * this.#video.duration;
  }

  #updateProgress() {
    if (this.#isDragging) return;
    const percent = (this.#video.currentTime / this.#video.duration) * 100;
    this.#progressBar.style.width = `${percent}%`;
    this.#updateTime();
  }

  #updateTime() {
    const current = this.#formatTime(this.#video.currentTime);
    const duration = this.#formatTime(this.#video.duration || 0);
    this.#timeDisplay.textContent = `${current} / ${duration}`;
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
    return this.#video.play();
  }

  pause() {
    this.#video.pause();
  }

  get src() {
    return this.getAttribute("src") || "";
  }

  set src(v: string) {
    this.setAttribute("src", v);
  }
}

