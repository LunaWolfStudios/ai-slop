class AudioService {
  private ctx: AudioContext | null = null;
  private musicNodes: AudioScheduledSourceNode[] = [];
  private isMuted: boolean = false;
  private nextNoteTime: number = 0;
  private isMusicPlaying: boolean = false;

  constructor() {
    try {
      // Defer initialization to user interaction
    } catch (e) {
      console.error("Audio not supported");
    }
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(mute: boolean) {
    this.isMuted = mute;
    if (mute) {
      this.stopMusic();
    } else {
      // Music restart logic handled by game loop triggers if needed
    }
  }

  public playStringPluck() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Random pitch for variety
    osc.frequency.setValueAtTime(200 + Math.random() * 100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  public playSplat() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(20, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playBuild() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playDamage() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  // Simple procedural ambient music
  public startMusic() {
    if (this.isMuted || this.isMusicPlaying) return;
    this.init();
    if (!this.ctx) return;
    this.isMusicPlaying = true;
    this.nextNoteTime = this.ctx.currentTime;
    this.scheduleNotes();
  }

  private scheduleNotes() {
    if (!this.isMusicPlaying || !this.ctx) return;

    while (this.nextNoteTime < this.ctx.currentTime + 1.0) {
      this.playAmbientNote(this.nextNoteTime);
      this.nextNoteTime += 2.0; // Play a note every 2 seconds
    }
    
    setTimeout(() => this.scheduleNotes(), 500);
  }

  private playAmbientNote(time: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Pentatonic dark scale frequencies
    const freqs = [110, 130.81, 146.83, 196.00, 220.00]; 
    const freq = freqs[Math.floor(Math.random() * freqs.length)];

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.05, time + 0.5);
    gain.gain.linearRampToValueAtTime(0, time + 2.0);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(time);
    osc.stop(time + 2.0);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    // Notes naturally decay
  }
}

export const audioService = new AudioService();
