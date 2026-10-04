// OrthoPic Studio - Core JavaScript Engine
// Locked to exact specifications of "Khung Chỉnh nha.psd" (Nha Khoa Thùy Anh)

// High-resolution Thuy Anh logo is loaded safely from assets/logo_thuyanh_b64.js

// Exact Slot Coordinates from PSD Analysis (1500 x 1061)
const ORTHO_SLOTS = [
  { id: 1, num: "01", name: "Mặt nghiêng phải", category: "face", x: 8, y: 83, w: 365, h: 365, keywords: ["nghieng", "profile", "r_profile", "1", "01"] },
  { id: 2, num: "02", name: "Mặt thẳng nghiêm", category: "face", x: 383, y: 83, w: 360, h: 365, keywords: ["nghiem", "frontal", "resting", "serious", "2", "02"] },
  { id: 3, num: "03", name: "Mặt thẳng cười nhẹ", category: "face", x: 754, y: 83, w: 360, h: 365, keywords: ["cuoi nhe", "smile", "cuoi", "3", "03"] },
  { id: 4, num: "04", name: "Mặt cười lớn / 45°", category: "face", x: 1124, y: 83, w: 365, h: 365, keywords: ["cuoi lon", "45", "oblique", "full_smile", "4", "04"] },
  { id: 5, num: "05", name: "Cung răng hàm trên (chụp gương)", category: "oral", x: 8, y: 456, w: 485, h: 330, keywords: ["ham tren", "tren", "upper", "maxill", "5", "05"] },
  { id: 6, num: "06", name: "Khớp cắn bên phải", category: "oral", x: 8, y: 793, w: 485, h: 254, keywords: ["can phai", "phai", "right", "r_bite", "6", "06"] },
  { id: 7, num: "07", name: "Khớp cắn chính diện", category: "oral", x: 500, y: 456, w: 493, h: 191, keywords: ["chinh dien", "center", "frontal_bite", "7", "07"] },
  { id: 8, num: "08", name: "Khớp cắn mở / rìa cắn", category: "oral", x: 500, y: 657, w: 493, h: 192, keywords: ["can mo", "ria can", "open", "edge", "8", "08"] },
  { id: 9, num: "09", name: "Khớp cắn nhìn từ dưới lên (Overjet)", category: "oral", x: 500, y: 855, w: 493, h: 192, keywords: ["overjet", "duoi len", "ngua", "9", "09"] },
  { id: 10, num: "10", name: "Cung răng hàm dưới (chụp gương)", category: "oral", x: 999, y: 456, w: 490, h: 330, keywords: ["ham duoi", "duoi", "lower", "mandib", "10"] },
  { id: 11, num: "11", name: "Khớp cắn bên trái", category: "oral", x: 999, y: 793, w: 490, h: 254, keywords: ["can trai", "trai", "left", "l_bite", "11"] },
];

class OrthoStudioApp {
  constructor() {
    this.canvas = document.getElementById("mainCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvasWidth = 1500;
    this.canvasHeight = 1061;

    this.slotsConfig = ORTHO_SLOTS;

    // Slot states
    this.slotStates = {};
    this.initSlotStates();

    // Patient info states
    this.patientName = "Nguyễn Hứa Gia Hân";
    this.birthYear = "2015";
    this.examDate = this.getTodayDateFormatted();
    this.bannerColor = "#51A738"; // Exact Thùy Anh green from PSD

    // Logo image
    this.logoImg = new Image();
    this.logoLoaded = false;
    this.loadLogo();

    // Interaction states
    this.activeSlotId = null;
    this.hoverSlotId = null;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.dragInitialPan = { x: 0, y: 0 };
    this.canvasScale = 1.0;

    this.initDOM();
    this.initEvents();
    this.renderSidebarSlots();
    this.fitCanvasToViewport();
    this.render();
  }

  initSlotStates() {
    this.slotStates = {};
    this.slotsConfig.forEach(s => {
      this.slotStates[s.id] = {
        image: null,
        imgName: "",
        zoom: 1.0,
        panX: 0,
        panY: 0,
        rotation: 0,
        flipH: false,
        flipV: false,
        showGuide: false,
        brightness: 0, // -100 to +100
        contrast: 0,   // -100 to +100
        saturate: 0    // -100 to +100
      };
    });
  }

  getTodayDateFormatted() {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, "0");
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const y = now.getFullYear();
    return `${d}.${m}.${y}`;
  }

  loadLogo() {
    this.logoImg.onload = () => {
      this.logoLoaded = true;
      this.render();
    };
    // 100% untainted data URI
    this.logoImg.src = window.LOGO_THUYANH_B64 || (typeof LOGO_THUYANH_B64 !== "undefined" ? LOGO_THUYANH_B64 : "");
  }

  initDOM() {
    document.getElementById("inputPatientName").value = this.patientName;
    document.getElementById("inputBirthYear").value = this.birthYear;
    document.getElementById("inputExamDate").value = this.examDate;
  }

