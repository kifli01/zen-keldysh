/**
 * Shader Loader
 * Shader fájlok betöltése és kezelése
 * v1.0.0
 */

class ShaderLoader {
  constructor() {
    this.loadedShaders = new Map();
    this.loadingPromises = new Map();
  }

  /**
   * Shader fájl betöltése
   * @param {string} url - Shader fájl elérési útja
   * @returns {Promise<string>} - Shader kód string
   */
  async loadShader(url) {
    // Ha már betöltöttük, visszaadjuk a cache-ből
    if (this.loadedShaders.has(url)) {
      return this.loadedShaders.get(url);
    }

    // Ha épp betöltés alatt van, várjuk meg
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url);
    }

    // Új betöltés indítása
    const loadingPromise = this.fetchShader(url);
    this.loadingPromises.set(url, loadingPromise);

    try {
      const shaderCode = await loadingPromise;
      this.loadedShaders.set(url, shaderCode);
      this.loadingPromises.delete(url);
      return shaderCode;
    } catch (error) {
      this.loadingPromises.delete(url);
      throw error;
    }
  }

  /**
   * Tényleges fájl betöltés
   * @param {string} url - Shader fájl URL
   * @returns {Promise<string>}
   */
  async fetchShader(url) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Shader betöltési hiba: ${response.status} ${response.statusText}`
        );
      }

      const shaderCode = await response.text();

      if (!shaderCode.trim()) {
        throw new Error(`Üres shader fájl: ${url}`);
      }

      console.log(`✅ Shader betöltve: ${url}`);
      return shaderCode;
    } catch (error) {
      console.error(`❌ Shader betöltési hiba (${url}):`, error);
      throw error;
    }
  }

  /**
   * Több shader párhuzamos betöltése
   * @param {Object} shaderUrls - Shader URL-ek objektuma: {name: url}
   * @returns {Promise<Object>} - Betöltött shader kódok objektuma: {name: code}
   */
  async loadShaders(shaderUrls) {
    const loadPromises = Object.entries(shaderUrls).map(async ([name, url]) => {
      try {
        const code = await this.loadShader(url);
        return [name, code];
      } catch (error) {
        console.error(`Shader betöltési hiba (${name}):`, error);
        return [name, null];
      }
    });

    const results = await Promise.all(loadPromises);
    const shaders = {};

    results.forEach(([name, code]) => {
      shaders[name] = code;
    });

    return shaders;
  }

  /**
   * Toon shader-ek betöltése (specifikus függvény)
   * @returns {Promise<Object>} - {vertex: string, fragment: string}
   */
  async loadToonShaders() {
    try {
      const shaders = await this.loadShaders({
        vertex: "shaders/toon.vert",
        fragment: "shaders/toon.frag",
      });

      // Ellenőrizzük hogy mindkét shader betöltődött
      if (!shaders.vertex || !shaders.fragment) {
        throw new Error("Toon shader fájlok hiányoznak");
      }

      return shaders;
    } catch (error) {
      console.error("Toon shader betöltési hiba:", error);
      return null;
    }
  }

  /**
   * Shader elérhetőség ellenőrzése DOM-ból (fallback)
   * @returns {Object} - {vertex: string|null, fragment: string|null}
   */
  getEmbeddedShaders() {
    const vertexElement = document.getElementById("toonVertexShader");
    const fragmentElement = document.getElementById("toonFragmentShader");

    return {
      vertex: vertexElement?.textContent || null,
      fragment: fragmentElement?.textContent || null,
    };
  }

  /**
   * Shader betöltés fallback-kel (DOM vagy fájl)
   * @returns {Promise<Object>} - {vertex: string, fragment: string}
   */
  async loadShadersWithFallback() {
    try {
      // Először próbáljuk fájlból
      console.log("🔄 Shader betöltés fájlokból...");
      const fileShaders = await this.loadToonShaders();

      if (fileShaders && fileShaders.vertex && fileShaders.fragment) {
        console.log("✅ Shader-ek betöltve fájlokból");
        return fileShaders;
      }
    } catch (error) {
      console.warn(
        "⚠️ Shader fájl betöltés sikertelen, DOM fallback használata"
      );
    }

    // Fallback: DOM-ból
    console.log("🔄 Shader betöltés DOM-ból...");
    const embeddedShaders = this.getEmbeddedShaders();

    if (embeddedShaders.vertex && embeddedShaders.fragment) {
      console.log("✅ Shader-ek betöltve DOM-ból");
      return embeddedShaders;
    }

    throw new Error("Nem sikerült betölteni a shader kódokat");
  }

  /**
   * Cache tisztítása
   */
  clearCache() {
    this.loadedShaders.clear();
    this.loadingPromises.clear();
    console.log("🧹 Shader cache törölve");
  }

  /**
   * Debug információ
   */
  getDebugInfo() {
    return {
      loadedCount: this.loadedShaders.size,
      loadingCount: this.loadingPromises.size,
      loadedShaders: Array.from(this.loadedShaders.keys()),
    };
  }
}
