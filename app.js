if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
// --- Customization State ---
function getDataFromStorage() {
    try {
        const parties = JSON.parse(localStorage.getItem('parties'));
        const prefs = JSON.parse(localStorage.getItem('prefs'));
        if (parties && prefs) {
            window.parties = parties;
            window.pref = prefs;
            return true;
        }
    } catch {}
    return false;
}

function saveDataToStorage(parties, prefs) {
    localStorage.setItem('parties', JSON.stringify(parties));
    localStorage.setItem('prefs', JSON.stringify(prefs));
    window.parties = parties;
    window.pref = prefs;
    // Save section info if present
    if (window.sectionInfo) {
        localStorage.setItem('sectionInfo', JSON.stringify(window.sectionInfo));
    }
}

function showLoadListsModal() {
    // Remove existing modal if present
    const oldModal = document.getElementById('loadListsModal');
    if (oldModal) oldModal.remove();

    const modal = document.createElement('div');
    modal.id = 'loadListsModal';
    modal.className = 'modal';

    const content = document.createElement('div');
    content.className = 'inner-modal-content';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.className = 'close-button';
    closeBtn.onclick = () => modal.remove();
    content.appendChild(closeBtn);

    // Title
    const title = document.createElement('h2');
    title.textContent = 'Зареди изборните листи';
    content.appendChild(title);

    // Section input
    const sectionDiv = document.createElement('div');
    sectionDiv.style = 'margin-bottom:16px;';
    const sectionLabel = document.createElement('label');
    sectionLabel.textContent = 'Номер на секция: ';
    const sectionInput = document.createElement('input');
    sectionInput.type = 'number';
    sectionInput.placeholder = 'Въведете номер';
    sectionInput.style = 'padding:4px; font-size: 1.2rem;';
    sectionLabel.appendChild(sectionInput);
    sectionDiv.appendChild(sectionLabel);
    content.appendChild(sectionDiv);

    // Load button
    const loadBtn = document.createElement('button');
    loadBtn.textContent = 'Зареди';
    loadBtn.className = 'loadButton';
    loadBtn.onclick = function() {
        if (!sectionInput.value.trim()) {
            alert('Въведете номер на секция!');
            return;
        }
        if (confirm('Това действие ще изтрие старите данни и гласувания. Желаете ли да продължите?')) {
            // Изтриване на данни
            localStorage.removeItem('votes');
            localStorage.removeItem('parties');
            localStorage.removeItem('prefs');
            // AJAX request for data.json
            fetch('data.json?section=' + encodeURIComponent(sectionInput.value))    
                //TODO: Тук трябва да се замени с конкретен URL на API, за зареждане на данните за съответната секция
                .then(resp => resp.json())
                .then(data => {
                    console.log('Loaded data:', data);
                    if (data.error === 1) {
                        alert(data.message || 'Възникна грешка при зареждане на данните!');
                        return;
                    }
                    if (data.parties && data.prefs) {
                        // Extract section info
                        window.sectionInfo = {
                            section: data['СЕКЦИЯ'] || '',
                            region: data['РАЙОН'] || '',
                            municipality: data['ОБЩИНА/ГРАД'] || '',
                            address: data['АДРЕС'] || ''
                        };
                        saveDataToStorage(data.parties, data.prefs);
                        modal.remove();
                        showSectionInfoModal();
                        showNotification('Данните са заредени успешно!');
                        initializeApp();
                    } else {
                        alert('Невалиден формат на данните!');
                    }
                })
                .catch(() => alert('Грешка при зареждане на файла!'));
        function showSectionInfoModal() {
            // Remove existing modal if present
            const oldModal = document.getElementById('sectionInfoModal');
            if (oldModal) oldModal.remove();

            const modal = document.createElement('div');
            modal.id = 'sectionInfoModal';
            modal.className = 'modal';

            const content = document.createElement('div');
            content.className = 'inner-modal-content';

            // Close button
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '×';
            closeBtn.className = 'close-button';
            closeBtn.onclick = () => modal.remove();
            content.appendChild(closeBtn);

            // Title
            const title = document.createElement('h2');
            title.textContent = 'Информация за секция';
            content.appendChild(title);

            // Section info
            const infoDiv = document.createElement('div');
            infoDiv.className = 'section-info';
            const info = window.sectionInfo || JSON.parse(localStorage.getItem('sectionInfo') || '{}');
            infoDiv.innerHTML = `
                <div><b>Секция:</b> ${info.section || '-'}</div>
                <div><b>Район:</b> ${info.region || '-'}</div>
                <div><b>Община/Град:</b> ${info.municipality || '-'}</div>
                <div><b>Адрес:</b> ${info.address || '-'}</div>
            `;
            content.appendChild(infoDiv);

            modal.appendChild(content);
            document.body.appendChild(modal);
        }
        }
    };
    content.appendChild(loadBtn);

    modal.appendChild(content);
    document.body.appendChild(modal);
}
function getHidePartyNamesFromStorage() {
    try {
        return JSON.parse(localStorage.getItem('hidePartyNames')) === true;
    } catch {
        return false;
    }
}
window.customization = {
    hidePartyNames: getHidePartyNamesFromStorage()
};

