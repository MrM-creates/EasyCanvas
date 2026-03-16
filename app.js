document.addEventListener('DOMContentLoaded', () => {
    // Set current year for copyright
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // 1. Initialize Canvas
    const canvas = new fabric.Canvas('design-canvas', {
        backgroundColor: '#ffffff',
        preserveObjectStacking: true // Keep object in place when selected
    });

    // Elements
    const wrapper = document.getElementById('canvas-wrapper');
    const templateSelect = document.getElementById('template-select');
    const sizeHint = document.getElementById('size-hint');
    const customSizeInputs = document.getElementById('custom-size-inputs');
    const customWidthInput = document.getElementById('custom-width');
    const customHeightInput = document.getElementById('custom-height');
    const btnOrientation = document.getElementById('btn-orientation');
    
    const docBgColor = document.getElementById('doc-bg-color');
    const docBgHex = document.getElementById('doc-bg-hex');
    
    // Panels
    const panelDocument = document.getElementById('panel-document');
    const panelObject = document.getElementById('panel-object');
    
    // Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const layersList = document.getElementById('layers-list');

    // Object Properties Elements
    const objFillColor = document.getElementById('obj-fill-color');
    const objFillHex = document.getElementById('obj-fill-hex');
    const objOpacity = document.getElementById('obj-opacity');
    const objOpacityVal = document.getElementById('obj-opacity-val');
    const propFontFamily = document.getElementById('prop-font-family');
    const objFontFamily = document.getElementById('obj-font-family');
    const propStrokeWidth = document.getElementById('prop-stroke-width');
    const objStrokeWidth = document.getElementById('obj-stroke-width');
    const objStrokeWidthVal = document.getElementById('obj-stroke-width-val');

    // Default Size (Instagram Post)
    const templates = {
        '1080x1080': { w: 1080, h: 1080 },
        '1080x1920': { w: 1080, h: 1920 },
        '1920x1080': { w: 1920, h: 1080 },
        '794x1123': { w: 794, h: 1123 },
        '800x600': { w: 800, h: 600 }
    };

    let currentScale = 1;

    // 2. Responsive Canvas Sizing (visual scale)
    function resizeCanvasVisual() {
        // Find outer wrapper boundaries minus padding
        const outerWidth = wrapper.parentElement.clientWidth - 80;
        const outerHeight = wrapper.parentElement.clientHeight - 80;
        
        const scaleX = outerWidth / canvas.getWidth();
        const scaleY = outerHeight / canvas.getHeight();
        
        // Fit canvas nicely while preserving aspect ratio, no larger than actual pixels
        currentScale = Math.min(scaleX, scaleY, 1); 
        
        wrapper.style.transform = `scale(${currentScale})`;
    }

    function setCanvasSize(width, height) {
        canvas.setWidth(width);
        canvas.setHeight(height);
        wrapper.style.width = width + 'px';
        wrapper.style.height = height + 'px';
        canvas.renderAll();
        resizeCanvasVisual();
    }

    // Set initial size
    setCanvasSize(1080, 1080);
    window.addEventListener('resize', resizeCanvasVisual);

    // Template Change & Custom Size Logic
    templateSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'custom') {
            sizeHint.classList.add('hidden');
            customSizeInputs.classList.remove('hidden');
            setCanvasSize(parseInt(customWidthInput.value), parseInt(customHeightInput.value));
        } else {
            sizeHint.classList.remove('hidden');
            customSizeInputs.classList.add('hidden');
            const [w, h] = val.split('x').map(Number);
            setCanvasSize(w, h);
            sizeHint.textContent = `${w} x ${h} px`;
        }
    });

    customWidthInput.addEventListener('change', (e) => {
        if (templateSelect.value === 'custom') {
            setCanvasSize(parseInt(e.target.value) || 800, parseInt(customHeightInput.value));
        }
    });

    customHeightInput.addEventListener('change', (e) => {
        if (templateSelect.value === 'custom') {
            setCanvasSize(parseInt(customWidthInput.value), parseInt(e.target.value) || 600);
        }
    });

    // Orientation Toggle
    btnOrientation.addEventListener('click', () => {
        const currentW = canvas.getWidth();
        const currentH = canvas.getHeight();
        
        // Swap width and height
        setCanvasSize(currentH, currentW);

        // Update UI labels if it's a fixed template
        if (templateSelect.value !== 'custom') {
            sizeHint.textContent = `${currentH} x ${currentW} px`;
            // Note: the dropdown value won't perfectly match anymore, but the visual hint is correct.
        } else {
            customWidthInput.value = currentH;
            customHeightInput.value = currentW;
        }
    });

    // 3. Document Background Color
    docBgColor.addEventListener('input', (e) => {
        const val = e.target.value;
        docBgHex.textContent = val.toUpperCase();
        canvas.backgroundColor = val;
        canvas.renderAll();
    });

    // 4. Adding Shapes / Text
    function centerObject(obj) {
        canvas.add(obj);
        canvas.centerObject(obj);
        canvas.setActiveObject(obj);
        canvas.renderAll();
        renderLayersList();
    }

    document.getElementById('add-rect').addEventListener('click', () => {
        const rect = new fabric.Rect({
            width: 200, height: 200, fill: '#3b82f6', rx: 10, ry: 10,
            name: 'Rectangle'
        });
        centerObject(rect);
    });

    document.getElementById('add-circle').addEventListener('click', () => {
        const circle = new fabric.Circle({
            radius: 100, fill: '#f43f5e',
            name: 'Circle'
        });
        centerObject(circle);
    });

    document.getElementById('add-triangle').addEventListener('click', () => {
        const triangle = new fabric.Triangle({
            width: 200, height: 200, fill: '#10b981',
            name: 'Triangle'
        });
        centerObject(triangle);
    });

    document.getElementById('add-star').addEventListener('click', () => {
        // Create a 5-point star path
        const star = new fabric.Polygon([
            {x: 100, y: 0},
            {x: 130, y: 60},
            {x: 195, y: 70},
            {x: 147, y: 117},
            {x: 158, y: 181},
            {x: 100, y: 150},
            {x: 42, y: 181},
            {x: 53, y: 117},
            {x: 5, y: 70},
            {x: 70, y: 60}
        ], {
            fill: '#f59e0b',
            left: 0, top: 0,
            name: 'Star'
        });
        centerObject(star);
    });

    document.getElementById('add-polygon').addEventListener('click', () => {
        const hex = new fabric.Polygon([
            {x: 100, y: 0},
            {x: 200, y: 50},
            {x: 200, y: 150},
            {x: 100, y: 200},
            {x: 0, y: 150},
            {x: 0, y: 50}
        ], {
            fill: '#8b5cf6',
            left: 0, top: 0,
            name: 'Polygon'
        });
        centerObject(hex);
    });

    document.getElementById('add-line').addEventListener('click', () => {
        const line = new fabric.Line([50, 50, 250, 50], {
            stroke: '#1e293b',
            strokeWidth: 4,
            selectable: true,
            hasControls: true,
            hasBorders: true,
            padding: 10, // Easier to grab
            name: 'Line'
        });
        centerObject(line);
    });

    document.getElementById('add-arrow').addEventListener('click', () => {
        // Simple arrow representation using polygon or line+triangle. 
        // For simplicity in Vanilla fabric, we use a custom path.
        const arrow = new fabric.Path('M 0 10 L 150 10 M 140 0 L 160 10 L 140 20 Z', {
            fill: 'transparent',
            stroke: '#1e293b',
            strokeWidth: 4,
            selectable: true,
            padding: 10,
            name: 'Arrow'
        });
        // We need to set fill of triangle part, we can just stroke everything for now
        arrow.set({fill: '#1e293b', strokeWidth: 2});
        centerObject(arrow);
    });

    document.getElementById('add-text-h1').addEventListener('click', () => {
        const text = new fabric.IText('Heading Text', {
            fontFamily: 'Inter', fontSize: 80, fill: '#1e293b', fontWeight: 700,
            name: 'Heading'
        });
        centerObject(text);
    });

    document.getElementById('add-text-p').addEventListener('click', () => {
        const text = new fabric.IText('Double click to edit body text. \nYou can add multiple lines here.', {
            fontFamily: 'Inter', fontSize: 32, fill: '#475569',
            name: 'Body Text'
        });
        centerObject(text);
    });

    // 5. Selection Handling & UI Updates
    function updatePropertiesPanel() {
        const activeObj = canvas.getActiveObject();
        
        if (activeObj) {
            panelDocument.classList.add('hidden');
            panelObject.classList.remove('hidden');

            // Fill Color / Stroke Color logic
            const colorTarget = activeObj.type === 'line' || activeObj.type === 'path' ? 'stroke' : 'fill';
            const colorVal = activeObj[colorTarget];

            if (colorVal && typeof colorVal === 'string') {
                objFillColor.value = colorVal;
                objFillHex.textContent = colorVal.toUpperCase();
            } else {
                objFillHex.textContent = 'MIXED';
            }

            // Opacity
            objOpacity.value = activeObj.opacity || 1;
            objOpacityVal.textContent = Math.round((activeObj.opacity || 1) * 100) + '%';

            // Text specific
            if (activeObj.type === 'i-text' || activeObj.type === 'text') {
                propFontFamily.classList.remove('hidden');
                objFontFamily.value = activeObj.fontFamily;
            } else {
                propFontFamily.classList.add('hidden');
            }

            // Line / Stroke width specific
            if (activeObj.type === 'line' || activeObj.type === 'path') {
                propStrokeWidth.classList.remove('hidden');
                objStrokeWidth.value = activeObj.strokeWidth || 1;
                objStrokeWidthVal.textContent = (activeObj.strokeWidth || 1) + 'px';
            } else {
                propStrokeWidth.classList.add('hidden');
            }
            
        } else {
            panelDocument.classList.remove('hidden');
            panelObject.classList.add('hidden');
        }
        renderLayersList(); // update active state in layers
    }

    canvas.on('selection:created', updatePropertiesPanel);
    canvas.on('selection:updated', updatePropertiesPanel);
    canvas.on('selection:cleared', updatePropertiesPanel);

    // 6. Object Properties Updates
    objFillColor.addEventListener('input', (e) => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            const val = e.target.value;
            objFillHex.textContent = val.toUpperCase();
            if (activeObj.type === 'line' || activeObj.type === 'path') {
                 activeObj.set('stroke', val);
                 if (activeObj.type === 'path') activeObj.set('fill', val);
            } else {
                 activeObj.set('fill', val);
            }
            canvas.renderAll();
        }
    });

    objOpacity.addEventListener('input', (e) => {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
            const val = parseFloat(e.target.value);
            objOpacityVal.textContent = Math.round(val * 100) + '%';
            activeObj.set('opacity', val);
            canvas.renderAll();
        }
    });

    objFontFamily.addEventListener('change', (e) => {
        const activeObj = canvas.getActiveObject();
        if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
            activeObj.set('fontFamily', e.target.value);
            canvas.renderAll();
        }
    });

    objStrokeWidth.addEventListener('input', (e) => {
        const activeObj = canvas.getActiveObject();
        if (activeObj && (activeObj.type === 'line' || activeObj.type === 'path')) {
             const val = parseInt(e.target.value);
             objStrokeWidthVal.textContent = val + 'px';
             activeObj.set('strokeWidth', val);
             canvas.renderAll();
        }
    });

    // Delete handling
    function deleteSelected() {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length) {
            canvas.discardActiveObject();
            activeObjects.forEach(obj => canvas.remove(obj));
            renderLayersList();
        }
    }

    document.getElementById('btn-delete').addEventListener('click', deleteSelected);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            // Prevent deletion if editing text
            const activeObj = canvas.getActiveObject();
            if (activeObj && activeObj.isEditing) return;
            // Also ignore if focusing on input fields
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
            
            deleteSelected();
        }
    });

    // 7. Tabs Logic
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
             // Remove active from all
             tabBtns.forEach(b => b.classList.remove('active'));
             tabContents.forEach(c => c.classList.add('hidden'));
             
             // Add active to current
             btn.classList.add('active');
             document.getElementById(btn.dataset.tab).classList.remove('hidden');
        });
    });

    // 8. Layers Panel Logic
    function renderLayersList() {
        layersList.innerHTML = '';
        const objects = canvas.getObjects();
        const activeObj = canvas.getActiveObject();
        
        // Loop backwards to show top objects first in the list
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            const isActive = obj === activeObj;
            
            let iconSvg = '<svg class="layer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>';
            let name = obj.name || (obj.type.charAt(0).toUpperCase() + obj.type.slice(1));
            
            if (obj.type === 'i-text' || obj.type === 'text') {
                iconSvg = '<svg class="layer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>';
                const textStr = obj.text || 'Text';
                name = obj.name ? obj.name : `Text: ${textStr.substring(0, 10)}${textStr.length > 10 ? '...' : ''}`;
            } else if (obj.type === 'image') {
                iconSvg = '<svg class="layer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                name = obj.name || 'Image';
            } else if (obj.type === 'circle') {
                iconSvg = '<svg class="layer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>';
            }

            const el = document.createElement('div');
            // Need to set class directly because classList fails on some older constructs or SVGs if improperly mixed, but normal div is fine.
            el.className = `layer-item ${isActive ? 'active' : ''}`;
            el.setAttribute('draggable', 'true');
            el.innerHTML = `
                <div class="layer-info" title="Select Element">
                    ${iconSvg}
                    <span class="layer-name">${name}</span>
                </div>
                <div class="layer-actions">
                    <button class="layer-btn visibility-btn" title="Toggle Visibility">
                        ${obj.visible === false 
                            ? '<svg class="layer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>'
                            : '<svg class="layer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>'}
                    </button>
                    ${i < objects.length - 1 ? `<button class="layer-btn up-btn" title="Move Up"><svg class="layer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg></button>` : ''}
                    ${i > 0 ? `<button class="layer-btn down-btn" title="Move Down"><svg class="layer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg></button>` : ''}
                </div>
            `;

            // Select on click
            el.querySelector('.layer-info').addEventListener('click', () => {
                canvas.setActiveObject(obj);
                canvas.renderAll();
            });

            // Visibility toggle
            el.querySelector('.visibility-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                obj.set('visible', (obj.visible === false) ? true : false);
                canvas.renderAll();
                renderLayersList();
            });

            // Move Up
            const upBtn = el.querySelector('.up-btn');
            if (upBtn) {
                upBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    obj.bringForward();
                    canvas.renderAll();
                    renderLayersList();
                });
            }

            // Move Down
            const downBtn = el.querySelector('.down-btn');
            if (downBtn) {
                downBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    obj.sendBackwards();
                    canvas.renderAll();
                    renderLayersList();
                });
            }

            // Drag and Drop implementation
            el.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', i);
                e.dataTransfer.effectAllowed = 'move';
                el.classList.add('dragging');
            });

            el.addEventListener('dragend', () => {
                el.classList.remove('dragging');
                document.querySelectorAll('.layer-item').forEach(item => {
                    item.classList.remove('drag-over-top', 'drag-over-bottom');
                });
            });

            el.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                const bounding = el.getBoundingClientRect();
                const offset = bounding.y + (bounding.height / 2);
                if (e.clientY < offset) {
                    el.classList.add('drag-over-top');
                    el.classList.remove('drag-over-bottom');
                } else {
                    el.classList.add('drag-over-bottom');
                    el.classList.remove('drag-over-top');
                }
            });

            el.addEventListener('dragleave', () => {
                el.classList.remove('drag-over-top', 'drag-over-bottom');
            });

            el.addEventListener('drop', (e) => {
                e.preventDefault();
                el.classList.remove('drag-over-top', 'drag-over-bottom');
                
                const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
                if (dragIndex !== i && !isNaN(dragIndex)) {
                     const dragObj = objects[dragIndex];
                     canvas.moveTo(dragObj, i);
                     canvas.renderAll();
                     renderLayersList();
                }
            });

            layersList.appendChild(el);
        }
    }

    // Refresh layers on changes
    canvas.on('object:modified', renderLayersList);
    canvas.on('object:added', renderLayersList);
    canvas.on('object:removed', renderLayersList);

    // 9. Export functionality
    document.getElementById('btn-export').addEventListener('click', () => {
        canvas.discardActiveObject();
        canvas.renderAll();
        
        let multiplier = 1;
        const qualitySelect = document.getElementById('export-quality');
        if (qualitySelect) {
            multiplier = parseInt(qualitySelect.value) || 1;
        }
        
        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: multiplier // Scales the final output pixel density
        });
        
        const link = document.createElement('a');
        link.download = `design-export-${Date.now()}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // 10. Image Upload & Drag Drop
    function addImageToCanvas(url) {
        fabric.Image.fromURL(url, function(img) {
            // scale down if too big
            if (img.width > canvas.getWidth() * 0.8) {
                img.scaleToWidth(canvas.getWidth() * 0.8);
            }
            centerObject(img);
        }, { crossOrigin: 'anonymous' });
    }

    document.getElementById('btn-upload-img').addEventListener('click', () => {
         document.getElementById('img-input').click();
    });

    document.getElementById('img-input').addEventListener('change', (e) => {
         if (e.target.files && e.target.files[0]) {
             const reader = new FileReader();
             reader.onload = (f) => addImageToCanvas(f.target.result);
             reader.readAsDataURL(e.target.files[0]);
         }
    });

    // Handle Drag & Drop over canvas wrapper
    wrapper.addEventListener('dragover', (e) => {
         e.preventDefault();
         wrapper.style.border = '2px dashed var(--accent)';
    });
    wrapper.addEventListener('dragleave', (e) => {
         e.preventDefault();
         wrapper.style.border = 'none';
    });
    wrapper.addEventListener('drop', (e) => {
         e.preventDefault();
         wrapper.style.border = 'none';
         if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              const file = e.dataTransfer.files[0];
              if (file.type.match('image.*')) {
                   const reader = new FileReader();
                   reader.onload = (f) => addImageToCanvas(f.target.result);
                   reader.readAsDataURL(file);
              }
         }
    });

    // 11. File IO (Save/Load Project)
    document.getElementById('btn-new').addEventListener('click', () => {
         if (confirm("Are you sure you want to clear the canvas? All unsaved work will be lost.")) {
              canvas.clear();
              canvas.backgroundColor = docBgColor.value; // restore default
              canvas.renderAll();
              renderLayersList();
         }
    });

    document.getElementById('btn-save').addEventListener('click', () => {
         const json = canvas.toJSON(['width', 'height']); // ensure dimensions are included
         const jsonStr = JSON.stringify(json);
         const blob = new Blob([jsonStr], {type: "application/json"});
         const url = URL.createObjectURL(blob);
         
         const a = document.createElement('a');
         a.href = url;
         a.download = `my-design-${Date.now()}.ccdesign`;
         a.click();
         URL.revokeObjectURL(url);
    });

    document.getElementById('btn-open').addEventListener('click', () => {
         document.getElementById('file-input').click();
    });

    document.getElementById('file-input').addEventListener('change', (e) => {
         if (e.target.files && e.target.files[0]) {
              const reader = new FileReader();
              reader.onload = (f) => {
                   try {
                        const json = JSON.parse(f.target.result);
                        canvas.loadFromJSON(json, () => {
                             // Fix dimensions from loaded template
                             if (json.width && json.height) {
                                  setCanvasSize(json.width, json.height);
                             } else {
                                  // Re-calculate size if not available
                                  canvas.renderAll();
                             }
                             // Sync background picker
                             if (canvas.backgroundColor && typeof canvas.backgroundColor === 'string') {
                                  docBgColor.value = canvas.backgroundColor;
                                  docBgHex.textContent = canvas.backgroundColor.toUpperCase();
                             }
                             renderLayersList();
                             updatePropertiesPanel();
                        });
                   } catch (err) {
                        alert("Error loading project file.");
                        console.error(err);
                   }
              };
              reader.readAsText(e.target.files[0]);
         }
    });

    // 12. Printing
    document.getElementById('btn-print').addEventListener('click', () => {
         window.print();
    });
});
