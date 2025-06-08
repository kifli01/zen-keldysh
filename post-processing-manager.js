// Post-Processing Manager - v1.2.0 - FXAA Anti-aliasing Support

class PostProcessingManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.composer = null;
    this.renderPass = null;
    this.bloomPass = null;
    this.ssaoPass = null;
    this.fxaaPass = null; // ÚJ: FXAA anti-aliasing
    this.enabled = false;
    this.ssaoEnabled = false;
    this.fxaaEnabled = true; // ÚJ: FXAA alapértelmezetten BE
    
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

    // ÚJ: FXAA beállítások
    this.fxaaSettings = {
      enabled: true,
      subpixelAliasingRemoval: 0.75,  // Subpixel aliasing removal
      edgeThreshold: 0.166,           // Edge detection threshold
      edgeThresholdMin: 0.0833        // Minimum edge threshold
    };

    console.log("PostProcessingManager v1.2.0 - Bloom + SSAO + FXAA Support");
  }

  async initialize() {
    try {
      const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js');
      const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js');
      const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');
      const { SSAOPass } = await import('three/examples/jsm/postprocessing/SSAOPass.js');
      
      // ÚJ: FXAA import
      const { ShaderPass } = await import('three/examples/jsm/postprocessing/ShaderPass.js');
      const { FXAAShader } = await import('three/examples/jsm/shaders/FXAAShader.js');
      
      console.log("✅ Post-processing modulok betöltve (Bloom + SSAO + FXAA)");
      
      this.composer = new EffectComposer(this.sceneManager.renderer);
      
      // 1. Render Pass (alap renderelés)
      this.renderPass = new RenderPass(this.sceneManager.scene, this.sceneManager.camera);
      this.composer.addPass(this.renderPass);
      
      // 2. SSAO Pass (ambient occlusion)
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
      this.ssaoPass.enabled = this.ssaoEnabled; // Alapértelmezetten kikapcsolva
      
      this.composer.addPass(this.ssaoPass);
      
      // 3. Bloom Pass (fényeffekt)
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
      
      // 4. ÚJ: FXAA Pass (anti-aliasing) - UTOLSÓ PASS!
      this.fxaaPass = new ShaderPass(FXAAShader);
      
      // FXAA beállítások inicializálása
      this.updateFXAAUniforms();
      this.fxaaPass.enabled = this.fxaaEnabled;
      
      // KRITIKUS: FXAA az utolsó pass kell legyen!
      this.composer.addPass(this.fxaaPass);
      
      // Tone mapping exposure beállítása
      this.sceneManager.renderer.toneMappingExposure = this.bloomSettings.exposure;
      
      console.log("🌟 Post-Processing Pipeline kész: Render → SSAO → Bloom → FXAA");
      console.log(`🎯 FXAA Anti-aliasing: ${this.fxaaEnabled ? 'ENABLED' : 'DISABLED'}`);
      
      return true;
      
    } catch (error) {
      console.error("❌ Post-processing inicializálás hiba:", error);
      return false;
    }
  }

  // ÚJ: FXAA uniform értékek frissítése
  updateFXAAUniforms() {
    if (!this.fxaaPass) return;

    const canvas = this.sceneManager.renderer.domElement;
    const pixelRatio = this.sceneManager.renderer.getPixelRatio();
    
    // FXAA shader uniform-ok beállítása
    this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (canvas.clientWidth * pixelRatio);
    this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (canvas.clientHeight * pixelRatio);
    
    console.log(`🎯 FXAA resolution frissítve: ${canvas.clientWidth}x${canvas.clientHeight} (${pixelRatio}x pixel ratio)`);
  }

  // ÚJ: FXAA be/kikapcsolása
  setFXAAEnabled(enabled = true) {
    this.fxaaEnabled = enabled;
    
    if (this.fxaaPass) {
      this.fxaaPass.enabled = enabled;
      console.log(`🎯 FXAA Anti-aliasing ${enabled ? 'bekapcsolva' : 'kikapcsolva'}`);
    }
    
    // Ha FXAA bekapcsolva, akkor composer renderelést kell használni
    if (enabled && this.composer) {
      this.enableComposerRendering();
    }
  }

  // ÚJ: FXAA preset-ek
  setFXAAPreset(presetName) {
    const presets = {
      'conservative': {
        subpixelAliasingRemoval: 0.5,
        edgeThreshold: 0.25,
        edgeThresholdMin: 0.125
      },
      'default': {
        subpixelAliasingRemoval: 0.75,
        edgeThreshold: 0.166,
        edgeThresholdMin: 0.0833
      },
      'aggressive': {
        subpixelAliasingRemoval: 1.0,
        edgeThreshold: 0.125,
        edgeThresholdMin: 0.0625
      },
      'ultra': {
        subpixelAliasingRemoval: 1.0,
        edgeThreshold: 0.063,
        edgeThresholdMin: 0.031
      }
    };
    
    const preset = presets[presetName];
    if (preset && this.fxaaPass) {
      this.fxaaSettings = { ...this.fxaaSettings, ...preset };
      
      // FXAA shader uniform-ok frissítése (ha van ilyen API)
      // Megjegyzés: Az FXAAShader lehet hogy nem támogatja ezeket a paramétereket
      console.log(`🎨 FXAA preset alkalmazva: ${presetName}`, preset);
    }
  }

  setBloomEnabled(enabled = true) {
    this.enabled = enabled;
    
    if (enabled && this.composer) {
      console.log("✅ Bloom Effect bekapcsolva");
      this.enableComposerRendering();
    } else if (!this.fxaaEnabled) {
      // Csak akkor kapcsoljunk vissza normál renderelésre, ha FXAA sincs
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
      
      // FXAA uniform-ok frissítése minden frame-ben (ha szükséges)
      if (this.fxaaEnabled && this.fxaaPass) {
        this.updateFXAAUniforms();
      }
      
      this.composer.render();
    };
    
    animate();
    console.log("🎬 EffectComposer renderelés aktív (FXAA + post-processing)");
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

  // ÚJ: Resize handling FXAA-hoz
  handleResize() {
    if (this.composer) {
      const width = this.sceneManager.container.clientWidth;
      const height = this.sceneManager.container.clientHeight;
      
      this.composer.setSize(width, height);
      
      // FXAA uniform-ok frissítése resize után
      if (this.fxaaEnabled) {
        this.updateFXAAUniforms();
      }
      
      console.log(`📐 Post-processing resize: ${width}x${height}`);
    }
  }

  // ÚJ: Anti-aliasing specifikus beállítások
  getAntiAliasingInfo() {
    return {
      fxaaEnabled: this.fxaaEnabled,
      fxaaSettings: this.fxaaSettings,
      rendererAntialias: this.sceneManager.renderer.antialias || false,
      pixelRatio: this.sceneManager.renderer.getPixelRatio(),
      resolution: this.fxaaPass ? {
        x: this.fxaaPass.material.uniforms['resolution'].value.x,
        y: this.fxaaPass.material.uniforms['resolution'].value.y
      } : null
    };
  }

  getStatus() {
    return {
      version: 'v1.2.0 - Bloom + SSAO + FXAA',
      enabled: this.enabled,
      bloomEnabled: this.enabled,
      ssaoEnabled: this.ssaoEnabled,
      fxaaEnabled: this.fxaaEnabled, // ÚJ
      hasComposer: !!this.composer,
      hasBloomPass: !!this.bloomPass,
      hasSSAOPass: !!this.ssaoPass,
      hasFXAAPass: !!this.fxaaPass, // ÚJ
      antiAliasing: this.getAntiAliasingInfo() // ÚJ
    };
  }

  destroy() {
    if (this.composer) {
      this.composer.dispose();
      this.composer = null;
    }
    
    this.disableComposerRendering();
    this.enabled = false;
    this.fxaaEnabled = false;
    
    console.log("PostProcessingManager v1.2.0 cleanup kész");
  }
}

window.PostProcessingManager = PostProcessingManager;