// --- Customization Modal ---
function showCustomizationModal() {

    // Remove existing modal if present
    const oldModal = document.getElementById('customizationModal');
    if (oldModal) oldModal.remove();

    const modal = document.createElement('div');
    modal.id = 'customizationModal';
    modal.className = 'modal';
    modal.style = '';

    const content = document.createElement('div');
    content.className = 'inner-modal-content';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.className = 'close-button';
    closeBtn.onclick = () => modal.remove();
    content.appendChild(closeBtn);

    // Title
    const title = document.createElement('h2');
    title.textContent = 'Настройки';
    content.appendChild(title);

    // Section info visually separated
    const sectionInfoDiv = document.createElement('div');
    sectionInfoDiv.className = 'section-info-block';
    const info = window.sectionInfo || JSON.parse(localStorage.getItem('sectionInfo') || '{}');
    sectionInfoDiv.innerHTML = `
        <div class="section-info-title">Информация за секция</div>
        <div><b>Секция:</b> ${info.section || '-'}<\/div>
        <div><b>Район:</b> ${info.region || '-'}<\/div>
        <div><b>Община/Град:</b> ${info.municipality || '-'}<\/div>
        <div><b>Адрес:</b> ${info.address || '-'}<\/div>
    `;
    content.appendChild(sectionInfoDiv);

    // Hide party names toggle
    const hideNamesDiv = document.createElement('div');
    hideNamesDiv.style = 'margin-bottom:16px;';
    const hideNamesLabel = document.createElement('label');
    hideNamesLabel.style = 'cursor:pointer;';
    const hideNamesCheckbox = document.createElement('input');
    hideNamesCheckbox.type = 'checkbox';
    hideNamesCheckbox.checked = !window.customization.hidePartyNames;
    hideNamesCheckbox.onchange = function() {
        window.customization.hidePartyNames = !this.checked;
        localStorage.setItem('hidePartyNames', JSON.stringify(!this.checked));
        createPartyButtons();
        modal.remove();
    };
    hideNamesLabel.appendChild(hideNamesCheckbox);
    hideNamesLabel.appendChild(document.createTextNode('Показвай имената на партиите/кандидатите'));
    hideNamesDiv.appendChild(hideNamesLabel);
    content.appendChild(hideNamesDiv);

    // Clear all votes button
    const clearVotesDiv = document.createElement('div');
    clearVotesDiv.style = 'margin-bottom:16px;';
    const clearVotesBtn = document.createElement('button');
    clearVotesBtn.textContent = 'Изчисти всички гласове';
    clearVotesBtn.className = 'clearVotesBtn';
    clearVotesBtn.onclick = function() {
        if (confirm('Сигурни ли сте, че искате да изчистите всички гласове?')) {
            localStorage.setItem('votes', '[]');
            updateStatistics();
            updateUndoButton();
            modal.remove();
            showNotification('Всички гласове са изчистени!');
        }
    };
    clearVotesDiv.appendChild(clearVotesBtn);
    content.appendChild(clearVotesDiv);

    // Reload lists button
    const reloadListsDiv = document.createElement('div');
    reloadListsDiv.style = 'margin-bottom:16px;';
    const reloadListsBtn = document.createElement('button');
    reloadListsBtn.textContent = 'Зареди изборните листи';
    reloadListsBtn.className = 'loadListBtn';
    reloadListsBtn.onclick = function() {
        modal.remove();
        showLoadListsModal();
    };
    reloadListsDiv.appendChild(reloadListsBtn);
    content.appendChild(reloadListsDiv);

    modal.appendChild(content);
    document.body.appendChild(modal);
}

