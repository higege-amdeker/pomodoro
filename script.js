class PomodoroTimer {
    constructor() {
        // ポモドーロテクニックの標準時間：25分（1500秒）
        this.POMODORO_TIME = 25 * 60; // 25分 = 1500秒
        this.timeRemaining = this.POMODORO_TIME;
        this.isRunning = false;
        this.intervalId = null;
        
        // DOM要素の取得
        this.timeDisplay = document.getElementById('timeDisplay');
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
        this.timeRemaining = this.POMODORO_TIME;
        this.updateDisplay();
        this.updateProgressRing();
        this.updateButtons();
    }
    
    complete() {
        this.stop();
        alert('ポモドーロ完了！お疲れ様でした！');
        this.reset();
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timeDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateButtons() {
        this.startBtn.disabled = this.isRunning;
        this.stopBtn.disabled = !this.isRunning;
        // resetBtn は常に有効
    }
    
    updateProgressRing() {
        const progress = (this.POMODORO_TIME - this.timeRemaining) / this.POMODORO_TIME;
        const offset = this.circleCircumference * (1 - progress);
        this.progressRing.style.strokeDashoffset = offset;
    }
}

// DOMが読み込まれたらPomodoroTimerを初期化
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});