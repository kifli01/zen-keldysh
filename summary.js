/**
 * Minigolf Summary Generator
 * Létrehozza és kezeli a minigolf pálya specifikációs panelt
 * v1.6.0 - Hierarchikus UI + Csoportos toggle
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
   * Teljes méretek szekció - VÁLTOZATLAN
   */
  createTotalDimensionsSection: function (summaryData) {
    const { totalDimensions, weights } = summaryData;

    return `
      <div class="summary-section">
          <h2 class="collapsible">Teljes méretek és súly</h2>
          <div class="collapsible-content">
              <div class="summary-item">
                  <span class="summary-item-key">Hosszúság:</span>
                  <span class="summary-item-value">${
                    totalDimensions.length.toFixed(1)
                  } cm</span>
              </div>
              <div class="summary-item">
                  <span class="summary-item-key">Szélesség:</span>
                  <span class="summary-item-value">${
                    totalDimensions.width.toFixed(1)
                  } cm</span>
              </div>
              <div class="summary-item">
                  <span class="summary-item-key">Magasság (oldalfalakkal):</span>
                  <span class="summary-item-value">${
                    totalDimensions.height.withSides
                  } cm</span>
              </div>
              <div class="summary-item">
                  <span class="summary-item-key">Magasság (váz csak):</span>
                  <span class="summary-item-value">${totalDimensions.height.withoutSides.toFixed(
                    1
                  )} cm</span>
              </div>
              <div class="weight-summary">
                  <strong>Teljes súly: ${weights.total.kilograms.toFixed(1)} kg</strong>
              </div>
          </div>
      </div>`;
  },

  /**
   * ÚJRAÍRT: Komponensek szekció - Hierarchikus UI
   */
  createComponentsSection: function (summaryData) {
    const { components } = summaryData;

    let html = `
      <div class="summary-section">
          <h2 class="collapsible">Komponensek</h2>
          <div class="collapsible-content">`;

    // Komponensek végigjárása - ÚJ hierarchikus struktúra
    components.forEach((component, componentIndex) => {
      html += this.createHierarchicalComponentCard(component, componentIndex);
    });

    html += `</div></div>`;
    return html;
  },

  /**
   * ÚJ: Hierarchikus komponens kártya - Minimális fejléc
   */
  createHierarchicalComponentCard: function (component, componentIndex) {
    const componentId = `component_${componentIndex}`;
    
    let html = `
      <div class="component-card hierarchical">
          <!-- KOMPONENS FEJLÉC - Csak név + elemszám -->
          <div class="component-header">
              <div class="component-info">
                  <span class="component-name">${component.name}</span>
                  <span class="element-count">${component.elements.length} elem</span>
              </div>
              
              <div class="component-controls">
                  <label class="visibility-toggle" title="Komponens láthatóság">
                      <input type="checkbox" checked 
                             data-component-id="${componentId}" 
                             onchange="toggleComponentVisibility('${componentId}', this.checked)">
                      <span class="toggle-slider"></span>
                  </label>
                  <button class="details-chevron collapsed" type="button" 
                          onclick="toggleComponentDetails('${componentId}', this)"
                          title="Részletek ki/be">
                      <span>▼</span>
                  </button>
              </div>
          </div>

          <!-- KOMPONENS RÉSZLETEK - Anyag + súly itt -->
          <div class="component-details collapsed" id="${componentId}_details">
              <div class="component-meta-details">
                  <div class="summary-item">
                      <span class="summary-item-key">Anyag:</span>
                      <span class="summary-item-value">
                          <span class="material-tag">${component.material}</span>
                      </span>
                  </div>
                  <div class="summary-item">
                      <span class="summary-item-key">Összsúly:</span>
                      <span class="summary-item-value">${(component.totalWeight / 1000).toFixed(1)} kg</span>
                  </div>
              </div>
              
              <div class="elements-list">`;

    // Elemek listája
    if (component.elements && component.elements.length > 0) {
      component.elements.forEach((element, elementIndex) => {
        html += this.createHierarchicalElementItem(element, componentId, elementIndex);
      });
    }

    html += `
              </div>
          </div>
      </div>`;

    return html;
  },

  /**
   * ÚJ: Hierarchikus elem item - Alapból összecsukatott
   */
  createHierarchicalElementItem: function (element, componentId, elementIndex) {
    const elementId = `${componentId}_element_${elementIndex}`;
    
    let html = `
      <div class="element-item hierarchical">
          <!-- ELEM FEJLÉC -->
          <div class="element-header">
              <div class="element-info">
                  <span class="element-name">${element.name}</span>
                  <span class="element-count">${element.count || 1} db</span>
                  <span class="element-weight">${((element.weight || 0) / 1000).toFixed(3)} kg</span>
              </div>
              
              <div class="element-controls">
                  <label class="visibility-toggle" title="Elem láthatóság">
                      <input type="checkbox" checked 
                             data-element-id="${element.id}" 
                             onchange="toggleElementVisibility('${element.id}', this.checked)">
                      <span class="toggle-slider"></span>
                  </label>
                  <button class="details-chevron collapsed" type="button" 
                          onclick="toggleElementDetails('${elementId}', this)"
                          title="Részletek ki/be">
                      <span>▼</span>
                  </button>
              </div>
          </div>

          <!-- ELEM RÉSZLETEK - Alapból összecsukva -->
          <div class="element-details collapsed" id="${elementId}_details">`;

    // Részletes információk
    if (element.dimensions) {
      html += this.createDimensionsItem(element.dimensions);
    }

    // Súly részletesebben
    html += `
              <div class="summary-item">
                  <span class="summary-item-key">Súly részletesen:</span>
                  <span class="summary-item-value">${((element.weight || 0) / 1000).toFixed(3)} kg</span>
              </div>`;

    // Spacing ha van
    if (element.spacing) {
      html += `
              <div class="summary-item">
                  <span class="summary-item-key">Távolság:</span>
                  <span class="summary-item-value">${element.spacing.toFixed(1)} cm</span>
              </div>`;
    }

    html += `
          </div>
      </div>`;

    return html;
  },

  /**
   * Méretek elem létrehozása - VÁLTOZATLAN
   */
  createDimensionsItem: function (dimensions) {
    let dimensionText = "";
    
    if (dimensions.length && dimensions.width && (dimensions.thickness || dimensions.height)) {
      const thickness = dimensions.thickness || dimensions.height;
      dimensionText = `${dimensions.length} × ${dimensions.width} × ${thickness} cm`;
    } else if (dimensions.diameter && dimensions.height) {
      dimensionText = `⌀${dimensions.diameter} × ${dimensions.height} cm`;
    } else if (dimensions.radius && dimensions.height) {
      dimensionText = `⌀${(dimensions.radius * 2).toFixed(1)} × ${dimensions.height} cm`;
    } else if (dimensions.diameter) {
      dimensionText = `⌀${dimensions.diameter} cm`;
    } else if (dimensions.radius) {
      dimensionText = `⌀${(dimensions.radius * 2).toFixed(1)} cm`;
    } else {
      const parts = [];
      if (dimensions.length) parts.push(`H:${dimensions.length}`);
      if (dimensions.width) parts.push(`Sz:${dimensions.width}`);
      if (dimensions.height) parts.push(`M:${dimensions.height}`);
      if (dimensions.thickness) parts.push(`V:${dimensions.thickness}`);
      dimensionText = parts.join(" × ") + " cm";
    }

    return `
      <div class="summary-item">
          <span class="summary-item-key">Méret:</span>
          <span class="summary-item-value">${dimensionText}</span>
      </div>`;
  },

  /**
   * Anyagok szakasz - VÁLTOZATLAN
   */
  createMaterialsSection: function (summaryData) {
    const { weights } = summaryData;

    let html = `
      <div class="summary-section">
          <h2 class="collapsible">Anyagok szerinti súlybontás</h2>
          <div class="collapsible-content">`;

    const sortedMaterials = weights.byMaterial
      .filter(material => material.weightKg > 0)
      .sort((a, b) => b.weightKg - a.weightKg);

    sortedMaterials.forEach((material) => {
      const percentage = ((material.weightKg / weights.total.kilograms) * 100).toFixed(1);
      
      html += `
          <div class="summary-item">
              <span class="summary-item-key">${material.name}:</span>
              <span class="summary-item-value">
                  ${material.weightKg.toFixed(2)} kg 
                  <small>(${percentage}%)</small>
              </span>
          </div>`;
    });

    html += `
          <hr style="margin: 15px 0; border: 1px solid #e7e7ec;">
          <div class="summary-item" style="font-weight: 600;">
              <span class="summary-item-key">Összes anyag:</span>
              <span class="summary-item-value">${weights.total.kilograms.toFixed(2)} kg</span>
          </div>`;

    html += `</div></div>`;
    return html;
  },

  /**
   * Collapsible funkció inicializálása
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
   * Summary frissítése
   */
  updateSummary: function (container, summaryData) {
    const scrollPos = container.scrollTop;
    this.renderFullSummary(container, summaryData);
    container.scrollTop = scrollPos;
  },
};

