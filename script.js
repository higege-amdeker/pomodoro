class PomodoroTimer {
    constructor() {
        // ポモドーロテクニックの標準時間
        this.WORK_TIME = 25 * 60; // 25分 = 1500秒
        this.BREAK_TIME = 5 * 60; // 5分 = 300秒
        
        // 現在のモード
        this.MODE = {
            WORK: 'work',
            BREAK: 'break'
        };
        
        this.currentMode = this.MODE.WORK;
        this.timeRemaining = this.WORK_TIME;
        this.isRunning = false;
        this.intervalId = null;
        
        // DOM要素の取得
        this.timeDisplay = document.getElementById('timeDisplay');
        this.modeDisplay = document.getElementById('modeDisplay');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.progressRing = document.querySelector('.progress-ring-progress');
        
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
        this.timeRemaining = this.WORK_TIME;
        this.updateDisplay();
        this.updateProgressRing();
        this.updateButtons();
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
        this.timeRemaining = this.BREAK_TIME;
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
        const modeText = this.currentMode === this.MODE.WORK ? 'Work Time' : 'Break Time';
        this.modeDisplay.textContent = modeText;
        
        // タイトルにモードを表示
        document.title = `${modeText} - ${this.timeDisplay.textContent}`;
    }
    
    updateButtons() {
        this.startBtn.disabled = this.isRunning;
        this.stopBtn.disabled = !this.isRunning;
        // resetBtn は常に有効
    }
    
    updateProgressRing() {
        const totalTime = this.currentMode === this.MODE.WORK ? this.WORK_TIME : this.BREAK_TIME;
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