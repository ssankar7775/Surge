document.addEventListener('DOMContentLoaded', function() {
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

    let currentModel = null;

    let globalComponents = [];
    let components = [];
    let modes = [];
    let totalPower = 0;

    // Load saved global components
    const savedGlobal = localStorage.getItem('globalComponents');
    if (savedGlobal) {
        try {
            globalComponents = JSON.parse(savedGlobal);
        } catch (e) {
            globalComponents = [];
        }
    }

    // Load saved modes on start
    const savedModes = localStorage.getItem('modes');
    if (savedModes) {
        try {
            modes = JSON.parse(savedModes);
            console.log('Loaded modes from localStorage:', modes);
            modes.forEach(mode => {
                mode.activeComponents = new Set(mode.activeComponents || []);
            });
        } catch (e) {
            console.error('Error loading modes:', e);
            modes = [];
        }
    } else {
        console.log('No saved modes found');
        modes = [];
    }

    // Load saved components on start
    const savedComponents = localStorage.getItem('components');
    if (savedComponents) {
        try {
            components = JSON.parse(savedComponents);
        } catch (e) {
            components = [];
        }
    }

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

    // Initial updates for loaded components
    updateLibraryList();
    updateModelList();
    updateModesList();
    updateTableHeader();
    updatePowerTable();
    window.updateTotalPower();
});