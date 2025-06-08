/**
 * Post-Processing Manager
 * Bloom, SSAO és egyéb post-processing effektek kezelése
 * v1.0.0 - Bloom Effect alapok
 */

class PostProcessingManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.composer = null;
    this.renderPass = null;
    this.bloomPass = null;
    this.enabled = false;
    this.bloomSettings = {
      threshold: 0.8,    // Mettől kezdjen izzani
      strength: 0.5,     // Izzás erőssége
      radius: 0.4,       // Izzás kiterjedése
      exposure: 1.0      // Expozíció
    };

    console.log("PostProcessingManager v1.0.0 - Bloom Effect");
  }

  // Inicializálás - EffectComposer és Bloom setup
  async initialize() {
    try {
      // EffectComposer és passes dinamikus import
      const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js');
      const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js');
      const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');
      
      console.log("✅ Post-processing modulok betöltve");
      
      // EffectComposer létrehozása
      this.composer = new EffectComposer(this.sceneManager.renderer);
      
      // RenderPass - alap scene renderelés
      this.renderPass = new RenderPass(this.sceneManager.scene, this.sceneManager.camera);
      this.composer.addPass(this.renderPass);
      
      // UnrealBloomPass - bloom effect
      const bloomResolution = new THREE.Vector2(
        this.sceneManager.container.clientWidth,
        this.sceneManager.container.clientHeight
      );
      
      this.bloomPass = new UnrealBloomPass(
        bloomResolution,
        this.bloomSettings.strength,
        this.bloomSettings.radius,
        this.bloomSettings.threshold
      );
      
      this.composer.addPass(this.bloomPass);
      
      // Renderer exposure beállítása
      this.sceneManager.renderer.toneMappingExposure = this.bloomSettings.exposure;
      
      console.log("🌟 Bloom Effect inicializálva:", this.bloomSettings);
      return true;
      
    } catch (error) {
      console.error("❌ Post-processing inicializálás hiba:", error);
      return false;
    }
  }

  // Bloom engedélyezése/kikapcsolása
  setBloomEnabled(enabled = true) {
    this.enabled = enabled;
    
    if (enabled && this.composer) {
      console.log("✅ Bloom Effect bekapcsolva");
      // EffectComposer használata rendereléshez
      this.enableComposerRendering();
    } else {
      console.log("❌ Bloom Effect kikapcsolva");
      // Vissza normál renderelésre
      this.disableComposerRendering();
    }
  }

  // EffectComposer renderelés engedélyezése
  enableComposerRendering() {
    if (!this.composer) return;
    
    // Animation loop override
    this.originalAnimationLoop = this.sceneManager.animationId;
    this.sceneManager.stopAnimationLoop();
    
    const animate = () => {
      this.sceneManager.animationId = requestAnimationFrame(animate);
      
      // EffectComposer renderelés bloom-mal
      this.composer.render();
    };
    
    animate();
    console.log("🎬 EffectComposer renderelés aktív");
  }

  // Normál renderelés visszaállítása
  disableComposerRendering() {
    this.sceneManager.stopAnimationLoop();
    this.sceneManager.startAnimationLoop();
    console.log("🎬 Normál renderelés visszaállítva");
  }

  // Bloom beállítások módosítása
  setBloomSettings(settings = {}) {
    if (!this.bloomPass) {
      console.warn("Bloom pass nincs inicializálva");
      return;
    }

    // Beállítások frissítése
    if (settings.threshold !== undefined) {
      this.bloomSettings.threshold = Math.max(0, Math.min(2, settings.threshold));
      this.bloomPass.threshold = this.bloomSettings.threshold;
    }
    
    if (settings.strength !== undefined) {
      this.bloomSettings.strength = Math.max(0, Math.min(3, settings.strength));
      this.bloomPass.strength = this.bloomSettings.strength;
    }
    
    if (settings.radius !== undefined) {
      this.bloomSettings.radius = Math.max(0, Math.min(1, settings.radius));
      this.bloomPass.radius = this.bloomSettings.radius;
    }
    
    if (settings.exposure !== undefined) {
      this.bloomSettings.exposure = Math.max(0.1, Math.min(3, settings.exposure));
      this.sceneManager.renderer.toneMappingExposure = this.bloomSettings.exposure;
    }
    
    console.log("🌟 Bloom beállítások frissítve:", this.bloomSettings);
  }

  // Előre definiált bloom preset-ek
  setBloomPreset(presetName) {
    const presets = {
      'subtle': {
        threshold: 1.0,
        strength: 0.3,
        radius: 0.3,
        exposure: 1.0
      },
      'normal': {
        threshold: 0.8,
        strength: 0.5,
        radius: 0.4,
        exposure: 1.0
      },
      'dramatic': {
        threshold: 0.5,
        strength: 1.0,
        radius: 0.6,
        exposure: 1.2
      },
      'metallic': {
        threshold: 0.7,
        strength: 0.8,
        radius: 0.3,
        exposure: 1.1
      }
    };
    
    const preset = presets[presetName];
    if (preset) {
      this.setBloomSettings(preset);
      console.log(`🎨 Bloom preset alkalmazva: ${presetName}`);
    } else {
      console.warn(`Ismeretlen bloom preset: ${presetName}`);
    }
  }

  // Ablak átméretezés kezelése
  handleResize() {
    if (this.composer) {
      const width = this.sceneManager.container.clientWidth;
      const height = this.sceneManager.container.clientHeight;
      
      this.composer.setSize(width, height);
      console.log(`📐 Post-processing resize: ${width}x${height}`);
    }
  }

  // Status információk
  getStatus() {
    return {
      version: 'v1.0.0 - Bloom Effect',
      enabled: this.enabled,
      hasComposer: !!this.composer,
      hasBloomPass: !!this.bloomPass,
      bloomSettings: { ...this.bloomSettings },
      renderingMode: this.enabled ? 'EffectComposer' : 'Normal'
    };
  }

  // Debug információ
  logStatus() {
    console.log("=== POST-PROCESSING STATUS ===");
    const status = this.getStatus();
    Object.entries(status).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });
    console.log("=============================");
  }

  // Cleanup
  destroy() {
    if (this.composer) {
      this.composer.dispose();
      this.composer = null;
    }
    
    this.disableComposerRendering();
    this.enabled = false;
    
    console.log("PostProcessingManager cleanup kész");
  }
}

// Globális hozzáférhetőség
window.PostProcessingManager = PostProcessingManager;