// --- Customization Button Event ---

// Function to show detailed party and preference statistics
// Function to show a specific page
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    const newPage = document.getElementById(pageId);
    newPage.classList.add('active');
    // Quick scroll to top for any page change
    newPage.scrollTo({ top: 0, behavior: 'smooth', speed: 'slow' });
}

// Function to record vote and return to parties
function recordVoteAndReturn(partyNumber, prefNumber) {
    if (partyNumber==0 && (prefNumber == '-1' || prefNumber == 0)){
        recordVoteAndReturn(-1, 0);
        showNotification('Отчетена е невалидна бюлетина');
        showPage('partiesPage');
        return;
    }
    const vote = {
        party: partyNumber,
        preference: prefNumber,
        timestamp: new Date().toISOString()
    };
    
    // Get existing votes or initialize empty array
    const votes = JSON.parse(localStorage.getItem('votes') || '[]');
    votes.push(vote);
    
    // Store updated votes
    localStorage.setItem('votes', JSON.stringify(votes));
    
    // Update statistics, undo button, and return to parties page
    updateStatistics();
    updateUndoButton();
    showPage('partiesPage');
}

// Function to create party buttons
function createPartyButtons() {
    const partiesGrid = document.getElementById('partiesGrid');
    partiesGrid.innerHTML = ''; // Clear existing buttons
    partiesGrid.classList.toggle('hide-names-layout', window.customization.hidePartyNames);
    const partiesGridOther = document.getElementById('partiesGridOther');
    if (partiesGridOther) partiesGridOther.innerHTML = ''; // Clear other buttons

    // Check if parties data is available
    if (!window.parties) {
        console.error('Parties data is not loaded yet');
        return;
    }

    // Create buttons for each party
    Object.entries({'-1':'Невалидна бюлетина','0':'Независим'}).forEach(([number,name]) => {console.log(number);createOtherPartyButtons(number,name);})
    Object.entries(parties).forEach(([number, name]) => {
        if(parseInt(number)<=0) return; // Skip invalid and independent for main grid
        const button = document.createElement('button');
        button.className = 'party-button';
        button.innerHTML = `
            <div class="party-number">${number}<\/div>
            <div class="party-name${window.customization.hidePartyNames ? ' hide-party-name' : ''}">${name}<\/div>
        `;
        button.addEventListener('click', () => showPreferences(number));
        partiesGrid.appendChild(button);
    });
}
function createOtherPartyButtons(number,name) {
    const partiesGrid = document.getElementById('partiesGridOther');

    // Create buttons for each party
    
        const button = document.createElement('button');
        button.className = 'party-button small';
        button.innerHTML = `
            <div class="party-number button${number}">${name}</div>
        `;
        button.addEventListener('click', () => showPreferences(number));
        partiesGrid.appendChild(button);

}
// Function to show preferences for selected party
function showPreferences(partyNumber) {
    const prefsGrid = document.getElementById('prefsGrid');
    prefsGrid.classList.toggle('hide-names-layout', window.customization.hidePartyNames);
    prefsGrid.innerHTML = ''; // Clear existing buttons
    
    // Check if pref data is available
    if (!pref) {
        console.error('Preferences data is not loaded');
        return;
    }
    
    // Update statistics
    updateStatistics(partyNumber);
    
    // Add top "no preferences" button
    prefsGrid.appendChild(createNoPreferencesButton(partyNumber));
    // If partyNumber is -1 (invalid ballot), record invalid vote and show notification
    if (partyNumber=='-1'){
        recordVoteAndReturn(-1, 0);
        showNotification('Отчетена е невалидна бюлетина');
        return
    }
    // Get preferences for selected party
    const partyPrefs = pref[partyNumber];
    
    if (partyPrefs) {
        // Create buttons for each preference
        partyPrefs.forEach(pref => {
            const prefNumber = Object.keys(pref)[0];
            const prefName = pref[prefNumber];
            
            const button = document.createElement('button');
            button.className = 'party-button';
            button.innerHTML = `
                <div class="party-number">${prefNumber}<\/div>
                <div class="party-name${window.customization.hidePartyNames ? ' hide-party-name' : ''}">${prefName}<\/div>
            `;
            button.addEventListener('click', () => recordVoteAndReturn(partyNumber, prefNumber));
            prefsGrid.appendChild(button);
        });
    }
    
    // Add bottom "no preferences" button
    prefsGrid.appendChild(createInvalidPreferencesButton(partyNumber));
    
    // Show preferences page (scrolling is handled in showPage function)
    showPage('prefsPage');
}
// Function to format date
function formatDateTime(isoString) {
    const date = new Date(isoString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
        return date.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' });
    } else {
        return date.toLocaleDateString('bg-BG');
    }
}

