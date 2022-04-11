export default class Timer {
    constructor() {
        this.hours = 0; // Часы, минуты, секунды
        this.mins = 0;
        this.secs = 0;
        this.stopTimer = false; // Флаг дял контроля остановки таймера
    }
    start() {
        const timer = setInterval(() => {
            if (this.stopTimer)
                clearInterval(timer); // Если был вызван метод остановки, то интервал прерывается
            else { // Иначе остчитывает время
                this.secs++;
                if (this.secs === 60) {
                    this.secs = 0;
                    this.mins++;
                }
                if (this.mins === 60) {
                    this.mins = 0;
                    this.hours++;
                }
            }
        }, 1000);
    }
    stop() {
        this.stopTimer = true;
    }
    getTime() {
        return `${this.hours < 10 ? "0" + this.hours : this.hours}:${this.mins < 10 ? "0" + this.mins : this.mins}:${this.secs < 10 ? "0" + this.secs : this.secs}`;
    }
    getHours() {
        return this.hours;
    }
    getMins() {
        return this.mins;
    }
    getSecs() {
        return this.secs;
    }
}
//# sourceMappingURL=timer.js.map