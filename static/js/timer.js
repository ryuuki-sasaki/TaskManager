const result = document.getElementById('result');
const apptTime = document.getElementById('appt-time');
const start = document.querySelector('.start');
const stop = document.querySelector('.stop');
const reset = document.querySelector('.reset');
const sound = document.getElementById('sound-file');
const START = new Date('2000/01/01 00:00:00');
const INTERVAL = 1000;
let calc = new Date(+START - START + INTERVAL);
let isStop = false;
let intervalId = null;

const initialize = () => {
    intervalId = null;
    isStop = false;
    apptTime.value = '';
    // result.textContent = '時間を入力してStartを押すとタイマーが開始します。'
}

(function(){
    // 初期化処理
    initialize();
})();

const countdownTimer = () => {
    let addZero = function(n) { return ('0' + n).slice(-2); }
    if (+new Date(calc) <= INTERVAL) {
        // result.textContent = '終了しました。'
        removeInterval();
        sound.play();
    } else {
        calc = new Date(+new Date(calc) - INTERVAL);
        let hours = calc.getUTCHours() ? addZero(calc.getUTCHours()) + ':' : '00:';
        let minutes = addZero(calc.getUTCMinutes()) + ':';
        let seconds = addZero(calc.getUTCSeconds());
        apptTime.value = hours + minutes + seconds;
    }
}

const removeInterval = () => {
    console.log('removeInterval');
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

start.addEventListener('click', e => {
    console.log('start click');
    // デフォルトのイベントを無効
    e.preventDefault();
    if (!isStop) {
        let end = new Date(`2000/01/01 ${apptTime.value}`);
        calc = new Date(+end - START + INTERVAL);
    } else {
        isStop = false;
    }
    removeInterval();
    intervalId = setInterval(countdownTimer, INTERVAL);
});

stop.addEventListener('click', e => {
    console.log('stop click');
    // デフォルトのイベントを無効
    e.preventDefault();
    removeInterval();
    isStop = true;
});

reset.addEventListener('click', e => {
    console.log('reset click');
    // デフォルトのイベントを無効
    e.preventDefault();
    removeInterval();
    initialize();
});