// Function to show votes history
function showVotesHistory() {
    const votes = JSON.parse(localStorage.getItem('votes') || '[]');
    
    // Create modal container
    const modalDiv = document.createElement('div');
    modalDiv.className = "vote-history modal";

    // Add header
    const headerDiv = document.createElement('div');
    headerDiv.className = "header";
    
    const headerTitle = document.createElement('h2');
    headerTitle.textContent = 'История на гласуването';
    headerTitle.style.margin = '0';
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.className = 'close-button';
    closeButton.onclick = () => modalDiv.remove();
    
    headerDiv.appendChild(headerTitle);
    headerDiv.appendChild(closeButton);
    modalDiv.appendChild(headerDiv);

    // Create content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'vote-info-container';

    // Sort votes by timestamp in descending order
    const sortedVotes = [...votes].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Create vote entries
    sortedVotes.forEach((vote, index) => {
        const voteDiv = document.createElement('div');
        voteDiv.className = 'item';
        
        // Add sequence number watermark
        const watermark = document.createElement('div');
        watermark.textContent = `${votes.length - index}`; // Show reverse index (total - current)
        watermark.className= 'watermark';
        
        // Main vote info
        const mainInfo = document.createElement('div');
        mainInfo.className = 'main';
        
        const partyInfo = document.createElement('div');
        if (vote.party == '-1') {
            partyInfo.innerHTML = `
                <span class="invalid">Невалидна бюлетина</span>
            `;
        } else {
        partyInfo.innerHTML = `
            <span>${vote.party}.</span>
            <span>${window.parties[vote.party]}</span>
        `;
        }
        
        const timeInfo = document.createElement('div');
        timeInfo.textContent = formatDateTime(vote.timestamp);
        
        mainInfo.appendChild(partyInfo);
        mainInfo.appendChild(timeInfo);
        voteDiv.appendChild(watermark);
        voteDiv.appendChild(mainInfo);

        // Preference info (if exists)
        if (vote.preference !== 0) {
            const prefInfo = document.createElement('div');
            prefInfo.className = 'prefs';
            if (vote.preference == '-1') {
                prefInfo.innerHTML = `<span class="invalid">Невалидна преференция</span>`;
            } else {
                const partyPrefs = window.pref[vote.party] || [];
                const prefData = partyPrefs.find(p => Object.keys(p)[0] === vote.preference);
                const prefName = prefData ? prefData[vote.preference] : 'Unknown';

                prefInfo.innerHTML = `
                    <span>
                        <span>${vote.preference}.</span>
                        <span>${prefName}</span>
                    </span>
                `;
            }
            voteDiv.appendChild(prefInfo);
        }

        contentDiv.appendChild(voteDiv);
    });

    modalDiv.appendChild(contentDiv);
    document.body.appendChild(modalDiv);
}