  initEvents() {
    // Real-time input updates
    document.getElementById("inputPatientName").addEventListener("input", (e) => {
      this.patientName = e.target.value.trim();
      this.render();
    });
    document.getElementById("inputBirthYear").addEventListener("input", (e) => {
      this.birthYear = e.target.value.trim();
      this.render();
    });
    document.getElementById("inputExamDate").addEventListener("input", (e) => {
      this.examDate = e.target.value.trim();
      this.render();
    });

    // Today button
    document.getElementById("btnToday").addEventListener("click", () => {
      this.examDate = this.getTodayDateFormatted();
      document.getElementById("inputExamDate").value = this.examDate;
      this.render();
      this.showToast("Đã lấy ngày khám hôm nay!");
    });

    // Multi-file upload button
    const fileInput = document.getElementById("inputMultiPhotos");
    document.getElementById("btnSelectPhotos").addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      this.handleFiles(Array.from(e.target.files));
      fileInput.value = "";
    });

    // Load sample photos button
    document.getElementById("btnLoadSample").addEventListener("click", () => this.loadSamplePhotos());

    // Shortcuts: Ctrl+O and Ctrl+C
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "o") {
        e.preventDefault();
        fileInput.click();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && !window.getSelection().toString()) {
        this.copyToClipboard();
      }
    });

    // Drag & drop onto entire window
    const dragOverlay = document.getElementById("dragOverlay");
    window.addEventListener("dragenter", (e) => {
      e.preventDefault();
      dragOverlay.classList.add("active");
    });
    window.addEventListener("dragover", (e) => e.preventDefault());
    dragOverlay.addEventListener("dragleave", (e) => {
      if (e.relatedTarget === null || e.target === dragOverlay) {
        dragOverlay.classList.remove("active");
      }
    });
    window.addEventListener("drop", (e) => {
      e.preventDefault();
      dragOverlay.classList.remove("active");
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        this.handleFiles(Array.from(e.dataTransfer.files));
      }
    });

    // Clear all photos
    document.getElementById("btnClearAll").addEventListener("click", () => {
      if (confirm("Bạn có chắc chắn muốn xóa toàn bộ ảnh trong các khung?")) {
        this.initSlotStates();
        this.renderSidebarSlots();
        this.render();
        this.hideSlotFloatingBar();
        this.showToast("Đã làm trống tất cả các khung ảnh!");
      }
    });

    // Viewport zoom
    document.getElementById("btnZoomIn").addEventListener("click", () => this.changeCanvasZoom(0.08));
    document.getElementById("btnZoomOut").addEventListener("click", () => this.changeCanvasZoom(-0.08));
    document.getElementById("btnZoomFit").addEventListener("click", () => this.fitCanvasToViewport());

    // Mouse canvas events
    this.canvas.addEventListener("mousemove", (e) => this.onCanvasMouseMove(e));
    this.canvas.addEventListener("mousedown", (e) => this.onCanvasMouseDown(e));
    window.addEventListener("mouseup", () => this.onCanvasMouseUp());
    this.canvas.addEventListener("wheel", (e) => this.onCanvasWheel(e), { passive: false });
    this.canvas.addEventListener("dblclick", (e) => this.onCanvasDblClick(e));

    // Floating toolbar actions
    document.getElementById("btnFloatFlipH").addEventListener("click", () => this.activeSlotAction("flipH"));
    document.getElementById("btnFloatRotateLeft").addEventListener("click", () => this.activeSlotAction("rotateLeft"));
    document.getElementById("btnFloatRotateRight").addEventListener("click", () => this.activeSlotAction("rotateRight"));
    
    // Rotation 0 - 90 degree events
    const sliderRotate = document.getElementById("sliderRotate");
    const inputRotateNum = document.getElementById("inputRotateNum");
    sliderRotate.addEventListener("input", (e) => {
      if (!this.activeSlotId) return;
      const state = this.slotStates[this.activeSlotId];
      if (!state || !state.image) return;
      state.rotation = parseFloat(e.target.value);
      inputRotateNum.value = state.rotation;
      this.render();
    });
    inputRotateNum.addEventListener("input", (e) => {
      if (!this.activeSlotId) return;
      const state = this.slotStates[this.activeSlotId];
      if (!state || !state.image) return;
      const val = parseFloat(e.target.value) || 0;
      state.rotation = val;
      sliderRotate.value = Math.max(-90, Math.min(90, val));
      this.render();
    });
    document.getElementById("btnNudgeRotateLeft").addEventListener("click", () => this.nudgeRotation(-1));
    document.getElementById("btnNudgeRotateRight").addEventListener("click", () => this.nudgeRotation(1));
    document.getElementById("btnResetRotate").addEventListener("click", () => this.setExactRotation(0));

    document.getElementById("btnFloatZoomIn").addEventListener("click", () => this.activeSlotAction("zoomIn"));
    document.getElementById("btnFloatZoomOut").addEventListener("click", () => this.activeSlotAction("zoomOut"));
    document.getElementById("btnFloatGuide").addEventListener("click", () => this.activeSlotAction("toggleGuide"));
    document.getElementById("btnFloatReset").addEventListener("click", () => this.activeSlotAction("reset"));
    document.getElementById("btnFloatClear").addEventListener("click", () => this.activeSlotAction("clear"));

    // Color & brightness panel events
    const btnToggleColor = document.getElementById("btnToggleColorPanel");
    const colorPanel = document.getElementById("slotColorPanel");
    const btnCloseColor = document.getElementById("btnCloseColorPanel");

    btnToggleColor.addEventListener("click", () => {
      if (colorPanel.classList.contains("hidden")) {
        this.openColorPanel();
      } else {
        this.closeColorPanel();
      }
    });

    btnCloseColor.addEventListener("click", () => this.closeColorPanel());

    const sliderBri = document.getElementById("sliderBrightness");
    const sliderCon = document.getElementById("sliderContrast");
    const sliderSat = document.getElementById("sliderSaturate");

    sliderBri.addEventListener("input", (e) => {
      if (!this.activeSlotId) return;
      const state = this.slotStates[this.activeSlotId];
      if (!state || !state.image) return;
      state.brightness = parseInt(e.target.value, 10) || 0;
      document.getElementById("valBrightness").innerText = `${state.brightness > 0 ? "+" : ""}${state.brightness}%`;
      this.render();
    });

    sliderCon.addEventListener("input", (e) => {
      if (!this.activeSlotId) return;
      const state = this.slotStates[this.activeSlotId];
      if (!state || !state.image) return;
      state.contrast = parseInt(e.target.value, 10) || 0;
      document.getElementById("valContrast").innerText = `${state.contrast > 0 ? "+" : ""}${state.contrast}%`;
      this.render();
    });

    sliderSat.addEventListener("input", (e) => {
      if (!this.activeSlotId) return;
      const state = this.slotStates[this.activeSlotId];
      if (!state || !state.image) return;
      state.saturate = parseInt(e.target.value, 10) || 0;
      document.getElementById("valSaturate").innerText = `${state.saturate > 0 ? "+" : ""}${state.saturate}%`;
      this.render();
    });

    document.getElementById("btnResetBrightness").addEventListener("click", () => {
      if (!this.activeSlotId) return;
      const state = this.slotStates[this.activeSlotId];
      if (!state) return;
      state.brightness = 0;
      sliderBri.value = 0;
      document.getElementById("valBrightness").innerText = "0%";
      this.render();
    });

    document.getElementById("btnResetContrast").addEventListener("click", () => {
      if (!this.activeSlotId) return;
      const state = this.slotStates[this.activeSlotId];
      if (!state) return;
      state.contrast = 0;
      sliderCon.value = 0;
      document.getElementById("valContrast").innerText = "0%";
      this.render();
    });

    document.getElementById("btnResetSaturate").addEventListener("click", () => {
      if (!this.activeSlotId) return;
      const state = this.slotStates[this.activeSlotId];
      if (!state) return;
      state.saturate = 0;
      sliderSat.value = 0;
      document.getElementById("valSaturate").innerText = "0%";
      this.render();
    });

    document.getElementById("btnApplyColorAll").addEventListener("click", () => this.applyColorToAll());
    document.getElementById("btnResetColorSlot").addEventListener("click", () => this.resetColorAdjustments());

    // Direct 1-click Download
    const btnDirect = document.getElementById("btnDirectDownload");
    if (btnDirect) {
      btnDirect.addEventListener("click", () => this.doExport(false, 1.0, "png"));
    }

    // Export modal
    document.getElementById("btnOpenExportModal").addEventListener("click", () => this.openExportModal());
    document.getElementById("btnCloseExportModal").addEventListener("click", () => this.closeExportModal());
    document.getElementById("btnDoDownload").addEventListener("click", () => this.doExport(false));
    document.getElementById("btnDoCopy").addEventListener("click", () => this.doExport(true));
    document.getElementById("btnQuickCopy").addEventListener("click", () => this.copyToClipboard());
    const btnNewTab = document.getElementById("btnOpenNewTab");
    if (btnNewTab) {
      btnNewTab.addEventListener("click", () => this.openInNewTab());
    }

    // Modal option selectors
    document.querySelectorAll(".tile-res").forEach(tile => {
      tile.addEventListener("click", () => {
        document.querySelectorAll(".tile-res").forEach(t => t.classList.remove("active"));
        tile.classList.add("active");
      });
    });
    document.querySelectorAll(".tile-fmt").forEach(tile => {
      tile.addEventListener("click", () => {
        document.querySelectorAll(".tile-fmt").forEach(t => t.classList.remove("active"));
        tile.classList.add("active");
      });
    });

    // Fit canvas on load & resize
    window.addEventListener("resize", () => this.fitCanvasToViewport());
  }

  // ================= LOAD SAMPLE DATASET =================
  async loadSamplePhotos() {
    this.showToast("Đang nạp 11 ảnh mẫu từ mẫu bệnh án PSD...");
    let count = 0;
    const promises = this.slotsConfig.map(slot => {
      return new Promise((resolve) => {
        if (typeof SAMPLE_PHOTOS_B64 !== "undefined" && SAMPLE_PHOTOS_B64[slot.id]) {
          const item = SAMPLE_PHOTOS_B64[slot.id];
          const img = new Image();
          img.onload = () => {
            this.setSlotImage(slot.id, img, item.name);
            count++;
            resolve();
          };
          img.onerror = () => resolve();
          img.src = item.b64;
        } else {
          resolve();
        }
      });
    });

    await Promise.all(promises);
    this.renderSidebarSlots();
    this.render();
    this.showToast(`✅ Đã nạp đầy đủ ${count} ảnh mẫu vào khung!`);
  }

  // ================= SMART PHOTO INGESTION =================
  async handleFiles(files) {
    const imgFiles = files.filter(f => f.type.startsWith("image/") || /\.(jpe?g|png|webp|bmp)$/i.test(f.name));
    if (imgFiles.length === 0) {
      this.showToast("Không tìm thấy file ảnh hợp lệ nào!", "error");
      return;
    }

    this.showToast(`Đang phân bổ ${imgFiles.length} ảnh vào khung...`);
    
    const loadedImages = await Promise.all(imgFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => resolve({ img, name: file.name });
          img.onerror = () => resolve(null);
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    }));

    const validImgs = loadedImages.filter(item => item !== null);

    const assignedSlots = new Set();
    const unassignedImgs = [];

    // Pass 1: Number or keyword matching
    validImgs.forEach(item => {
      const cleanName = item.name.toLowerCase().replace(/[-_.]/g, " ");
      let matchedSlot = null;

      const numMatches = item.name.match(/\b([1-9]|10|11)\b/) || item.name.match(/(\d+)/);
      if (numMatches) {
        const numVal = parseInt(numMatches[1], 10);
        if (numVal >= 1 && numVal <= this.slotsConfig.length && !assignedSlots.has(numVal)) {
          matchedSlot = numVal;
        }
      }

      if (!matchedSlot) {
        for (const slot of this.slotsConfig) {
          if (assignedSlots.has(slot.id)) continue;
          for (const kw of slot.keywords) {
            if (cleanName.includes(kw)) {
              matchedSlot = slot.id;
              break;
            }
          }
          if (matchedSlot) break;
        }
      }

      if (matchedSlot) {
        this.setSlotImage(matchedSlot, item.img, item.name);
        assignedSlots.add(matchedSlot);
      } else {
        unassignedImgs.push(item);
      }
    });

    // Pass 2: Sequential fill
    if (unassignedImgs.length > 0) {
      unassignedImgs.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
      for (const slot of this.slotsConfig) {
        if (!assignedSlots.has(slot.id) && unassignedImgs.length > 0) {
          const item = unassignedImgs.shift();
          this.setSlotImage(slot.id, item.img, item.name);
          assignedSlots.add(slot.id);
        }
      }
    }

    this.renderSidebarSlots();
    this.render();
    this.showToast(`Đã tự động chia ảnh vào các khung có sẵn!`);
  }

  setSlotImage(slotId, img, name) {
    const slot = this.slotsConfig.find(s => s.id === slotId);
    if (!slot) return;

    const state = this.slotStates[slotId];
    state.image = img;
    state.imgName = name;
    state.panX = 0;
    state.panY = 0;
    state.rotation = 0;
    state.flipH = false;
    state.flipV = false;
    state.showGuide = false;
    state.brightness = 0;
    state.contrast = 0;
    state.saturate = 0;

    // Cover slot cleanly
    const scaleX = slot.w / img.width;
    const scaleY = slot.h / img.height;
    state.zoom = Math.max(scaleX, scaleY);
  }

  // ================= CANVAS RENDERING =================
  render(targetCtx = this.ctx, targetScale = 1.0) {
    const ctx = targetCtx;

    ctx.save();
    ctx.scale(targetScale, targetScale);

    // 1. Draw Clean White Background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 2. Draw Header (Exact PSD Thùy Anh & Green Banner)
    this.drawHeader(ctx);

    // 3. Draw All 11 Slots
    this.slotsConfig.forEach(slot => {
      this.drawSlot(ctx, slot);
    });

    ctx.restore();
  }

  drawHeader(ctx) {
    // A. Logo Nha Khoa Thùy Anh (Exact from PSD: X: 25, Y: 4, W: 374, H: 71)
    if (this.logoLoaded && this.logoImg) {
      ctx.drawImage(this.logoImg, 25, 4, 374, 71);
    } else {
      ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "#e11d48";
      ctx.fillText("NHA KHOA THÙY ANH", 25, 48);
    }

    // B. Slanted Green Banner (Left top: 779, 10; Left bot: 764, 62; Right: 1488)
    const bannerTop = 10;
    const bannerBottom = 62;
    const bannerRight = 1488;
    const slantTopX = 779;
    const slantBotX = 764;
    const bannerRadius = 6;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(slantTopX, bannerTop);
    ctx.lineTo(bannerRight - bannerRadius, bannerTop);
    ctx.arcTo(bannerRight, bannerTop, bannerRight, bannerTop + bannerRadius, bannerRadius);
    ctx.lineTo(bannerRight, bannerBottom - bannerRadius);
    ctx.arcTo(bannerRight, bannerBottom, bannerRight - bannerRadius, bannerBottom, bannerRadius);
    ctx.lineTo(slantBotX, bannerBottom);
    ctx.closePath();

    ctx.fillStyle = this.bannerColor;
    ctx.fill();

    // Banner Text: [Tên bệnh nhân] - [Năm sinh] - [Ngày khám]
    // Enlarge font and center perfectly inside the green banner
    const bannerText = `${this.patientName || "Bệnh Nhân"} - ${this.birthYear || "Năm Sinh"} - ${this.examDate || "Ngày Khám"}`;

    ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Exact horizontal center of the green polygon: (slant center + right) / 2
    const slantMidX = (slantTopX + slantBotX) / 2; // 771.5
    const centerX = (slantMidX + bannerRight) / 2; // 1129.75
    const centerY = (bannerTop + bannerBottom) / 2; // 36
    ctx.fillText(bannerText, centerX, centerY);

    ctx.restore();
  }

  drawSlot(ctx, slot) {
    const state = this.slotStates[slot.id];
    const isHover = slot.id === this.hoverSlotId;
    const isActive = slot.id === this.activeSlotId;

    ctx.save();

    // Clip to slot rectangle
    ctx.beginPath();
    ctx.rect(slot.x, slot.y, slot.w, slot.h);
    ctx.clip();

    if (state && state.image) {
      // Draw Photo
      ctx.save();
      const centerX = slot.x + slot.w / 2;
      const centerY = slot.y + slot.h / 2;

      ctx.translate(centerX + state.panX, centerY + state.panY);
      ctx.rotate((state.rotation * Math.PI) / 180);
      ctx.scale(state.flipH ? -1 : 1, state.flipV ? -1 : 1);

      // Color adjustments (Brightness, Contrast, Saturation)
      const b = (100 + (state.brightness || 0)) / 100;
      const c = (100 + (state.contrast || 0)) / 100;
      const s = (100 + (state.saturate || 0)) / 100;
      if (b !== 1 || c !== 1 || s !== 1) {
        ctx.filter = `brightness(${b}) contrast(${c}) saturate(${s})`;
      }

      const drawW = state.image.width * state.zoom;
      const drawH = state.image.height * state.zoom;
      ctx.drawImage(state.image, -drawW / 2, -drawH / 2, drawW, drawH);

      ctx.filter = "none";
      ctx.restore();

      // Facial alignment guide line (if toggled)
      if (state.showGuide) {
        ctx.save();
        ctx.strokeStyle = "rgba(59, 130, 246, 0.9)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        const guideY = slot.y + slot.h * 0.42;
        ctx.beginPath();
        ctx.moveTo(slot.x, guideY);
        ctx.lineTo(slot.x + slot.w, guideY);
        ctx.stroke();
        const guideX = slot.x + slot.w * 0.5;
        ctx.beginPath();
        ctx.moveTo(guideX, slot.y);
        ctx.lineTo(guideX, slot.y + slot.h);
        ctx.stroke();
        ctx.restore();
      }
    } else {
      // Draw Placeholder for empty slot
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(slot.x, slot.y, slot.w, slot.h);

      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(slot.x + 3, slot.y + 3, slot.w - 6, slot.h - 6);
      ctx.setLineDash([]);

      ctx.font = "bold 44px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "#cbd5e1";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(slot.num, slot.x + slot.w / 2, slot.y + slot.h / 2 - 16);

      ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.fillText(slot.name, slot.x + slot.w / 2, slot.y + slot.h / 2 + 20);

      ctx.font = "italic 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Nhấp hoặc kéo ảnh vào đây", slot.x + slot.w / 2, slot.y + slot.h / 2 + 40);
    }

    ctx.restore();

    // Selection border
    if (isActive) {
      ctx.save();
      ctx.strokeStyle = this.bannerColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(slot.x, slot.y, slot.w, slot.h);
      ctx.restore();
    } else if (isHover) {
      ctx.save();
      ctx.strokeStyle = "rgba(81, 167, 56, 0.6)";
      ctx.lineWidth = 2;
      ctx.strokeRect(slot.x, slot.y, slot.w, slot.h);
      ctx.restore();
    }
  }

  // ================= MOUSE CONTROLS =================
  getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;
    const scaleX = this.canvasWidth / rect.width;
    const scaleY = this.canvasHeight / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  getSlotAt(x, y) {
    return this.slotsConfig.find(s => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) || null;
  }

  onCanvasMouseMove(e) {
    const coords = this.getCanvasCoords(e);
    const hovered = this.getSlotAt(coords.x, coords.y);

    if (this.isDragging && this.activeSlotId) {
      const state = this.slotStates[this.activeSlotId];
      if (state && state.image) {
        const dx = coords.x - this.dragStart.x;
        const dy = coords.y - this.dragStart.y;
        state.panX = this.dragInitialPan.x + dx;
        state.panY = this.dragInitialPan.y + dy;
        this.render();
      }
      return;
    }

    const newHoverId = hovered ? hovered.id : null;
    if (newHoverId !== this.hoverSlotId) {
      this.hoverSlotId = newHoverId;
      this.canvas.style.cursor = hovered ? (this.slotStates[hovered.id].image ? "grab" : "pointer") : "default";
      this.render();
    }
  }

  onCanvasMouseDown(e) {
    const coords = this.getCanvasCoords(e);
    const clicked = this.getSlotAt(coords.x, coords.y);

    if (clicked) {
      this.activeSlotId = clicked.id;
      const state = this.slotStates[clicked.id];

      if (state && state.image) {
        this.isDragging = true;
        this.dragStart = coords;
        this.dragInitialPan = { x: state.panX, y: state.panY };
        this.canvas.style.cursor = "grabbing";
      } else {
        this.pickImageForSlot(clicked.id);
      }

      this.showSlotFloatingBar(clicked);
      this.renderSidebarSlots();
      this.render();
    } else {
      this.activeSlotId = null;
      this.hideSlotFloatingBar();
      this.renderSidebarSlots();
      this.render();
    }
  }

  onCanvasMouseUp() {
    if (this.isDragging) {
      this.isDragging = false;
      this.canvas.style.cursor = "grab";
    }
  }

  onCanvasWheel(e) {
    const coords = this.getCanvasCoords(e);
    const slot = this.getSlotAt(coords.x, coords.y);

    if (slot && this.slotStates[slot.id].image) {
      e.preventDefault();
      const state = this.slotStates[slot.id];
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const newZoom = Math.max(0.1, Math.min(10.0, state.zoom * zoomFactor));
      state.zoom = newZoom;
      this.render();
    }
  }

  onCanvasDblClick(e) {
    const coords = this.getCanvasCoords(e);
    const slot = this.getSlotAt(coords.x, coords.y);
    if (slot && this.slotStates[slot.id].image) {
      this.activeSlotAction("toggleGuide");
    }
  }

  pickImageForSlot(slotId) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          const img = new Image();
          img.onload = () => {
            this.setSlotImage(slotId, img, file.name);
            this.renderSidebarSlots();
            this.render();
            const slot = this.slotsConfig.find(s => s.id === slotId);
            this.showSlotFloatingBar(slot);
            this.showToast(`Đã thêm ảnh vào ô ${slotId}!`);
          };
          img.src = re.target.result;
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  // ================= ACTIVE SLOT ACTIONS =================
  activeSlotAction(action) {
    if (!this.activeSlotId) return;
    const state = this.slotStates[this.activeSlotId];
    const slot = this.slotsConfig.find(s => s.id === this.activeSlotId);
    if (!state || !slot || !state.image) return;

    switch (action) {
      case "flipH":
        state.flipH = !state.flipH;
        this.showToast(state.flipH ? "Đã lật gương (Mirror Flip)!" : "Đã trả về hướng thường!");
        break;
      case "rotateLeft":
        state.rotation = Math.round((state.rotation - 90) * 10) / 10;
        this.syncRotationUI(state.rotation);
        break;
      case "rotateRight":
        state.rotation = Math.round((state.rotation + 90) * 10) / 10;
        this.syncRotationUI(state.rotation);
        break;
      case "zoomIn":
        state.zoom = Math.min(10.0, state.zoom * 1.15);
        break;
      case "zoomOut":
        state.zoom = Math.max(0.1, state.zoom / 1.15);
        break;
      case "toggleGuide":
        state.showGuide = !state.showGuide;
        break;
      case "reset":
        state.panX = 0;
        state.panY = 0;
        state.rotation = 0;
        state.flipH = false;
        state.flipV = false;
        state.zoom = Math.max(slot.w / state.image.width, slot.h / state.image.height);
        this.syncRotationUI(0);
        this.showToast("Đã đặt lại vị trí và góc nhìn ban đầu!");
        break;
      case "clear":
        state.image = null;
        state.imgName = "";
        this.hideSlotFloatingBar();
        this.renderSidebarSlots();
        this.showToast(`Đã xóa ảnh ô số ${slot.num}!`);
        break;
    }

    this.render();
  }

  syncRotationUI(deg) {
    const slider = document.getElementById("sliderRotate");
    const numInput = document.getElementById("inputRotateNum");
    if (slider) slider.value = Math.max(-90, Math.min(90, deg));
    if (numInput) numInput.value = Math.round(deg * 10) / 10;
  }

  syncColorUI() {
    if (!this.activeSlotId) return;
    const state = this.slotStates[this.activeSlotId];
    if (!state) return;

    const bri = state.brightness || 0;
    const con = state.contrast || 0;
    const sat = state.saturate || 0;

    const sliderBri = document.getElementById("sliderBrightness");
    const sliderCon = document.getElementById("sliderContrast");
    const sliderSat = document.getElementById("sliderSaturate");

    if (sliderBri) sliderBri.value = bri;
    if (sliderCon) sliderCon.value = con;
    if (sliderSat) sliderSat.value = sat;

    const lblBri = document.getElementById("valBrightness");
    const lblCon = document.getElementById("valContrast");
    const lblSat = document.getElementById("valSaturate");

    if (lblBri) lblBri.innerText = `${bri > 0 ? "+" : ""}${bri}%`;
    if (lblCon) lblCon.innerText = `${con > 0 ? "+" : ""}${con}%`;
    if (lblSat) lblSat.innerText = `${sat > 0 ? "+" : ""}${sat}%`;
  }

  openColorPanel() {
    if (!this.activeSlotId) return;
    this.syncColorUI();
    document.getElementById("slotColorPanel").classList.remove("hidden");
  }

  closeColorPanel() {
    document.getElementById("slotColorPanel").classList.add("hidden");
  }

  applyColorToAll() {
    if (!this.activeSlotId) return;
    const srcState = this.slotStates[this.activeSlotId];
    if (!srcState || !srcState.image) {
      this.showToast("Ô hiện tại chưa có ảnh!", "warning");
      return;
    }

    const bri = srcState.brightness || 0;
    const con = srcState.contrast || 0;
    const sat = srcState.saturate || 0;

    let appliedCount = 0;
    this.slotsConfig.forEach(slot => {
      const s = this.slotStates[slot.id];
      if (s && s.image) {
        s.brightness = bri;
        s.contrast = con;
        s.saturate = sat;
        appliedCount++;
      }
    });

    this.render();
    this.showToast(`✅ Đã áp dụng thông số màu (Sáng: ${bri}%, Tương phản: ${con}%, Màu: ${sat}%) cho ${appliedCount} ô ảnh!`);
  }

  resetColorAdjustments() {
    if (!this.activeSlotId) return;
    const state = this.slotStates[this.activeSlotId];
    if (!state) return;

    state.brightness = 0;
    state.contrast = 0;
    state.saturate = 0;
    this.syncColorUI();
    this.render();
    this.showToast("Đã đặt lại màu và ánh sáng gốc!");
  }

  nudgeRotation(delta) {
    if (!this.activeSlotId) return;
    const state = this.slotStates[this.activeSlotId];
    if (!state || !state.image) return;
    state.rotation = Math.round((state.rotation + delta) * 10) / 10;
    this.syncRotationUI(state.rotation);
    this.render();
  }

  setExactRotation(deg) {
    if (!this.activeSlotId) return;
    const state = this.slotStates[this.activeSlotId];
    if (!state || !state.image) return;
    state.rotation = deg;
    this.syncRotationUI(state.rotation);
    this.render();
  }

  showSlotFloatingBar(slot) {
    const bar = document.getElementById("slotFloatBar");
    const label = document.getElementById("floatSlotLabel");
    if (!slot) {
      bar.classList.add("hidden");
      this.closeColorPanel();
      return;
    }
    label.innerText = `Ô ${slot.num}: ${slot.name}`;
    const state = this.slotStates[slot.id];
    if (state) {
      this.syncRotationUI(state.rotation);
      this.syncColorUI();
    }
    bar.classList.remove("hidden");
  }

  hideSlotFloatingBar() {
    document.getElementById("slotFloatBar").classList.add("hidden");
    this.closeColorPanel();
  }

  // ================= SIDEBAR SLOTS =================
  renderSidebarSlots() {
    const list = document.getElementById("slotList");
    list.innerHTML = "";

    this.slotsConfig.forEach(slot => {
      const state = this.slotStates[slot.id];
      const hasImg = state && state.image;
      const isActive = slot.id === this.activeSlotId;

      const row = document.createElement("div");
      row.className = `slot-row ${hasImg ? "has-image" : ""} ${isActive ? "active" : ""}`;
      
      row.innerHTML = `
        <div class="slot-info">
          <div class="slot-badge">${slot.num}</div>
          <div class="slot-name" title="${slot.name}">${slot.name}</div>
        </div>
        <div class="slot-actions">
          ${hasImg ? `
            <button class="slot-btn" title="Lật gương" onclick="window.orthoApp.quickSlotAction(${slot.id}, 'flipH')">🪞</button>
            <button class="slot-btn" title="Xoay 90°" onclick="window.orthoApp.quickSlotAction(${slot.id}, 'rotate')">🔄</button>
            <button class="slot-btn" title="Xóa ảnh" onclick="window.orthoApp.quickSlotAction(${slot.id}, 'clear')">✕</button>
          ` : `
            <button class="slot-btn" title="Chọn ảnh cho ô này" onclick="window.orthoApp.pickImageForSlot(${slot.id})">＋</button>
          `}
        </div>
      `;

      row.addEventListener("click", (e) => {
        if (!e.target.closest(".slot-btn")) {
          this.activeSlotId = slot.id;
          this.showSlotFloatingBar(slot);
          this.renderSidebarSlots();
          this.render();
        }
      });

      list.appendChild(row);
    });
  }

  quickSlotAction(slotId, action) {
    this.activeSlotId = slotId;
    if (action === "flipH") this.activeSlotAction("flipH");
    else if (action === "rotate") this.activeSlotAction("rotateRight");
    else if (action === "clear") this.activeSlotAction("clear");
  }

  // ================= VIEWPORT ZOOM =================
  changeCanvasZoom(delta) {
    this.canvasScale = Math.max(0.25, Math.min(2.0, this.canvasScale + delta));
    this.applyCanvasZoom();
  }

  fitCanvasToViewport() {
    const container = document.getElementById("canvasContainer");
    if (!container) return;
    const pad = 36;
    const availW = container.clientWidth - pad;
    const availH = container.clientHeight - pad;
    if (availW <= 0 || availH <= 0) return;
    const scale = Math.min(availW / this.canvasWidth, availH / this.canvasHeight, 1.0);
    this.canvasScale = Math.max(0.25, Math.min(scale, 1.2));
    this.applyCanvasZoom();
  }

  applyCanvasZoom() {
    const paper = document.getElementById("canvasPaper");
    if (!paper) return;
    paper.style.width = Math.round(this.canvasWidth * this.canvasScale) + "px";
    paper.style.height = Math.round(this.canvasHeight * this.canvasScale) + "px";
    this.updateCanvasZoomDisplay();
  }

  updateCanvasZoomDisplay() {
    const zoomText = document.getElementById("zoomPercentText");
    if (zoomText) {
      zoomText.innerText = `${Math.round(this.canvasScale * 100)}%`;
    }
  }

  // ================= EXPORT ENGINE =================
  getExportFilename(ext = "png") {
    const safeName = (this.patientName || "Benh_Nhan").replace(/[\/\\:*?"<>|]/g, "").trim();
    const safeYear = (this.birthYear || "NamSinh").trim();
    const safeDate = (this.examDate || this.getTodayDateFormatted()).trim();
    return `${safeName} - ${safeYear} - ${safeDate}.${ext}`;
  }

  openExportModal() {
    document.getElementById("exportModal").classList.add("active");
    document.getElementById("previewFilename").innerText = this.getExportFilename("png");
  }

  closeExportModal() {
    document.getElementById("exportModal").classList.remove("active");
  }

  async doExport(copyToClip = false, forcedScale = null, forcedFormat = null) {
    let scale = 1.0;
    if (forcedScale) {
      scale = forcedScale;
    } else {
      const activeRes = document.querySelector(".tile-res.active");
      scale = (activeRes && activeRes.dataset.res === "2x") ? 2.0 : 1.0;
    }

    let format = "png";
    if (forcedFormat) {
      format = forcedFormat;
    } else {
      const activeFmt = document.querySelector(".tile-fmt.active");
      format = (activeFmt && activeFmt.dataset.fmt) ? activeFmt.dataset.fmt : "png";
    }

    const offscreen = document.createElement("canvas");
    offscreen.width = Math.round(this.canvasWidth * scale);
    offscreen.height = Math.round(this.canvasHeight * scale);
    const offCtx = offscreen.getContext("2d");

    this.showToast("Đang chuẩn bị file ảnh...");
    this.render(offCtx, scale);

    const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
    const quality = format === "jpg" ? 0.95 : 1.0;
    const filename = this.getExportFilename(format);

    if (copyToClip) {
      try {
        if (navigator.clipboard && window.ClipboardItem && offscreen.toBlob) {
          offscreen.toBlob(async (blob) => {
            if (blob) {
              try {
                await navigator.clipboard.write([
                  new ClipboardItem({ "image/png": blob })
                ]);
                this.showToast("✅ Đã sao chép ảnh vào Clipboard! Dán (Ctrl+V) ngay vào Zalo/PowerPoint.");
                this.closeExportModal();
                return;
              } catch (e) {
                console.warn("Clipboard failed, falling back to download:", e);
              }
            }
            this.downloadCanvas(offscreen, filename, mimeType, quality);
            this.closeExportModal();
          }, "image/png");
          return;
        }
      } catch (err) {
        console.warn("Clipboard API exception:", err);
      }
      this.downloadCanvas(offscreen, filename, mimeType, quality);
      this.closeExportModal();
    } else {
      this.downloadCanvas(offscreen, filename, mimeType, quality);
      this.showToast(`✅ Đã tải file: ${filename}`);
      this.closeExportModal();
    }
  }

  openInNewTab() {
    const activeRes = document.querySelector(".tile-res.active");
    const is2x = activeRes ? activeRes.dataset.res === "2x" : false;
    const activeFmt = document.querySelector(".tile-fmt.active");
    const format = activeFmt ? activeFmt.dataset.fmt || "png" : "png";
    const scale = is2x ? 2.0 : 1.0;

    const offscreen = document.createElement("canvas");
    offscreen.width = Math.round(this.canvasWidth * scale);
    offscreen.height = Math.round(this.canvasHeight * scale);
    const offCtx = offscreen.getContext("2d");
    this.render(offCtx, scale);

    const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
    const quality = format === "jpg" ? 0.95 : 1.0;
    const dataUrl = offscreen.toDataURL(mimeType, quality);
    const filename = this.getExportFilename(format);

    const win = window.open();
    if (win) {
      win.document.write(`<!DOCTYPE html><html><head><title>${filename}</title><style>body{margin:0;background:#0f172a;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;}img{max-width:96vw;max-height:88vh;object-fit:contain;box-shadow:0 10px 30px rgba(0,0,0,0.6);border-radius:6px;background:#fff;}p{color:#94a3b8;font-size:14px;margin-top:14px;}</style></head><body><img src="${dataUrl}" alt="${filename}"><p>💡 Nhấp chuột phải vào ảnh trên và chọn <b>"Lưu hình ảnh thành..."</b> để tải về máy.</p></body></html>`);
      win.document.close();
      this.closeExportModal();
      this.showToast("Đã mở ảnh trong tab mới!");
    } else {
      this.showToast("Trình duyệt chặn tab mới, đang tải file trực tiếp...", "warning");
      this.downloadCanvas(offscreen, filename, mimeType, quality);
    }
  }

  downloadCanvas(canvas, filename, mimeType = "image/png", quality = 1.0) {
    // 1. Try toBlob (Blob download)
    try {
      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (blob) {
            this.downloadBlob(blob, filename);
          } else {
            this.downloadDataUrl(canvas.toDataURL(mimeType, quality), filename);
          }
        }, mimeType, quality);
        return;
      }
    } catch (e) {
      console.warn("toBlob error, fallback toDataURL:", e);
    }

    // 2. Fallback to Data URL
    try {
      this.downloadDataUrl(canvas.toDataURL(mimeType, quality), filename);
    } catch (err2) {
      console.error("toDataURL error:", err2);
      this.showToast("Không thể tải ảnh: " + err2.message, "error");
    }
  }

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1500);
  }

  downloadDataUrl(dataUrl, filename) {
    const a = document.createElement("a");
    a.style.display = "none";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) document.body.removeChild(a);
    }, 1500);
  }

  async copyToClipboard() {
    const offscreen = document.createElement("canvas");
    offscreen.width = this.canvasWidth;
    offscreen.height = this.canvasHeight;
    const offCtx = offscreen.getContext("2d");
    this.render(offCtx, 1.0);

    const filename = this.getExportFilename("png");
    try {
      if (navigator.clipboard && window.ClipboardItem && offscreen.toBlob) {
        offscreen.toBlob(async (blob) => {
          if (blob) {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob })
              ]);
              this.showToast("✅ Đã sao chép ảnh vào Clipboard! Dán (Ctrl+V) ngay vào Zalo hoặc Powerpoint.");
              return;
            } catch (err) {
              console.warn("Clipboard write error:", err);
            }
          }
          this.downloadCanvas(offscreen, filename, "image/png", 1.0);
          this.showToast("Trình duyệt chặn clipboard. Đã tải file ảnh về máy!", "warning");
        }, "image/png");
        return;
      }
    } catch (e) {
      console.warn("Clipboard error:", e);
    }
    this.downloadCanvas(offscreen, filename, "image/png", 1.0);
    this.showToast("Trình duyệt chặn clipboard. Đã tải file ảnh về máy!", "warning");
  }

  showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast";
    if (type === "error") toast.style.borderLeftColor = "#ef4444";
    else if (type === "warning") toast.style.borderLeftColor = "#f59e0b";
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s";
      setTimeout(() => {
        if (container.contains(toast)) container.removeChild(toast);
      }, 300);
    }, 3200);
  }
}

// Global initialization
window.addEventListener("DOMContentLoaded", () => {
  window.orthoApp = new OrthoStudioApp();
  if (window.location.search.includes("autoload=1")) {
    window.orthoApp.loadSamplePhotos().then(() => {
      if (window.location.search.includes("autoselect=1")) {
        const slot = window.orthoApp.slotsConfig[0];
        window.orthoApp.activeSlotId = slot.id;
        window.orthoApp.slotStates[slot.id].rotation = 12.5;
        window.orthoApp.showSlotFloatingBar(slot);
        if (window.location.search.includes("autocolor=1")) {
          window.orthoApp.openColorPanel();
        }
        window.orthoApp.render();
      }
      if (window.location.search.includes("autoexport=1")) {
        setTimeout(() => {
          window.orthoApp.doExport(false, 1.0, "png");
        }, 600);
      }
    });
  }
});
