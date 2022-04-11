export default class Timer {
   private hours: number = 0;  // Часы, минуты, секунды
   private mins: number = 0;
   private secs: number = 0;
   private stopTimer: boolean = false;   // Флаг дял контроля остановки таймера

   public start(): void {   // Запуск таймера
      const timer = setInterval(() : void => {
         if (this.stopTimer) clearInterval(timer); // Если был вызван метод остановки, то интервал прерывается
         else {   // Иначе остчитывает время
            this.secs++
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

   public stop(): void { // Остановка таймера
      this.stopTimer = true;
   }

   public getTime(): string {
      return `${this.hours < 10 ? "0" + this.hours : this.hours}:${this.mins < 10 ? "0" + this.mins : this.mins}:${this.secs < 10 ? "0" + this.secs : this.secs}`;
   }

   public getHours(): number {
      return this.hours;
   }

   public getMins(): number {
      return this.mins;
   }

   public getSecs(): number {
      return this.secs;
   }
}