document.addEventListener('DOMContentLoaded', function() {
    // Add loading state management
    const loadingStates = new Map();

    function setLoading(button, loading) {
        if (loading) {
            loadingStates.set(button, button.textContent);
            button.textContent = 'Processing...';
            button.disabled = true;
            button.style.opacity = '0.7';
        } else {
            button.textContent = loadingStates.get(button) || button.textContent;
            button.disabled = false;
            button.style.opacity = '1';
            loadingStates.delete(button);
        }
    }

    // Enhanced button feedback
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON') {
            const button = e.target;
            button.style.transform = 'scale(0.98)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
        }
    });

    // Smooth scrolling for navigation
    document.querySelectorAll('button[data-tab]').forEach(btn => {
        btn.addEventListener('click', function() {
            const target = document.getElementById(this.dataset.tab + '-tab');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Add success animations
    function showSuccess(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--success-color), var(--accent-color));
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: var(--glow);
            z-index: 1000;
            animation: slideInRight 0.5s ease-out;
            font-weight: 600;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-in';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S to save current model
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (currentModel) {
                updateModelBtn.click();
            } else {
                saveNewModelBtn.click();
            }
        }

        // Ctrl/Cmd + E to export
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportDataBtn.click();
        }

        // Ctrl/Cmd + I to import
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            importDataBtn.click();
        }

        // Tab navigation
        if (e.key === 'Tab') {
            const tabs = Array.from(document.querySelectorAll('.tab-button'));
            const activeTab = document.querySelector('.tab-button.active');
            const currentIndex = tabs.indexOf(activeTab);

            if (e.shiftKey) {
                // Previous tab
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                tabs[prevIndex].click();
            } else {
                // Next tab
                const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                tabs[nextIndex].click();
            }
            e.preventDefault();
        }
    });

    // Add tooltip for keyboard shortcuts
    const tooltip = document.createElement('div');
    tooltip.id = 'keyboard-tooltip';
    tooltip.innerHTML = `
        <div style="position: fixed; bottom: 20px; left: 20px; background: var(--card-bg); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 8px; padding: 1rem; font-size: 0.85rem; color: var(--neutral-text); z-index: 1000; backdrop-filter: blur(10px); display: none;">
            <strong>Keyboard Shortcuts:</strong><br>
            Ctrl+S: Save Model<br>
            Ctrl+E: Export Data<br>
            Ctrl+I: Import Data<br>
            Tab: Switch Tabs
        </div>
    `;
    document.body.appendChild(tooltip);

    let tooltipTimeout;
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            clearTimeout(tooltipTimeout);
            tooltip.style.display = 'block';
            tooltipTimeout = setTimeout(() => {
                tooltip.style.display = 'none';
            }, 3000);
        }
    });
    const powerBudgetBtn = document.getElementById('power-budget-btn');
    const linkBudgetBtn = document.getElementById('link-budget-btn');
    const powerSection = document.getElementById('power-budget-section');
    const linkSection = document.getElementById('link-budget-section');
    const powerTableBody = document.getElementById('power-budget-table').querySelector('tbody');
    const totalPowerDiv = document.getElementById('total-power');

    const linkForm = document.getElementById('link-budget-form');
    const linkResults = document.getElementById('link-budget-results');

    const libraryForm = document.getElementById('library-form');
    const libraryList = document.getElementById('library-list');
    const addModeGlobalBtn = document.getElementById('add-mode-global');
    const copyFrom = document.getElementById('copy-from');
    const modesList = document.getElementById('modes-list');
    const componentModes = document.getElementById('component-modes');
    const tableHead = document.getElementById('table-head');
    const modeTotals = document.getElementById('mode-totals');

    const modelForm = document.getElementById('model-form');
    const modelList = document.getElementById('model-list');

    // Budget navigation
    powerBudgetBtn.addEventListener('click', function() {
        powerSection.classList.remove('hidden');
        linkSection.classList.add('hidden');
        powerBudgetBtn.classList.add('active');
        linkBudgetBtn.classList.remove('active');
    });

    linkBudgetBtn.addEventListener('click', function() {
        powerSection.classList.add('hidden');
        linkSection.classList.remove('hidden');
        powerBudgetBtn.classList.remove('active');
        linkBudgetBtn.classList.add('active');
    });

    // Model Form
    modelForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('component-name').value;
        const modelNumber = document.getElementById('model-model').value;
        const voltage = parseFloat(document.getElementById('model-voltage').value);
        const current = parseFloat(document.getElementById('model-current').value);
        if (name && !isNaN(voltage) && !isNaN(current)) {
            components.push({ name, modelNumber, voltage, current });
            saveComponents();
            updateModelList();
            updatePowerTable();
            window.updateTotalPower();
            modelForm.reset();
        }
    });

    function updateModelList() {
        modelList.innerHTML = components.map((comp, i) => `<li>${comp.name} (${comp.modelNumber || 'N/A'}) (${comp.voltage}V, ${comp.current}A) <button onclick="removeModelComponent(${i})">Remove</button></li>`).join('');
    }

    const saveNewModelBtn = document.getElementById('save-new-model');
    const updateModelBtn = document.getElementById('update-model');
    const loadSelectedModelBtn = document.getElementById('load-selected-model');
    const loadModelSelect = document.getElementById('load-model');
    const currentModelInfo = document.getElementById('current-model-info');
    const calculateBatteryBtn = document.getElementById('calculate-battery');
    const batteryResults = document.getElementById('battery-results');
    const clearAllDataBtn = document.getElementById('clear-all-data');
    const exportDataBtn = document.getElementById('export-data');
    const importDataBtn = document.getElementById('import-data');
    const importFileInput = document.getElementById('import-file');

    let currentModel = null;

    let globalComponents = [];
    let components = [];
    let modes = [];
    let totalPower = 0;

    // START WITH CLEAN STATE - Don't auto-load from localStorage
    // Users must explicitly load a saved model or import data

    function saveGlobalComponents() {
        localStorage.setItem('globalComponents', JSON.stringify(globalComponents));
    }

    function saveComponents() {
        localStorage.setItem('components', JSON.stringify(components));
    }

    function saveModes() {
        localStorage.setItem('modes', JSON.stringify(modes.map(mode => ({ ...mode, activeComponents: Array.from(mode.activeComponents) }))));
    }
    calculateBatteryBtn.addEventListener('click', function() {
        const dod = parseFloat(document.getElementById('dod').value) / 100;
        const efficiency = parseFloat(document.getElementById('efficiency').value) / 100;
        const busVoltage = parseFloat(document.getElementById('bus-voltage').value);
        const totalEnergy = window.totalEnergy || 0;

        if (dod > 0 && efficiency > 0 && busVoltage > 0) {
            const requiredCapacityAh = totalEnergy / (busVoltage * dod * efficiency);
            const requiredCapacityWh = requiredCapacityAh * busVoltage;

            batteryResults.innerHTML = `
                <h4>Battery Capacity Requirements</h4>
                <p>Total Energy per Cycle: ${totalEnergy.toFixed(2)} Wh</p>
                <p>Required Capacity: ${requiredCapacityAh.toFixed(2)} Ah at ${busVoltage}V</p>
                <p>Equivalent: ${requiredCapacityWh.toFixed(2)} Wh</p>
            `;
        } else {
            batteryResults.innerHTML = '<p>Please enter valid battery parameters.</p>';
        }
    });

    // Model management
    function loadModelList() {
        loadModelSelect.innerHTML = '<option value="">Select a model</option>';
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('model_')) {
                const name = key.slice(6);
                loadModelSelect.innerHTML += `<option value="${name}">${name}</option>`;
            }
        }
    }

    loadModelList();

    // Save as new model
    saveNewModelBtn.addEventListener('click', function() {
        const name = document.getElementById('model-name').value.trim();
        const desc = document.getElementById('model-desc').value.trim();
        if (name) {
            const modelData = {
                name,
                desc,
                components
            };
            localStorage.setItem('model_' + name, JSON.stringify(modelData));
            currentModel = name;
            updateCurrentModelInfo();
            loadModelList();
            alert('Model saved!');
        } else {
            alert('Please enter a model name.');
        }
    });

    // Update current model
    updateModelBtn.addEventListener('click', function() {
        if (currentModel) {
            const desc = document.getElementById('model-desc').value.trim();
            const modelData = {
                name: currentModel,
                desc,
                components
            };
            localStorage.setItem('model_' + currentModel, JSON.stringify(modelData));
            alert('Model updated!');
        } else {
            alert('No current model to update.');
        }
    });

    // Load selected model
    loadSelectedModelBtn.addEventListener('click', function() {
        const name = loadModelSelect.value;
        if (name) {
            const modelStr = localStorage.getItem('model_' + name);
            if (modelStr) {
                try {
                    const modelData = JSON.parse(modelStr);
                    components = modelData.components || [];
                    currentModel = name;
                    document.getElementById('model-name').value = name;
                    document.getElementById('model-desc').value = modelData.desc || '';
                    updateCurrentModelInfo();
                    updateLibraryList();
                    updateModelList();
                    updateModesList();
                    updateTableHeader();
                    updatePowerTable();
                    window.updateTotalPower();
                    alert('Model loaded!');
                } catch (e) {
                    alert('Error loading model.');
                }
            }
        }
    });

    function updateCurrentModelInfo() {
        if (currentModel) {
            currentModelInfo.innerHTML = `<p><strong>Current Model:</strong> ${currentModel}</p>`;
        } else {
            currentModelInfo.innerHTML = '<p>No model loaded.</p>';
        }
    }

    updateCurrentModelInfo();

    // Export Data
    exportDataBtn.addEventListener('click', function() {
        setLoading(exportDataBtn, true);

        setTimeout(() => {
            const exportData = {
                currentModel,
                globalComponents,
                components,
                modes: modes.map(mode => ({
                    ...mode,
                    activeComponents: Array.from(mode.activeComponents)
                })),
                modelName: document.getElementById('model-name').value,
                modelDesc: document.getElementById('model-desc').value,
                dod: document.getElementById('dod').value,
                efficiency: document.getElementById('efficiency').value,
                busVoltage: document.getElementById('bus-voltage').value,
                exportDate: new Date().toISOString()
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `surge-project-${currentModel || 'untitled'}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setLoading(exportDataBtn, false);
            showSuccess('Data exported successfully!');
        }, 500); // Simulate processing time
    });

    // Import Data
    importDataBtn.addEventListener('click', function() {
        importFileInput.click();
    });

    importFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            setLoading(importDataBtn, true);

            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const importedData = JSON.parse(event.target.result);

                    // Validate structure
                    if (!importedData.globalComponents || !importedData.components || !importedData.modes) {
                        throw new Error('Invalid file format');
                    }

                    // Load the data
                    globalComponents = importedData.globalComponents || [];
                    components = importedData.components || [];
                    modes = (importedData.modes || []).map(mode => ({
                        ...mode,
                        activeComponents: new Set(mode.activeComponents || [])
                    }));
                    currentModel = importedData.currentModel || null;

                    // Restore form values
                    if (importedData.modelName) document.getElementById('model-name').value = importedData.modelName;
                    if (importedData.modelDesc) document.getElementById('model-desc').value = importedData.modelDesc;
                    if (importedData.dod) document.getElementById('dod').value = importedData.dod;
                    if (importedData.efficiency) document.getElementById('efficiency').value = importedData.efficiency;
                    if (importedData.busVoltage) document.getElementById('bus-voltage').value = importedData.busVoltage;

                    // Save to localStorage
                    saveGlobalComponents();
                    saveComponents();
                    saveModes();

                    // Update UI
                    updateCurrentModelInfo();
                    updateLibraryList();
                    updateModelList();
                    updateModesList();
                    updateTableHeader();
                    updatePowerTable();
                    window.updateTotalPower();
                    loadModelList();

                    setLoading(importDataBtn, false);
                    showSuccess('Data imported successfully!');
                } catch (error) {
                    console.error('Import error:', error);
                    setLoading(importDataBtn, false);
                    alert('Error importing file. Make sure it\'s a valid SURGE project file.');
                }
            };
            reader.readAsText(file);
        }
        // Reset input
        importFileInput.value = '';
    });

    // Clear All Data
    clearAllDataBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear ALL data? This will delete all saved models, components, and modes. This action cannot be undone!')) {
            // Clear all localStorage data - try multiple methods
            localStorage.clear();
            
            // Also explicitly remove known keys
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('model_') || key === 'globalComponents' || key === 'components' || key === 'modes')) {
                    localStorage.removeItem(key);
                }
            }
            
            // Reset all arrays
            globalComponents = [];
            components = [];
            modes = [];
            currentModel = null;
            
            // Update table header to reflect cleared modes
            updateTableHeader();
            
            // Clear all form fields
            document.getElementById('model-name').value = '';
            document.getElementById('model-desc').value = '';
            document.getElementById('component-name').value = '';
            document.getElementById('model-model').value = '';
            document.getElementById('model-voltage').value = '';
            document.getElementById('model-current').value = '';
            document.getElementById('lib-name').value = '';
            document.getElementById('lib-model').value = '';
            document.getElementById('lib-voltage').value = '';
            document.getElementById('lib-current').value = '';
            document.getElementById('mode-name-input').value = '';
            document.getElementById('mode-duration').value = '';
            document.getElementById('copy-from').value = '';
            document.getElementById('dod').value = '80';
            document.getElementById('efficiency').value = '90';
            document.getElementById('bus-voltage').value = '28';
            
            // Update UI
            updateLibraryList();
            updateModelList();
            updateModesList();
            updatePowerTable();
            window.updateTotalPower();
            updateCurrentModelInfo();
            loadModelList();
            
            // Clear results
            document.getElementById('battery-results').innerHTML = '';
            document.getElementById('mode-totals').innerHTML = '';
            document.getElementById('total-power').textContent = 'Total Power (All Modes): 0 W';
            
            alert('All data has been cleared successfully!');
        }
    });

    // Library Form
    libraryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('lib-name').value;
        const modelNumber = document.getElementById('lib-model').value;
        const voltage = parseFloat(document.getElementById('lib-voltage').value);
        const current = parseFloat(document.getElementById('lib-current').value);
        if (name && !isNaN(voltage) && !isNaN(current)) {
            globalComponents.push({ name, modelNumber, voltage, current });
            saveGlobalComponents();
            updateLibraryList();
            libraryForm.reset();
        }
    });

    function updateLibraryList() {
        libraryList.innerHTML = globalComponents.map((comp, i) => `<li>${comp.name} (${comp.modelNumber || 'N/A'}) (${comp.voltage}V, ${comp.current}A) <button onclick="removeGlobalComponent(${i})">Remove</button></li>`).join('');
        
        // Update library add-to-model section
        const libraryAddToModel = document.getElementById('library-add-to-model');
        libraryAddToModel.innerHTML = '<h4>Available Components:</h4>' + globalComponents.map((comp, i) => 
            `<div class="component-item">
                <span>${comp.name} (${comp.modelNumber || 'N/A'}) - ${comp.voltage}V, ${comp.current}A</span>
                <button onclick="addFromLibrary(${i})">Add to Model</button>
            </div>`
        ).join('');
        
        // Update model-to-library section
        const modelToLibrary = document.getElementById('model-to-library');
        modelToLibrary.innerHTML = '<h4>Current Model Components:</h4>' + components.map((comp, i) => 
            `<div class="component-item">
                <span>${comp.name} (${comp.modelNumber || 'N/A'}) - ${comp.voltage}V, ${comp.current}A</span>
                <button onclick="copyToLibrary(${i})">Copy to Library</button>
                <button onclick="removeModelComponent(${i})" style="background-color: #f44336; margin-left: 5px;">Remove</button>
            </div>`
        ).join('');
    }

    // Add Global Mode
    addModeGlobalBtn.addEventListener('click', function() {
        const name = document.getElementById('mode-name-input').value.trim();
        const duration = parseFloat(document.getElementById('mode-duration').value) || 0;
        const copyIdx = copyFrom.value;
        if (name && !modes.find(m => m.name === name)) {
            const activeComponents = copyIdx ? new Set(modes[copyIdx].activeComponents) : new Set();
            const copiedDuration = copyIdx ? modes[copyIdx].duration : 0;
            modes.push({ name, activeComponents, duration: copyIdx ? copiedDuration : duration });
            saveModes();
            updateModesList();
            updateTableHeader();
            updatePowerTable();
            window.updateTotalPower();
            document.getElementById('mode-name-input').value = '';
            document.getElementById('mode-duration').value = '';
            copyFrom.value = '';
        }
    });

    function updateModesList() {
        modesList.innerHTML = modes.map((mode, i) => `<li>${mode.name} Duration: <input type="number" value="${mode.duration}" step="0.01" onchange="updateModeDuration(${i}, this.value)"> h <button onclick="removeMode(${i})">Remove</button></li>`).join('');
        copyFrom.innerHTML = '<option value="">None</option>' + modes.map((m, i) => `<option value="${i}">${m.name}</option>`).join('');
    }

    function updateTableHeader() {
        const headerRow = tableHead.querySelector('tr');
        const newHTML = '<th>Component</th>' + modes.map(mode => `<th>${mode.name}</th>`).join('') + '<th>Action</th>';
        console.log('updateTableHeader: modes =', modes, 'newHTML =', newHTML);
        headerRow.innerHTML = newHTML;
    }
    linkForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const freq = parseFloat(document.getElementById('frequency').value);
        const txPower = parseFloat(document.getElementById('transmit-power').value);
        const txGain = parseFloat(document.getElementById('transmit-gain').value);
        const dist = parseFloat(document.getElementById('distance').value);
        const rxGain = parseFloat(document.getElementById('receive-gain').value);
        const noiseTemp = parseFloat(document.getElementById('noise-temp').value);
        const bw = parseFloat(document.getElementById('bandwidth').value);

        if (freq && !isNaN(txPower) && !isNaN(txGain) && dist && !isNaN(rxGain) && noiseTemp && bw) {
            calculateLinkBudget(freq, txPower, txGain, dist, rxGain, noiseTemp, bw);
            linkResults.classList.remove('hidden');
        }
    });

    function calculateLinkBudget(freq, txPower, txGain, dist, rxGain, noiseTemp, bw) {
        const k = 1.38e-23; // Boltzmann constant
        const eirp = txPower + txGain;
        const pathLoss = 32.4 + 20 * Math.log10(dist) + 20 * Math.log10(freq);
        const receivedPower = eirp - pathLoss + rxGain;
        const noisePower = 10 * Math.log10(k * noiseTemp * bw);
        const snr = receivedPower - noisePower;
        const linkMargin = snr - 10; // Assuming 10 dB required SNR for simplicity

        document.getElementById('eirp').textContent = `EIRP: ${eirp.toFixed(2)} dBW`;
        document.getElementById('path-loss').textContent = `Free Space Path Loss: ${pathLoss.toFixed(2)} dB`;
        document.getElementById('received-power').textContent = `Received Power: ${receivedPower.toFixed(2)} dBW`;
        document.getElementById('noise-power').textContent = `Noise Power: ${noisePower.toFixed(2)} dBW`;
        document.getElementById('snr').textContent = `SNR: ${snr.toFixed(2)} dB`;
        document.getElementById('link-margin').textContent = `Link Margin: ${linkMargin.toFixed(2)} dB`;
    }

    // Tab switching
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab + '-tab').classList.remove('hidden');
        });
    });

    function updatePowerTable() {
        powerTableBody.innerHTML = '';
        components.forEach((comp, compIdx) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${comp.name} (${comp.modelNumber || 'N/A'})</td>`;
            modes.forEach((mode, modeIdx) => {
                const isActive = mode.activeComponents.has(compIdx);
                row.innerHTML += `<td><input type="checkbox" ${isActive ? 'checked' : ''} onchange="toggleComponentMode(${compIdx}, ${modeIdx})"></td>`;
            });
            row.innerHTML += `<td><button onclick="removeModelComponent(${compIdx})">Remove</button></td>`;
            powerTableBody.appendChild(row);
        });
    }

    window.updateTotalPower = function() {
        const totals = {};
        const energies = {};
        modes.forEach(mode => {
            totals[mode.name] = 0;
            energies[mode.name] = 0;
        });
        totalPower = 0;
        let totalDuration = 0;
        modes.forEach(mode => {
            totalDuration += mode.duration;
            mode.activeComponents.forEach(compIdx => {
                const comp = components[compIdx];
                if (comp) {
                    const power = comp.voltage * comp.current;
                    totals[mode.name] += power;
                    energies[mode.name] += power * mode.duration;
                    totalPower += power;
                }
            });
        });
        totalPowerDiv.textContent = `Total Power (All Modes): ${totalPower.toFixed(2)} W`;

        let html = '<h3>Power and Energy Totals per Mode</h3><table><tr><th>Mode</th><th>Power (W)</th><th>Duration (h)</th><th>Energy (Wh)</th></tr>';
        modes.forEach(mode => {
            html += `<tr><td>${mode.name}</td><td>${totals[mode.name].toFixed(2)}</td><td>${mode.duration}</td><td>${energies[mode.name].toFixed(2)}</td></tr>`;
        });
        const totalEnergy = totalPower * totalDuration;
        html += `<tr><td><strong>Total</strong></td><td>${totalPower.toFixed(2)}</td><td>${totalDuration.toFixed(2)}</td><td>${totalEnergy.toFixed(2)}</td></tr>`;
        html += '</table>';
        html += '<button onclick="updateTotalPower()" style="margin-top: 1rem;">Recalculate Totals</button>';
        modeTotals.innerHTML = html;

        // Store totalEnergy for battery calc
        window.totalEnergy = totalEnergy;

        // Update charts
        window.updateChartsOnDataChange();
    };

    window.toggleComponentMode = function(compIdx, modeIdx) {
        const mode = modes[modeIdx];
        if (mode.activeComponents.has(compIdx)) {
            mode.activeComponents.delete(compIdx);
        } else {
            mode.activeComponents.add(compIdx);
        }
        saveModes();
        window.updateTotalPower();
    };

    window.updateModeDuration = function(i, val) {
        modes[i].duration = parseFloat(val) || 0;
        saveModes();
        window.updateTotalPower();
    };

    window.removeMode = function(i) {
        modes.splice(i, 1);
        saveModes();
        updateModesList();
        updateTableHeader();
        updatePowerTable();
        window.updateTotalPower();
    };

    window.removeGlobalComponent = function(i) {
        globalComponents.splice(i, 1);
        saveGlobalComponents();
        updateLibraryList();
    };

    window.addFromLibrary = function(i) {
        const comp = globalComponents[i];
        if (comp && !components.find(c => c.name === comp.name && c.voltage === comp.voltage && c.current === comp.current)) {
            components.push({ ...comp });
            saveComponents();
            updateModelList();
            updateLibraryList();
            updatePowerTable();
            window.updateTotalPower();
            alert('Component added to current model!');
        } else {
            alert('Component already exists in the current model or not found.');
        }
    };

    window.copyToLibrary = function(i) {
        const comp = components[i];
        if (comp && !globalComponents.find(c => c.name === comp.name && c.voltage === comp.voltage && c.current === comp.current)) {
            globalComponents.push({ ...comp });
            saveGlobalComponents();
            updateLibraryList();
            alert('Component copied to library!');
        } else {
            alert('Component already exists in the library or not found.');
        }
    };

    window.removeModelComponent = function(i) {
        components.splice(i, 1);
        // Update modes' activeComponents
        modes.forEach(mode => {
            const newSet = new Set();
            mode.activeComponents.forEach(idx => {
                if (idx < components.length) newSet.add(idx);
                else if (idx > i) newSet.add(idx - 1);
            });
            mode.activeComponents = newSet;
        });
        saveComponents();
        updateModelList();
        updateLibraryList();
        updatePowerTable();
        window.updateTotalPower();
    };

    // Chart instances
    let powerByModeChart = null;
    let energyDistributionChart = null;
    let powerTimeChart = null;
    let batteryAnalysisChart = null;

    function updateCharts() {
        updatePowerByModeChart();
        updateEnergyDistributionChart();
        updatePowerTimeChart();
        updateBatteryAnalysisChart();
    }

    function updatePowerByModeChart() {
        const ctx = document.getElementById('powerByModeChart');
        if (!ctx) return;

        const labels = modes.map(m => m.name);
        const data = modes.map(m => {
            let total = 0;
            m.activeComponents.forEach(idx => {
                if (components[idx]) {
                    total += components[idx].voltage * components[idx].current;
                }
            });
            return total;
        });

        if (powerByModeChart) powerByModeChart.destroy();
        powerByModeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.length > 0 ? labels : ['No modes'],
                datasets: [{
                    label: 'Power (W)',
                    data: data.length > 0 ? data : [0],
                    backgroundColor: 'rgba(0, 212, 255, 0.8)',
                    borderColor: 'rgba(0, 212, 255, 1)',
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                family: 'Rajdhani',
                                size: 12,
                                weight: '500'
                            },
                            color: '#e0e0e0'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 10, 10, 0.95)',
                        titleColor: '#00d4ff',
                        bodyColor: '#e0e0e0',
                        borderColor: 'rgba(0, 212, 255, 0.5)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        titleFont: {
                            family: 'Orbitron',
                            size: 14,
                            weight: '600'
                        },
                        bodyFont: {
                            family: 'Space Mono',
                            size: 12
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Power (W)',
                            color: '#00d4ff',
                            font: {
                                family: 'Orbitron',
                                size: 12,
                                weight: '600'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 212, 255, 0.1)',
                            borderColor: 'rgba(0, 212, 255, 0.3)'
                        },
                        ticks: {
                            color: '#e0e0e0',
                            font: {
                                family: 'Space Mono',
                                size: 11
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 212, 255, 0.1)',
                            borderColor: 'rgba(0, 212, 255, 0.3)'
                        },
                        ticks: {
                            color: '#e0e0e0',
                            font: {
                                family: 'Rajdhani',
                                size: 11,
                                weight: '500'
                            }
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    function updateEnergyDistributionChart() {
        const ctx = document.getElementById('energyDistributionChart');
        if (!ctx) return;

        const labels = modes.map(m => m.name);
        const energyData = modes.map(m => {
            let total = 0;
            m.activeComponents.forEach(idx => {
                if (components[idx]) {
                    total += components[idx].voltage * components[idx].current * (m.duration || 0);
                }
            });
            return total;
        });

        if (energyDistributionChart) energyDistributionChart.destroy();
        energyDistributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels.length > 0 ? labels : ['No data'],
                datasets: [{
                    data: energyData.length > 0 ? energyData : [1],
                    backgroundColor: [
                        'rgba(0, 212, 255, 0.8)',
                        'rgba(255, 107, 53, 0.8)',
                        'rgba(46, 213, 115, 0.8)',
                        'rgba(156, 39, 176, 0.8)',
                        'rgba(255, 193, 7, 0.8)'
                    ],
                    borderColor: 'rgba(10, 10, 10, 0.8)',
                    borderWidth: 3,
                    hoverBorderColor: 'rgba(255, 255, 255, 0.8)',
                    hoverBorderWidth: 4,
                    shadowColor: 'rgba(0, 212, 255, 0.5)',
                    shadowBlur: 15,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Rajdhani',
                                size: 12,
                                weight: '500'
                            },
                            color: '#e0e0e0',
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 10, 10, 0.95)',
                        titleColor: '#00d4ff',
                        bodyColor: '#e0e0e0',
                        borderColor: 'rgba(0, 212, 255, 0.5)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        titleFont: {
                            family: 'Orbitron',
                            size: 14,
                            weight: '600'
                        },
                        bodyFont: {
                            family: 'Space Mono',
                            size: 12
                        },
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return context.label + ': ' + context.parsed.toFixed(2) + ' Wh (' + percentage + '%)';
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 2000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    function updatePowerTimeChart() {
        const ctx = document.getElementById('powerTimeChart');
        if (!ctx) return;

        const labels = [];
        const powerData = [];
        let cumulativeTime = 0;

        modes.forEach(m => {
            labels.push((cumulativeTime).toFixed(2) + 'h');
            let total = 0;
            m.activeComponents.forEach(idx => {
                if (components[idx]) {
                    total += components[idx].voltage * components[idx].current;
                }
            });
            powerData.push(total);
            cumulativeTime += m.duration || 0;
        });

        if (powerTimeChart) powerTimeChart.destroy();
        powerTimeChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.length > 0 ? labels : ['No data'],
                datasets: [{
                    label: 'Power Draw (W)',
                    data: powerData.length > 0 ? powerData : [0],
                    borderColor: 'rgba(0, 212, 255, 1)',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    borderWidth: 4,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(0, 212, 255, 1)',
                    pointBorderColor: 'rgba(10, 10, 10, 0.8)',
                    pointBorderWidth: 3,
                    pointRadius: 8,
                    pointHoverRadius: 12,
                    shadowColor: 'rgba(0, 212, 255, 0.5)',
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowOffsetY: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                family: 'Rajdhani',
                                size: 12,
                                weight: '500'
                            },
                            color: '#e0e0e0'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 10, 10, 0.95)',
                        titleColor: '#00d4ff',
                        bodyColor: '#e0e0e0',
                        borderColor: 'rgba(0, 212, 255, 0.5)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        titleFont: {
                            family: 'Orbitron',
                            size: 14,
                            weight: '600'
                        },
                        bodyFont: {
                            family: 'Space Mono',
                            size: 12
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Power (W)',
                            color: '#00d4ff',
                            font: {
                                family: 'Orbitron',
                                size: 12,
                                weight: '600'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 212, 255, 0.1)',
                            borderColor: 'rgba(0, 212, 255, 0.3)'
                        },
                        ticks: {
                            color: '#e0e0e0',
                            font: {
                                family: 'Space Mono',
                                size: 11
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Time (hours)',
                            color: '#00d4ff',
                            font: {
                                family: 'Orbitron',
                                size: 12,
                                weight: '600'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 212, 255, 0.1)',
                            borderColor: 'rgba(0, 212, 255, 0.3)'
                        },
                        ticks: {
                            color: '#e0e0e0',
                            font: {
                                family: 'Rajdhani',
                                size: 11,
                                weight: '500'
                            }
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    function updateBatteryAnalysisChart() {
        const ctx = document.getElementById('batteryAnalysisChart');
        if (!ctx) return;

        const dod = parseFloat(document.getElementById('dod').value) / 100;
        const efficiency = parseFloat(document.getElementById('efficiency').value) / 100;
        const busVoltage = parseFloat(document.getElementById('bus-voltage').value);
        
        let totalEnergy = 0;
        modes.forEach(m => {
            m.activeComponents.forEach(idx => {
                if (components[idx]) {
                    totalEnergy += components[idx].voltage * components[idx].current * (m.duration || 0);
                }
            });
        });

        const requiredCapacityWh = totalEnergy / (dod * efficiency) || 0;
        const requiredCapacityAh = requiredCapacityWh / busVoltage || 0;
        const margin = Math.max(0, requiredCapacityWh - totalEnergy) / Math.max(1, requiredCapacityWh) * 100 || 0;

        if (batteryAnalysisChart) batteryAnalysisChart.destroy();
        batteryAnalysisChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Energy Used (Wh)', 'Required Capacity (Wh)', 'Safety Margin (%)'],
                datasets: [{
                    label: 'Battery Analysis',
                    data: [totalEnergy, requiredCapacityWh, margin],
                    backgroundColor: [
                        'rgba(245, 127, 23, 0.8)',   // Energy Used - Orange
                        'rgba(21, 101, 192, 0.8)',   // Required Capacity - Blue
                        'rgba(56, 142, 60, 0.8)'     // Safety Margin - Green
                    ],
                    borderColor: [
                        'rgba(245, 127, 23, 1)',
                        'rgba(21, 101, 192, 1)',
                        'rgba(56, 142, 60, 1)'
                    ],
                    borderWidth: 3,
                    borderRadius: 6,
                    borderSkipped: false,
                    hoverBackgroundColor: [
                        'rgba(245, 127, 23, 1)',
                        'rgba(21, 101, 192, 1)',
                        'rgba(56, 142, 60, 1)'
                    ],
                    hoverBorderWidth: 4,
                    shadowColor: 'rgba(0, 212, 255, 0.3)',
                    shadowBlur: 8,
                    shadowOffsetX: 0,
                    shadowOffsetY: 2
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 10, 10, 0.95)',
                        titleColor: '#00d4ff',
                        bodyColor: '#e0e0e0',
                        borderColor: 'rgba(0, 212, 255, 0.5)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        titleFont: {
                            family: 'Orbitron',
                            size: 14,
                            weight: '600'
                        },
                        bodyFont: {
                            family: 'Space Mono',
                            size: 12
                        },
                        callbacks: {
                            label: function(context) {
                                if (context.dataIndex === 2) {
                                    return 'Safety Margin: ' + context.parsed.x.toFixed(1) + '%';
                                }
                                return context.label + ': ' + context.parsed.x.toFixed(2) + ' Wh';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Value',
                            color: '#00d4ff',
                            font: {
                                family: 'Orbitron',
                                size: 12,
                                weight: '600'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 212, 255, 0.1)',
                            borderColor: 'rgba(0, 212, 255, 0.3)'
                        },
                        ticks: {
                            color: '#e0e0e0',
                            font: {
                                family: 'Space Mono',
                                size: 11
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 212, 255, 0.1)',
                            borderColor: 'rgba(0, 212, 255, 0.3)'
                        },
                        ticks: {
                            color: '#e0e0e0',
                            font: {
                                family: 'Rajdhani',
                                size: 11,
                                weight: '500'
                            }
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    // Update charts whenever data changes
    window.updateChartsOnDataChange = function() {
        setTimeout(updateCharts, 100);
    };

    // Initial chart setup
    updateCharts();
});