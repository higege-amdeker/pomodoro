class PomodoroTimer {
    constructor() {
        // デフォルトの時間設定（分）
        this.DEFAULT_WORK_MINUTES = 25;
        this.DEFAULT_BREAK_MINUTES = 5;
        
        // 現在の時間設定（秒）
        this.workTimeSeconds = this.DEFAULT_WORK_MINUTES * 60;
        this.breakTimeSeconds = this.DEFAULT_BREAK_MINUTES * 60;
        
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
        
        // 円の周長を計算（半径90px）
        this.circleCircumference = 2 * Math.PI * 90;
        
        // 初期化
        this.init();
    }
    
    init() {
        // イベントリスナーの設定
        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // 時間設定のイベントリスナー
        this.workTimeInput.addEventListener('change', () => this.updateTimeSettings());
        this.breakTimeInput.addEventListener('change', () => this.updateTimeSettings());
        
        // プラス・マイナスボタンのイベントリスナー
        this.plusBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.incrementValue(e.target.dataset.target));
        });
        this.minusBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.decrementValue(e.target.dataset.target));
        });
        
        // 初期表示の更新
        this.updateDisplay();
        this.updateButtons();
        this.updateProgressRing();
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.intervalId = setInterval(() => {
            this.timeRemaining--;
            this.updateDisplay();
            this.updateProgressRing();
            
            if (this.timeRemaining <= 0) {
                this.complete();
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
        
        // 入力値を取得して秒に変換
        const workMinutes = parseInt(this.workTimeInput.value) || this.DEFAULT_WORK_MINUTES;
        const breakMinutes = parseInt(this.breakTimeInput.value) || this.DEFAULT_BREAK_MINUTES;
        
        this.workTimeSeconds = workMinutes * 60;
        this.breakTimeSeconds = breakMinutes * 60;
        
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
        
        const input = document.getElementById(targetId);
        const currentValue = parseInt(input.value);
        const maxValue = parseInt(input.max);
        
        if (currentValue < maxValue) {
            input.value = currentValue + 1;
            this.updateTimeSettings();
        }
    }
    
    decrementValue(targetId) {
        if (this.isRunning) return;
        
        const input = document.getElementById(targetId);
        const currentValue = parseInt(input.value);
        const minValue = parseInt(input.min);
        
        if (currentValue > minValue) {
            input.value = currentValue - 1;
            this.updateTimeSettings();
        }
    }
    
    complete() {
        this.stop();
        
        if (this.currentMode === this.MODE.WORK) {
            // 作業完了 → 休憩開始
            alert('ポモドーロ完了！お疲れ様でした！\n5分間の休憩を開始します。');
            this.startBreak();
        } else {
            // 休憩完了 → リセット
            alert('休憩時間終了！\nお疲れ様でした。');
            this.reset();
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
        const totalTime = this.currentMode === this.MODE.WORK ? this.workTimeSeconds : this.breakTimeSeconds;
        const progress = (totalTime - this.timeRemaining) / totalTime;
        const offset = this.circleCircumference * (1 - progress);
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