// ÚJ: Globális funkciók a hierarchikus UI-hoz

/**
 * Komponens részletek ki/bekapcsolása
 */
window.toggleComponentDetails = function(componentId, button) {
  const details = document.getElementById(`${componentId}_details`);
  const chevron = button.querySelector('span');
  
  if (details) {
    details.classList.toggle('collapsed');
    button.classList.toggle('collapsed');
    
    // Chevron animáció
    if (details.classList.contains('collapsed')) {
      chevron.style.transform = 'rotate(-90deg)';
    } else {
      chevron.style.transform = 'rotate(0deg)';
    }
  }
};

/**
 * Elem részletek ki/bekapcsolása
 */
window.toggleElementDetails = function(elementId, button) {
  const details = document.getElementById(`${elementId}_details`);
  const chevron = button.querySelector('span');
  
  if (details) {
    details.classList.toggle('collapsed');
    button.classList.toggle('collapsed');
    
    // Chevron animáció
    if (details.classList.contains('collapsed')) {
      chevron.style.transform = 'rotate(-90deg)';
    } else {
      chevron.style.transform = 'rotate(0deg)';
    }
  }
};

/**
 * ÚJ: Komponens szintű láthatóság toggle (összes elem)
 */
window.toggleComponentVisibility = function(componentId, isVisible) {
  console.log(`Komponens láthatóság: ${componentId} -> ${isVisible}`);
  
  // Komponens alatti összes elem toggle
  const componentCard = document.querySelector(`[data-component-id="${componentId}"]`).closest('.component-card');
  const elementTogles = componentCard.querySelectorAll('[data-element-id]');
  
  elementTogles.forEach(toggle => {
    const elementId = toggle.getAttribute('data-element-id');
    
    // Toggle állapot szinkronizálása
    toggle.checked = isVisible;
    
    // 3D scene-ben elem láthatóság
    if (window.toggleElementVisibility) {
      window.toggleElementVisibility(elementId, isVisible);
    }
  });
  
  console.log(`✅ Komponens ${componentId}: ${elementTogles.length} elem ${isVisible ? 'bekapcsolva' : 'kikapcsolva'}`);
};