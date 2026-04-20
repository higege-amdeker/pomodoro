class PomodoroTimer {
    constructor() {
        // デフォルトの時間設定（分）
        this.DEFAULT_WORK_MINUTES = 25;
        this.DEFAULT_BREAK_MINUTES = 5;
        
        // localStorageから設定を読み込み
        this.loadSettings();
        
        // 現在のモード
        this.MODE = {
            WORK: 'work',
            BREAK: 'break'
        };
        
        this.currentMode = this.MODE.WORK;
        this.timeRemaining = this.workTimeSeconds;
        this.isRunning = false;
        this.intervalId = null;
        
        // DOM要素の取得
        this.timeDisplay = document.getElementById('timeDisplay');
        this.modeDisplay = document.getElementById('modeDisplay');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.progressRing = document.querySelector('.progress-ring-progress');
        this.workTimeInput = document.getElementById('workTimeInput');
        this.breakTimeInput = document.getElementById('breakTimeInput');
        
        // プラス・マイナスボタンの取得
        this.plusBtns = document.querySelectorAll('.plus-btn');
        this.minusBtns = document.querySelectorAll('.minus-btn');
        
        // 円の周長を計算（画面サイズに応じて動的に設定）
        this.updateCircleSize();
        
        // 初期化
        this.init();
    }
    
    init() {
        // 保存された設定をHTMLに反映
        this.workTimeInput.value = this.workTimeMinutes;
        this.breakTimeInput.value = this.breakTimeMinutes;
        
        var self = this;
        this.startBtn.addEventListener('click', function() { self.start(); });
        this.stopBtn.addEventListener('click', function() { self.stop(); });
        this.resetBtn.addEventListener('click', function() { self.reset(); });
        
        // 時間設定のイベントリスナー
        this.workTimeInput.addEventListener('change', function() { self.updateTimeSettings(); });
        this.breakTimeInput.addEventListener('change', function() { self.updateTimeSettings(); });
        
        // プラス・マイナスボタンのイベントリスナー
        for (var i = 0; i < this.plusBtns.length; i++) {
            this.plusBtns[i].addEventListener('click', function(e) {
                self.incrementValue(e.target.getAttribute('data-target'));
            });
        }
        for (var i = 0; i < this.minusBtns.length; i++) {
            this.minusBtns[i].addEventListener('click', function(e) {
                self.decrementValue(e.target.getAttribute('data-target'));
            });
        }
        
        // 初期表示の更新
        this.updateDisplay();
        this.updateButtons();
        this.updateProgressRing();
        
        // リサイズ時に円のサイズを再計算
        var self = this;
        window.addEventListener('resize', function() {
            self.updateCircleSize();
            self.updateProgressRing();
        });
        
        // タッチデバイス対応
        this.setupTouchEvents();
    }
    
    updateCircleSize() {
        // 画面幅に応じて円の半径を設定
        var isMobile = window.innerWidth <= 600;
        this.radius = isMobile ? 70 : 90;
        this.circleCircumference = 2 * Math.PI * this.radius;
    }
    
    setupTouchEvents() {
        // タッチデバイスでのボタン操作を改善
        var buttons = document.querySelectorAll('.btn, .input-btn');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener('touchstart', function(e) {
                e.preventDefault();
                this.style.transform = 'scale(0.95)';
            });
            buttons[i].addEventListener('touchend', function(e) {
                var self = this;
                setTimeout(function() {
                    self.style.transform = '';
                }, 100);
            });
        }
    }
    
    loadSettings() {
        // localStorageから設定を読み込み
        var savedWorkTime, savedBreakTime, workMinutes, breakMinutes;
        try {
            savedWorkTime = localStorage.getItem('pomodoro-work-time');
            savedBreakTime = localStorage.getItem('pomodoro-break-time');
        } catch (e) {
            // localStorageが使用できない場合はデフォルト値を使用
            savedWorkTime = null;
            savedBreakTime = null;
        }
        
        workMinutes = savedWorkTime ? parseInt(savedWorkTime) : this.DEFAULT_WORK_MINUTES;
        breakMinutes = savedBreakTime ? parseInt(savedBreakTime) : this.DEFAULT_BREAK_MINUTES;
        
        // 範囲チェック
        this.workTimeMinutes = Math.max(1, Math.min(60, workMinutes));
        this.breakTimeMinutes = Math.max(1, Math.min(30, breakMinutes));
        
        // 秒に変換
        this.workTimeSeconds = this.workTimeMinutes * 60;
        this.breakTimeSeconds = this.breakTimeMinutes * 60;
    }
    
    saveSettings() {
        // localStorageに設定を保存
        try {
            localStorage.setItem('pomodoro-work-time', this.workTimeMinutes);
            localStorage.setItem('pomodoro-break-time', this.breakTimeMinutes);
        } catch (e) {
            // localStorageが使用できない場合は何もしない
            console.log('localStorage not available');
        }
    }
    
    start() {
        if (this.isRunning) return;
        
        var self = this;
        this.isRunning = true;
        this.intervalId = setInterval(function() {
            self.timeRemaining--;
            self.updateDisplay();
            self.updateProgressRing();
            
            if (self.timeRemaining <= 0) {
                self.complete();
            }
        }, 1000);
        
        this.updateButtons();
    }
    
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.intervalId);
        this.intervalId = null;
        
        this.updateButtons();
    }
    
    reset() {
        this.stop();
        this.currentMode = this.MODE.WORK;
        this.timeRemaining = this.workTimeSeconds;
        this.updateDisplay();
        this.updateProgressRing();
        this.updateButtons();
    }
    
    updateTimeSettings() {
        // 実行中は設定変更を無視
        if (this.isRunning) {
            return;
        }
        
        // 入力値を取得
        var workMinutes = parseInt(this.workTimeInput.value) || this.DEFAULT_WORK_MINUTES;
        var breakMinutes = parseInt(this.breakTimeInput.value) || this.DEFAULT_BREAK_MINUTES;
        
        // 範囲チェックして保存
        this.workTimeMinutes = Math.max(1, Math.min(60, workMinutes));
        this.breakTimeMinutes = Math.max(1, Math.min(30, breakMinutes));
        
        // 秒に変換
        this.workTimeSeconds = this.workTimeMinutes * 60;
        this.breakTimeSeconds = this.breakTimeMinutes * 60;
        
        // localStorageに保存
        this.saveSettings();
        
        // 現在のモードに応じて時間を更新
        if (this.currentMode === this.MODE.WORK) {
            this.timeRemaining = this.workTimeSeconds;
        } else {
            this.timeRemaining = this.breakTimeSeconds;
        }
        
        this.updateDisplay();
        this.updateProgressRing();
    }
    
    incrementValue(targetId) {
        if (this.isRunning) return;
        
        var input = document.getElementById(targetId);
        var currentValue = parseInt(input.value);
        var maxValue = parseInt(input.max);
        
        if (currentValue < maxValue) {
            input.value = currentValue + 1;
            this.updateTimeSettings();
        }
    }
    
    decrementValue(targetId) {
        if (this.isRunning) return;
        
        var input = document.getElementById(targetId);
        var currentValue = parseInt(input.value);
        var minValue = parseInt(input.min);
        
        if (currentValue > minValue) {
            input.value = currentValue - 1;
            this.updateTimeSettings();
        }
    }
    
    complete() {
        this.stop();
        
        if (this.currentMode === this.MODE.WORK) {
            // 作業完了 → 休憩開始
            this.showNotification('ポモドーロ完了！お疲れ様でした！\n5分間の休憩を開始します。');
            this.startBreak();
        } else {
            // 休憩完了 → リセット
            this.showNotification('休憩時間終了！\nお疲れ様でした。');
            this.reset();
        }
    }
    
    showNotification(message) {
        // iOS Safariでも動作するalertの代替
        try {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Pomodoro Timer', { body: message });
            } else {
                alert(message);
            }
        } catch (e) {
            // フォールバック: モーダル表示
            var modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = '50%';
            modal.style.left = '50%';
            modal.style.transform = 'translate(-50%, -50%)';
            modal.style.background = 'white';
            modal.style.padding = '20px';
            modal.style.border = '2px solid #ccc';
            modal.style.borderRadius = '10px';
            modal.style.zIndex = '1000';
            modal.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
            modal.innerHTML = '<p>' + message + '</p><button onclick="this.parentNode.remove()">OK</button>';
            document.body.appendChild(modal);
        }
    }
    
    startBreak() {
        this.currentMode = this.MODE.BREAK;
        this.timeRemaining = this.breakTimeSeconds;
        this.updateDisplay();
        this.updateProgressRing();
        this.start();
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timeDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
        // モード表示を更新
        const modeText = this.currentMode === this.MODE.WORK ? 'Work' : 'Break';
        this.modeDisplay.textContent = modeText;
        
        // タイトルにモードを表示
        document.title = `${modeText} - ${this.timeDisplay.textContent}`;
    }
    
    updateButtons() {
        this.startBtn.disabled = this.isRunning;
        this.stopBtn.disabled = !this.isRunning;
        // resetBtn は常に有効
        
        // 実行中は設定変更を無効にする
        this.workTimeInput.disabled = this.isRunning;
        this.breakTimeInput.disabled = this.isRunning;
        
        // プラス・マイナスボタンも実行中は無効
        this.plusBtns.forEach(btn => btn.disabled = this.isRunning);
        this.minusBtns.forEach(btn => btn.disabled = this.isRunning);
    }
    
    updateProgressRing() {
        var totalTime = this.currentMode === this.MODE.WORK ? this.workTimeSeconds : this.breakTimeSeconds;
        var progress = (totalTime - this.timeRemaining) / totalTime;
        var offset = this.circleCircumference * (1 - progress);
        this.progressRing.style.strokeDashoffset = offset;
        
        // モードによってプログレスリングの色を変更
        if (this.currentMode === this.MODE.WORK) {
            this.progressRing.style.stroke = '#d32f2f'; // 作業時間: 赤
        } else {
            this.progressRing.style.stroke = '#4caf50'; // 休憩時間: 緑
        }
    }
}

// DOMが読み込まれたらPomodoroTimerを初期化
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});