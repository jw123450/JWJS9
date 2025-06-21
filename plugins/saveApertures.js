/*globals $, JS9 */
(function () {
  "use strict";

  let savedRegions = [];

  const toolbarHTML = `
    <div style="float:right; margin:10px">
      <button class="save_regions_button">Save Apertures</button>
      <button class="load_regions_button" style="margin-left:10px;">Load Apertures</button>
    </div>
  `;

  function updateStatus(msg) {
    this.outerdivjq.find("#statusMessage").text(msg);
  }

  function bindButtons() {
    const $outer = this.outerdivjq;

    // Save Regions
    $outer.find(".save_regions_button").off("click").on("click", () => {
      const display = this.display || JS9.GetDisplay();
      if (!display) {
        updateStatus.call(this, "No display found.");
        return;
      }

      const regions = JS9.GetRegions("all", { format: "object", display });
      if (!regions || regions.length === 0) {
        updateStatus.call(this, "No regions to save.");
        return;
      }

      savedRegions = regions.map(r => ({ ...r })); // deep copy
      updateStatus.call(this, `Saved ${savedRegions.length} apertures(s).`);
    });

    // Load Regions
    $outer.find(".load_regions_button").off("click").on("click", () => {
      const display = this.display || JS9.GetDisplay();
      if (!display) {
        updateStatus.call(this, "No display found.");
        return;
      }

      if (!savedRegions || savedRegions.length === 0) {
        updateStatus.call(this, "No saved apertures to load.");
        return;
      }

      savedRegions.forEach(r => {
        const regCopy = { ...r };
        delete regCopy.id;
        delete regCopy.mode;
        delete regCopy.imstr;
        delete regCopy.wcsstr;
        delete regCopy.lcs;
        delete regCopy.parent;
        delete regCopy.child;
        JS9.AddRegions(regCopy, { display });
      });

      updateStatus.call(this, `Loaded ${savedRegions.length} apertures(s).`);
    });
  }

  function initPlugin() {
    const container = $(this.div)
      .css({ resize: "both", overflow: "auto" })
      .empty();

    const messageDiv = $("<div style='padding:10px;'>Use Save/Load to persist apertures across images.</div>");
    const statusDiv = $("<div id='statusMessage' style='padding: 5px 10px; color: #444; font-weight: bold;'></div>");

    container.append(messageDiv);
    container.append(statusDiv);

    bindButtons.call(this);
  }

  JS9.RegisterPlugin("JW", "RegionManager", initPlugin, {
    menu: "Analysis",
    menuItem: " Save/Load Apertures",
    winTitle: "Save/Load",
    toolbarSeparate: true,
    toolbarHTML: toolbarHTML,
    winDims: [360, 120],
    onregionschange: bindButtons,
    onnewimage: bindButtons
  });
})();