function showDetailedPartyStats() {
    const votes = JSON.parse(localStorage.getItem('votes') || '[]');
    
    // Create the modal container
    const statsDiv = document.createElement('div');
    statsDiv.className = 'party-stats modal';


    // Add header with controls
    const headerDiv = document.createElement('div');
    headerDiv.className = "header";
    
    const headerLeft = document.createElement('div');
    headerLeft.className = 'header-left';
    
    const headerTitle = document.createElement('h2');
    headerTitle.textContent = 'Статистика за гласовете';
    headerTitle.className = 'header-title';
    
    const showAllPrefsButton = document.createElement('button');
    showAllPrefsButton.textContent = 'Покажи преференции';
    showAllPrefsButton.className = 'show-prefs-button';
    
    const showVotesButton = document.createElement('button');
    showVotesButton.textContent = 'Покажи всички гласове';
    showVotesButton.className = 'show-votes-button';
    showVotesButton.onclick = () => {
        statsDiv.remove();
        showVotesHistory();
    };
    
    const headerCloseButton = document.createElement('button');
    headerCloseButton.innerHTML = '×';
    headerCloseButton.className = 'close-button';
    headerCloseButton.onclick = () => statsDiv.remove();
    
    headerLeft.appendChild(headerTitle);
    headerLeft.appendChild(showAllPrefsButton);
    headerLeft.appendChild(showVotesButton);
    headerDiv.appendChild(headerLeft);
    headerDiv.appendChild(headerCloseButton);
    statsDiv.appendChild(headerDiv);

    // Create stats list
    const statsList = document.createElement('div');
    statsList.className = 'stats-list';

    // Set up show all preferences button functionality
    showAllPrefsButton.onclick = () => {
        const allPrefSections = document.querySelectorAll('.prefs-section');
        const anyShown = Array.from(allPrefSections).some(div => div.style.display === 'block');
        allPrefSections.forEach(prefsDiv => {
            prefsDiv.style.display = anyShown ? 'none' : 'block';
        });

        showAllPrefsButton.textContent = anyShown ? 'Покажи референции' : 'Скрий преференции';
    };

    // Create party entries
    Object.entries(window.parties).forEach(([number, name]) => {
       
        const partyVotes = votes.filter(v => v.party == number);
        const totalPartyVotes = partyVotes.length;
        const partyNoPreferenceVotes = partyVotes.filter(v => (v.preference === 0 || v.preference ==-1)).length;
        const partyWithPreferenceVotes = totalPartyVotes - partyNoPreferenceVotes;
        
        // Create party section
        const partyDiv = document.createElement('div');
        partyDiv.className = `party-section ${totalPartyVotes === 0 ? 'no-votes' : 'has-votes'}`;
        
        // Party header with vote count
        partyDiv.innerHTML = `
            <div class="party-header">
                <div>
                    <span class="party-header-name">${number>0?number+'.':''}</span>
                    <span class="party-header-title">${name}</span>
                </div>
                <div class="party-header-count ${totalPartyVotes === 0 ? 'no-votes' : 'has-votes'}">
                    ${totalPartyVotes}
                </div>
            </div>
        `;

        // Only add preferences section if there are votes
        if (totalPartyVotes > 0) {
            const prefsDiv = document.createElement('div');
            prefsDiv.className = 'prefs-section';
            
            // Always show "no preference" count first
            if (number>0 ){
                prefsDiv.innerHTML += `
                    <div class="pref-item">
                        <div class="pref-item-content">
                            <span class="pref-item-name">Без преференция</span>
                            <span class="pref-item-count">${partyNoPreferenceVotes}</span>
                        </div>
                    </div>
                `;
            }
            // Count and display preference votes
            const prefVotes = {};
            partyVotes.forEach(vote => {
                if (vote.preference !== '0') {
                    prefVotes[vote.preference] = (prefVotes[vote.preference] || 0) + 1;
                }
            });

            // Add preferences with votes
            const partyPrefs = window.pref[number] || [];
            partyPrefs.forEach(pref => {
                const prefNumber = Object.keys(pref)[0];
                const prefName = pref[prefNumber];
                const voteCount = prefVotes[prefNumber] || 0;
                if (voteCount > 0) {
                    prefsDiv.innerHTML += `
                        <div class="pref-item">
                            <div class="pref-item-content">
                                <div>
                                    <span class="pref-item-number">${prefNumber}.</span>
                                    <span>${prefName}</span>
                                </div>
                                <span class="pref-item-count">${voteCount}</span>
                            </div>
                        </div>
                    `;
                }
            });

            partyDiv.appendChild(prefsDiv);
        }

        statsList.appendChild(partyDiv);
    });
    
    statsDiv.appendChild(statsList);
    document.body.appendChild(statsDiv);
}

// Color map for checksum digits 1-9
const checksumColors = {
    1: '#FF4D4D', // Vibrant Red
    2: '#06ff06', // Vibrant Green
    3: '#141492', // Dark Blue
    4: '#FFD700', // Gold
    5: '#FF1493', // Deep Pink
    6: '#00CED1', // Dark Turquoise
    7: '#795512', // Orange
    8: '#1E90FF', // Dodger Blue
    9: '#9400D3'  // Dark Violet
};

