/**
 * Minigolf Summary Generator
 * Létrehozza és kezeli a minigolf pálya specifikációs panelt
 * v1.4.0 - Egyedi elem láthatóság kapcsolók
 */

// Összegző panel létrehozása
const summaryGenerator = {
  /**
   * Létrehozza a teljes summary panelt
   * @param {HTMLElement} container - A container elem, amibe a summary-t helyezzük
   * @param {Object} summaryData - A summary objektum a createMiniGolfModel-ből
   * @param {string} version
   */
  renderFullSummary: function (container, summaryData, version) {
    if (!container || !summaryData) {
      console.error("Container vagy summary adatok hiányoznak!");
      return;
    }

    // Alapvető panel létrehozása
    container.innerHTML = `<h1>Minigolf Pálya - ${version}</h1>`;

    // Különböző szekciók létrehozása
    container.innerHTML += this.createTotalDimensionsSection(summaryData);
    container.innerHTML += this.createComponentsSection(summaryData);
    container.innerHTML += this.createMaterialsSection(summaryData);

    // Collapsible funkció hozzáadása
    this.initCollapseFeature();
  },

  /**
   * Teljes méretek szekció létrehozása
   * @param {Object} summaryData - A summary objektum
   * @returns {string} - HTML string a szekcióhoz
   */
  createTotalDimensionsSection: function (summaryData) {
    const { totalDimensions, weights } = summaryData;

    return `
      <div class="summary-section">
          <h2 class="collapsible">Teljes méretek</h2>
          <div class="collapsible-content">
              <div class="dim-section">
                  <div>
                      <div class="summary-item">
                          <span class="summary-item-key">Hosszúság:</span>
                          <span class="summary-item-value">${
                            totalDimensions.length
                          } cm</span>
                      </div>
                      <div class="summary-item">
                          <span class="summary-item-key">Szélesség:</span>
                          <span class="summary-item-value">${
                            totalDimensions.width
                          } cm</span>
                      </div>
                  </div>
                  <div>
                      <div class="summary-item">
                          <span class="summary-item-key">Magasság:</span>
                          <span class="summary-item-value">${
                            totalDimensions.height.withSides
                          } cm</span>
                      </div>
                      <div class="summary-item">
                          <span class="summary-item-key">Alap magasság:</span>
                          <span class="summary-item-value">${totalDimensions.height.withoutSides.toFixed(
                            1
                          )} cm</span>
                      </div>
                  </div>
              </div>
              <div class="weight-summary">
                  Teljes súly: ${weights.total.kilograms.toFixed(1)} kg
              </div>
              <div class="summary-item">
                  <span class="summary-item-key">Térfogat:</span>
                  <span class="summary-item-value">${totalDimensions.totalVolume.toFixed(
                    2
                  )} cm³</span>
              </div>
              <div class="summary-item">
                  <span class="summary-item-key">Súly:</span>
                  <span class="summary-item-value">${weights.total.grams.toFixed(
                    2
                  )} g</span>
              </div>
          </div>
      </div>`;
  },

  /**
   * Komponensek szekció létrehozása
   * @param {Object} summaryData - A summary objektum
   * @returns {string} - HTML string a szekcióhoz
   */
  createComponentsSection: function (summaryData) {
    const { components } = summaryData;

    let html = `
      <div class="summary-section">
          <h2 class="collapsible">Komponensek</h2>
          <div class="collapsible-content">`;

    // Komponensek végigjárása
    components.forEach((component) => {
      html += this.createComponentCard(component);
    });

    html += `</div></div>`;

    return html;
  },

  /**
   * Egy komponens kártya létrehozása
   * @param {Object} component - A komponens objektum
   * @returns {string} - HTML string a komponens kártyához
   */
  createComponentCard: function (component) {
    let html = `
      <div class="component-card">
          <h3>${component.name}</h3>
          <span class="material-tag">${component.material}</span>
          
          ${
            component.dimensions
              ? this.createDimensionsItem(component.dimensions)
              : ""
          }
          
          <div class="summary-item">
              <span class="summary-item-key">Térfogat:</span>
              <span class="summary-item-value">${(
                component.volume || component.totalVolume
              ).toFixed(2)} cm³</span>
          </div>
          
          <div class="summary-item">
              <span class="summary-item-key">Súly:</span>
              <span class="summary-item-value">${(
                (component.weight || component.totalWeight) / 1000
              ).toFixed(2)} kg</span>
          </div>`;

    // Ha vannak alelemek
    if (
      component.elements &&
      Array.isArray(component.elements) &&
      component.elements.length > 0
    ) {
      html += `<h3 class="collapsible">Részletek</h3>
          <div class="collapsible-content">`;

      component.elements.forEach((element) => {
        html += this.createSubComponentItem(element);
      });

      html += `</div>`;
    }

    html += `</div>`;

    return html;
  },

  /**
   * Egy al-komponens elem létrehozása
   * @param {Object} element - Az alelem objektum
   * @returns {string} - HTML string az alelemhez
   */
  createSubComponentItem: function (element) {
    let html = `
      <div class="sub-component">
          <div class="element-header">
              <div class="summary-item">
                  <span class="summary-item-key">${element.name}:</span>
                  <span class="summary-item-value">${
                    element.count || 1
                  } db</span>
              </div>
              <label class="visibility-toggle">
                  <input type="checkbox" checked data-element-id="${
                    element.id
                  }" onchange="toggleElementVisibility('${
      element.id
    }', this.checked)">
                  <span class="toggle-slider"></span>
              </label>
          </div>
          
          ${
            element.dimensions
              ? this.createDimensionsItem(element.dimensions)
              : ""
          }
          
          ${
            element.volume
              ? `
          <div class="summary-item">
              <span class="summary-item-key">Térfogat:</span>
              <span class="summary-item-value">${element.volume.toFixed(
                2
              )} cm³</span>
          </div>
          `
              : ""
          }
          
          ${
            element.weight
              ? `
          <div class="summary-item">
              <span class="summary-item-key">Súly:</span>
              <span class="summary-item-value">${(
                element.weight / 1000
              ).toFixed(2)} kg</span>
          </div>
          `
              : ""
          }`;

    // Ha van spacing
    if (element.spacing) {
      html += `
          <div class="summary-item">
              <span class="summary-item-key">Távolság:</span>
              <span class="summary-item-value">${element.spacing.toFixed(
                1
              )} cm</span>
          </div>`;
    }

    html += `</div>`;

    return html;
  },

  /**
   * Méretek elem létrehozása
   * @param {Object} dimensions - A méretek objektum
   * @returns {string} - HTML string a méretekhez
   */
  createDimensionsItem: function (dimensions) {
    return `
      <div class="summary-item">
          <span class="summary-item-key">Méret:</span>
          <span class="summary-item-value">
              ${dimensions.length} × 
              ${dimensions.width} × 
              ${dimensions.thickness || dimensions.height} cm
          </span>
      </div>`;
  },

  /**
   * Anyagok szakasz létrehozása
   * @param {Object} summaryData - A summary objektum
   * @returns {string} - HTML string az anyagok szekcióhoz
   */
  createMaterialsSection: function (summaryData) {
    const { weights } = summaryData;

    let html = `
      <div class="summary-section">
          <h2 class="collapsible">Anyagok szerinti súlybontás</h2>
          <div class="collapsible-content">`;

    weights.byMaterial.forEach((material) => {
      html += `
          <div class="summary-item">
              <span class="summary-item-key">${material.name}:</span>
              <span class="summary-item-value">${material.weightKg.toFixed(
                2
              )} kg</span>
          </div>`;
    });

    html += `</div></div>`;

    return html;
  },

  /**
   * Az összecsukható paneleket inicializálja
   */
  initCollapseFeature: function () {
    document.querySelectorAll(".collapsible").forEach((item) => {
      item.addEventListener("click", function () {
        this.classList.toggle("collapsed");
        const content = this.nextElementSibling;
        if (content && content.classList.contains("collapsible-content")) {
          content.classList.toggle("collapsed");
        }
      });
    });
  },

  /**
   * Frissíti a summary panel tartalmát
   * @param {HTMLElement} container - A container elem
   * @param {Object} summaryData - Az új summary objektum
   */
  updateSummary: function (container, summaryData) {
    // Jelenlegi scrollbar pozíció mentése
    const scrollPos = container.scrollTop;

    // Tartalom frissítése
    this.renderFullSummary(container, summaryData);

    // Scrollbar pozíció visszaállítása
    container.scrollTop = scrollPos;
  },
};
