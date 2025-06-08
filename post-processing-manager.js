// Post-Processing Manager - v1.1.0 - SSAO Support

class PostProcessingManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.composer = null;
    this.renderPass = null;
    this.bloomPass = null;
    this.ssaoPass = null;
    this.enabled = false;
    this.ssaoEnabled = false;
    
    this.bloomSettings = {
      threshold: 0.8,
      strength: 0.5,
      radius: 0.4,
      exposure: 1.0
    };
    
    this.ssaoSettings = {
      kernelRadius: 8,
      minDistance: 0.005,
      maxDistance: 0.1,
      intensity: 1.0,
      bias: 0.01
    };

    console.log("PostProcessingManager v1.1.0 - Bloom + SSAO Support");
  }

  async initialize() {
    try {
      const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js');
      const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js');
      const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');
      const { SSAOPass } = await import('three/examples/jsm/postprocessing/SSAOPass.js');
      
      console.log("✅ Post-processing modulok betöltve (Bloom + SSAO)");
      
      this.composer = new EffectComposer(this.sceneManager.renderer);
      
      this.renderPass = new RenderPass(this.sceneManager.scene, this.sceneManager.camera);
      this.composer.addPass(this.renderPass);
      
      const ssaoResolution = new THREE.Vector2(
        this.sceneManager.container.clientWidth,
        this.sceneManager.container.clientHeight
      );
      
      this.ssaoPass = new SSAOPass(
        this.sceneManager.scene,
        this.sceneManager.camera,
        ssaoResolution.x,
        ssaoResolution.y
      );
      
      this.ssaoPass.kernelRadius = this.ssaoSettings.kernelRadius;
      this.ssaoPass.minDistance = this.ssaoSettings.minDistance;
      this.ssaoPass.maxDistance = this.ssaoSettings.maxDistance;
      this.ssaoPass.intensity = this.ssaoSettings.intensity;
      this.ssaoPass.bias = this.ssaoSettings.bias;
      
      this.composer.addPass(this.ssaoPass);
      
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
      
      this.sceneManager.renderer.toneMappingExposure = this.bloomSettings.exposure;
      
      console.log("🌟 Bloom + SSAO Effect inicializálva");
      return true;
      
    } catch (error) {
      console.error("❌ Post-processing inicializálás hiba:", error);
      return false;
    }
  }

  setBloomEnabled(enabled = true) {
    this.enabled = enabled;
    
    if (enabled && this.composer) {
      console.log("✅ Bloom Effect bekapcsolva");
      this.enableComposerRendering();
    } else {
      console.log("❌ Bloom Effect kikapcsolva");
      this.disableComposerRendering();
    }
  }

  setSSAOEnabled(enabled = true) {
    this.ssaoEnabled = enabled;
    
    if (this.ssaoPass) {
      this.ssaoPass.enabled = enabled;
      console.log(`🌑 SSAO Effect ${enabled ? 'bekapcsolva' : 'kikapcsolva'}`);
    }
  }

  enableComposerRendering() {
    if (!this.composer) return;
    
    this.originalAnimationLoop = this.sceneManager.animationId;
    this.sceneManager.stopAnimationLoop();
    
    const animate = () => {
      this.sceneManager.animationId = requestAnimationFrame(animate);
      this.composer.render();
    };
    
    animate();
    console.log("🎬 EffectComposer renderelés aktív");
  }

  disableComposerRendering() {
    this.sceneManager.stopAnimationLoop();
    this.sceneManager.startAnimationLoop();
    console.log("🎬 Normál renderelés visszaállítva");
  }

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
      'metallic': {
        threshold: 0.7,
        strength: 0.8,
        radius: 0.3,
        exposure: 1.1
      }
    };
    
    const preset = presets[presetName];
    if (preset && this.bloomPass) {
      this.bloomSettings = { ...preset };
      this.bloomPass.threshold = preset.threshold;
      this.bloomPass.strength = preset.strength;
      this.bloomPass.radius = preset.radius;
      this.sceneManager.renderer.toneMappingExposure = preset.exposure;
      console.log(`🎨 Bloom preset alkalmazva: ${presetName}`);
    }
  }

  setSSAOPreset(presetName) {
    const presets = {
      'subtle': {
        kernelRadius: 8,
        minDistance: 0.005,
        maxDistance: 0.1,
        intensity: 0.8,
        bias: 0.01
      },
      'architectural': {
        kernelRadius: 10,
        minDistance: 0.003,
        maxDistance: 0.08,
        intensity: 1.0,
        bias: 0.008
      }
    };
    
    const preset = presets[presetName];
    if (preset && this.ssaoPass) {
      this.ssaoSettings = { ...preset };
      this.ssaoPass.kernelRadius = preset.kernelRadius;
      this.ssaoPass.minDistance = preset.minDistance;
      this.ssaoPass.maxDistance = preset.maxDistance;
      this.ssaoPass.intensity = preset.intensity;
      this.ssaoPass.bias = preset.bias;
      console.log(`🏗️ SSAO preset alkalmazva: ${presetName}`);
    }
  }

  getStatus() {
    return {
      version: 'v1.1.0 - Bloom + SSAO',
      enabled: this.enabled,
      bloomEnabled: this.enabled,
      ssaoEnabled: this.ssaoEnabled,
      hasComposer: !!this.composer,
      hasBloomPass: !!this.bloomPass,
      hasSSAOPass: !!this.ssaoPass
    };
  }

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

window.PostProcessingManager = PostProcessingManager;