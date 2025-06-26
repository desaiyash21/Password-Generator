// DOM Elements
        const generateBtn = document.getElementById('generate');
        const copyBtn = document.getElementById('copy');
        const saveBtn = document.getElementById('save');
        const clearHistoryBtn = document.getElementById('clear-history');
        const passwordField = document.getElementById('password');
        const lengthInput = document.getElementById('length');
        const lengthValue = document.getElementById('length-value');
        const uppercaseCheck = document.getElementById('uppercase');
        const lowercaseCheck = document.getElementById('lowercase');
        const numbersCheck = document.getElementById('numbers');
        const symbolsCheck = document.getElementById('symbols');
        const ambiguousCheck = document.getElementById('ambiguous');
        const pronounceableCheck = document.getElementById('pronounceable');
        const strengthFill = document.getElementById('strength-fill');
        const strengthLabel = document.getElementById('strength-label');
        const entropyDisplay = document.getElementById('entropy');
        const crackTimeDisplay = document.getElementById('crack-time');
        const diversityDisplay = document.getElementById('diversity');
        const breachCheckDisplay = document.getElementById('breach-check');
        const historyList = document.getElementById('history-list');
        
        // Character sets
        const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed I and O for ambiguity
        const lowercase = 'abcdefghijkmnopqrstuvwxyz'; // Removed l
        const numbers = '23456789'; // Removed 0 and 1
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const pronounceablePairs = [
            'ba', 'be', 'bi', 'bo', 'bu', 'ca', 'ce', 'ci', 'co', 'cu',
            'da', 'de', 'di', 'do', 'du', 'fa', 'fe', 'fi', 'fo', 'fu',
            'ga', 'ge', 'gi', 'go', 'gu', 'ha', 'he', 'hi', 'ho', 'hu',
            'ja', 'je', 'ji', 'jo', 'ju', 'ka', 'ke', 'ki', 'ko', 'ku',
            'la', 'le', 'li', 'lo', 'lu', 'ma', 'me', 'mi', 'mo', 'mu',
            'na', 'ne', 'ni', 'no', 'nu', 'pa', 'pe', 'pi', 'po', 'pu',
            'ra', 're', 'ri', 'ro', 'ru', 'sa', 'se', 'si', 'so', 'su',
            'ta', 'te', 'ti', 'to', 'tu', 'va', 've', 'vi', 'vo', 'vu',
            'wa', 'we', 'wi', 'wo', 'wu', 'xa', 'xe', 'xi', 'xo', 'xu',
            'ya', 'ye', 'yi', 'yo', 'yu', 'za', 'ze', 'zi', 'zo', 'zu'
        ];
        
        // Common passwords to check against
        const commonPasswords = [
            'password', '123456', '12345678', '123456789', '12345',
            'qwerty', 'abc123', 'password1', 'iloveyou', '111111',
            'admin', 'welcome', 'monkey', 'sunshine', 'letmein'
        ];
        
        // Initialize
        let passwordHistory = JSON.parse(localStorage.getItem('vaultkey-history')) || [];
        updateHistoryDisplay();
        
        // Event Listeners
        generateBtn.addEventListener('click', generatePassword);
        copyBtn.addEventListener('click', copyToClipboard);
        saveBtn.addEventListener('click', saveToHistory);
        clearHistoryBtn.addEventListener('click', clearHistory);
        lengthInput.addEventListener('input', updateLengthDisplay);
        
        // Update length display
        function updateLengthDisplay() {
            lengthValue.textContent = lengthInput.value;
        }
        
        // Generate password function
        function generatePassword() {
            let length = parseInt(lengthInput.value);
            let charset = '';
            let password = '';
            
            // Validate length
            if (length < 6) length = 6;
            if (length > 50) length = 50;
            lengthInput.value = length;
            lengthValue.textContent = length;
            
            // Build character set based on selections
            if (uppercaseCheck.checked) charset += ambiguousCheck.checked ? uppercase : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (lowercaseCheck.checked) charset += ambiguousCheck.checked ? lowercase : 'abcdefghijklmnopqrstuvwxyz';
            if (numbersCheck.checked) charset += ambiguousCheck.checked ? numbers : '0123456789';
            if (symbolsCheck.checked) charset += symbols;
            
            // Validate at least one character set is selected
            if (!charset) {
                alert('Please select at least one character type!');
                return;
            }
            
            // Generate pronounceable password if selected
            if (pronounceableCheck.checked && lowercaseCheck.checked) {
                const pairCount = Math.ceil(length / 2);
                for (let i = 0; i < pairCount; i++) {
                    const randomPair = pronounceablePairs[Math.floor(Math.random() * pronounceablePairs.length)];
                    password += randomPair;
                }
                password = password.substring(0, length);
                
                // Capitalize first letter if uppercase required
                if (uppercaseCheck.checked) {
                    password = password.charAt(0).toUpperCase() + password.slice(1);
                }
                
                // Add numbers/symbols if required
                if (numbersCheck.checked || symbolsCheck.checked) {
                    const insertPos = Math.floor(Math.random() * (password.length - 1)) + 1;
                    const randomChar = getRandomSpecialChar();
                    password = password.substring(0, insertPos) + randomChar + password.substring(insertPos + 1);
                }
            } else {
                // Standard random generation
                for (let i = 0; i < length; i++) {
                    const randomIndex = Math.floor(Math.random() * charset.length);
                    password += charset[randomIndex];
                }
            }
            
            passwordField.value = password;
            updateSecurityAnalysis(password);
        }
        
        function getRandomSpecialChar() {
            let specialChars = '';
            if (numbersCheck.checked) specialChars += ambiguousCheck.checked ? numbers : '0123456789';
            if (symbolsCheck.checked) specialChars += symbols;
            
            if (!specialChars) return '';
            return specialChars[Math.floor(Math.random() * specialChars.length)];
        }
        
        // Update security analysis
        function updateSecurityAnalysis(password) {
            if (!password) return;
            
            // Calculate entropy
            let charsetSize = 0;
            if (/[a-z]/.test(password)) charsetSize += 26;
            if (/[A-Z]/.test(password)) charsetSize += 26;
            if (/[0-9]/.test(password)) charsetSize += 10;
            if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32; // Approximate symbol count
            
            const entropy = Math.log2(Math.pow(charsetSize, password.length));
            entropyDisplay.textContent = `${entropy.toFixed(1)} bits`;
            
            // Estimate crack time
            const guessesPerSecond = 1e9; // 1 billion guesses/second (modern GPU)
            const secondsToCrack = Math.pow(charsetSize, password.length) / guessesPerSecond;
            
            let crackTime;
            if (secondsToCrack < 60) crackTime = `${Math.round(secondsToCrack)} seconds`;
            else if (secondsToCrack < 3600) crackTime = `${Math.round(secondsToCrack/60)} minutes`;
            else if (secondsToCrack < 86400) crackTime = `${Math.round(secondsToCrack/3600)} hours`;
            else if (secondsToCrack < 31536000) crackTime = `${Math.round(secondsToCrack/86400)} days`;
            else crackTime = `${Math.round(secondsToCrack/31536000)} years`;
            
            crackTimeDisplay.textContent = crackTime;
            
            // Calculate character diversity
            const uniqueChars = new Set(password.split(''));
            const diversity = (uniqueChars.size / password.length * 100).toFixed(0);
            diversityDisplay.textContent = `${diversity}% unique (${uniqueChars.size}/${password.length} chars)`;
            
            // Check against common passwords
            const isCommon = commonPasswords.includes(password.toLowerCase());
            breachCheckDisplay.textContent = isCommon 
                ? '❌ Found in common password lists' 
                : '✅ Not found in common breaches';
            breachCheckDisplay.style.color = isCommon ? 'var(--danger)' : 'var(--success)';
            
            // Update strength meter
            updateStrengthMeter(entropy, isCommon);
        }
        
        function updateStrengthMeter(entropy, isCommon) {
            let strength = 0;
            
            // Base strength on entropy (0-100 scale)
            strength = Math.min(100, entropy * 3);
            
            // Penalize common passwords
            if (isCommon) strength = Math.max(0, strength - 50);
            
            // Update visual indicator
            strengthFill.style.width = strength + '%';
            
            // Color coding and label
            if (strength < 30) {
                strengthFill.style.backgroundColor = 'var(--danger)';
                strengthLabel.textContent = 'Weak';
            } else if (strength < 70) {
                strengthFill.style.backgroundColor = 'var(--warning)';
                strengthLabel.textContent = 'Moderate';
            } else {
                strengthFill.style.backgroundColor = 'var(--success)';
                strengthLabel.textContent = 'Strong';
            }
        }
        
        // Copy to clipboard
        function copyToClipboard() {
            if (!passwordField.value) return;
            
            passwordField.select();
            document.execCommand('copy');
            
            // Visual feedback
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✓';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        }
        
        // Save to history
        function saveToHistory() {
            if (!passwordField.value) return;
            
            // Add to beginning of array
            passwordHistory.unshift({
                password: passwordField.value,
                timestamp: new Date().toISOString()
            });
            
            // Keep only last 10 items
            if (passwordHistory.length > 10) {
                passwordHistory = passwordHistory.slice(0, 10);
            }
            
            // Save to localStorage
            localStorage.setItem('vaultkey-history', JSON.stringify(passwordHistory));
            updateHistoryDisplay();
        }
        
        // Update history display
        function updateHistoryDisplay() {
            if (passwordHistory.length === 0) {
                historyList.innerHTML = '<div class="history-item"><span>No passwords generated yet</span></div>';
                return;
            }
            
            historyList.innerHTML = '';
            passwordHistory.forEach(item => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                
                const timestamp = new Date(item.timestamp);
                const timeStr = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                historyItem.innerHTML = `
                    <span>${item.password}</span>
                    <div>
                        <small style="opacity:0.7">${timeStr}</small>
                        <button class="history-copy" data-password="${item.password}">⎘</button>
                    </div>
                `;
                
                historyList.appendChild(historyItem);
            });
            
            // Add event listeners to copy buttons
            document.querySelectorAll('.history-copy').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const password = e.target.getAttribute('data-password');
                    navigator.clipboard.writeText(password);
                    
                    // Visual feedback
                    e.target.textContent = '✓';
                    setTimeout(() => {
                        e.target.textContent = '⎘';
                    }, 2000);
                });
            });
        }
        
        // Clear history
        function clearHistory() {
            if (confirm('Are you sure you want to clear your password history?')) {
                passwordHistory = [];
                localStorage.removeItem('vaultkey-history');
                updateHistoryDisplay();
            }
        }
        
        // Generate initial password on load
        generatePassword();




        document.addEventListener('deviceready', function () {
    admob.banner.config({
        id: 'ca-app-pub-3940256099942544/6300978111',  // Your banner ad unit ca-app-pub-8804628889405759/6721341460
        isTesting: false,
        autoShow: true
    });

    admob.banner.prepare();

    admob.interstitial.config({
        id: 'ca-app-pub-3940256099942544/1033173712', //ca-app-pub-8804628889405759/3270015764
        isTesting: false,
        autoShow: false
    });

    admob.interstitial.prepare();
}, false);