// Function to calculate checksum
function calculateChecksum(votes) {

    let sum = 0;
    let weight = 2;
    for (const vote of votes) {
        const party = parseInt(vote.party) || 0;
        const pref = parseInt(vote.preference) || 0;
        const numbers = [party, pref];
        for (let n of numbers) {
            let val = n * weight;
            if (val > 9) {
                val = Math.floor(val / 10) + (val % 10);
            }
            sum += val;
            weight = weight === 2 ? 1 : 2;
        }
    }
    return 1 + ((sum - 1) % 9);
}

// Function to create a "no preferences" button
function createNoPreferencesButton(partyNumber) {
    const button = document.createElement('button');
    button.className = 'party-button no-preferences-button def';
    button.innerHTML = `
        <div class="party-name">Без преференция</div>
    `;
    button.addEventListener('click', () => recordVoteAndReturn(partyNumber, 0));
    return button;
}

// Function to create a "invalid preferences" button
function createInvalidPreferencesButton(partyNumber) {
    const button = document.createElement('button');
    button.className = 'party-button invalid-preferences-button def';
    button.innerHTML = `
        <div class="party-name">Невалидна преференция</div>
    `;
    button.addEventListener('click', () => recordVoteAndReturn(partyNumber, -1));
    return button;
}


// Function to show a temporary notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = '<span>'+message+'</span>';
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 30000); // Remove after 3 seconds
}

// Function to handle undo last vote
function undoLastVote() {
    const votes = JSON.parse(localStorage.getItem('votes') || '[]');
    if (votes.length > 0) {
        votes.pop(); // Remove the last vote
        localStorage.setItem('votes', JSON.stringify(votes));
        updateStatistics();
        updateUndoButton();
        showNotification('Премахната е последната записана бюлетина.');
    }
}

// Function to update undo button state
function updateUndoButton() {
    const undoButton = document.getElementById('undoButton');
    const votes = JSON.parse(localStorage.getItem('votes') || '[]');
    undoButton.disabled = votes.length === 0;
}

// Function to update statistics displays
function updateStatistics(partyNumber = null) {
    // Update total votes
    const votes = JSON.parse(localStorage.getItem('votes') || '[]');
    const totalVotesElement = document.getElementById('totalVotesCount');
    totalVotesElement.textContent = votes.length;
    totalVotesElement.style.cursor = 'pointer';
    totalVotesElement.onclick = showDetailedPartyStats;
    
    // Update background color based on checksum
    if (votes.length > 0) {
        const checksum = calculateChecksum(votes) ?? '-';
        console.log('Calculated checksum:', checksum);
        document.getElementById('checkSumValue').textContent = checksum;
        document.body.style.backgroundColor = checksumColors[checksum] || '#f0f0f0';
        document.body.style.transition = 'background-color 0.5s ease';
    } else {
        document.body.style.backgroundColor = '#f0f0f0';
    }
    
    // Update party-specific votes if a party is selected
    if (partyNumber) {
        const partyVotes = votes.filter(vote => vote.party === partyNumber).length;
        document.getElementById('partyVotesCount').innerHTML = 
            `<strong>${partyVotes}</strong> (${window.parties[partyNumber]})`;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (getDataFromStorage()) {
        initializeApp();
    } else {
        showCustomizationModal();
    }
});
function initializeApp() {
    const customizeBtn = document.getElementById('customizeButton');
    if (customizeBtn) {
        customizeBtn.addEventListener('click', showCustomizationModal);
    }
    // Ensure data is loaded
    if (window.parties && window.pref) {
        // Create initial buttons
        createPartyButtons();
        
        // Initialize statistics
        updateStatistics();
        updateUndoButton();
        
        // Set up back button (just returns to parties page)
        document.getElementById('backButton').addEventListener('click', () => {
            showPage('partiesPage');
            updateStatistics(); // Update stats when returning to main page
        });

        // Set up undo button
        document.getElementById('undoButton').addEventListener('click', undoLastVote);
        document.getElementById('checkSumValue').addEventListener('click', function(elm){this.classList.add('focus');  });
    } else {
        console.error('Required data is not loaded:', { 
            partiesLoaded: !!window.parties,
            prefLoaded: !!window.pref
        });
    }
}
