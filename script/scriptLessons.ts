import Timer from "./timer.js";
import keyboard from "./keyboard.js";
import { showModal, hideModal } from "./modal.js";
import words from "./lessonTexts.js";

const trainer: ITrainer = {  // Параметры тренажера
   settings: {
      timerObj: undefined
   },
   results: {
      errors: 0,
      typedSymbols: 0,
   }
}

interface ITrainer {  // Интерфейс тренажера
   settings: {
      timerObj: Timer | undefined;
   },
   results: {
      errors: number;
      typedSymbols: number;
   }
}

try {
      // Получение и установка настроек тренажера
   function getFormData(e: Event): void {  
      e.preventDefault();  // Предотвращеаем стандартное поведение кнопки "Submit" 

      // Считываем все возможные варианты языка
      const languageRadio = Array.from(document.getElementsByName("text-language")) as HTMLInputElement[]; 
      const lessonsRadio = Array.from(document.getElementsByName("lesson-number")) as HTMLInputElement[]; 

      // Получаем выбранные пользователем варианты и устанавливаем свойства в объект тренера и клавиатуры
      const language: string | undefined = languageRadio.find((item: HTMLInputElement) => item.checked)?.value;
      if (language != undefined) {
         keyboard.keyboardLanguage = language;
         keyboard.setLanguage(language);
      }
      else throw new Error("Language is undefined");   

      const lesson: string | undefined = lessonsRadio.find((item: HTMLInputElement) => item.checked)?.value;
      if (lesson === undefined) throw new Error("Lesson is undefined"); 
      
      // Создаем текст
      createText(keyboard.keyboardLanguage, lesson);   
   }

   function createText(language: string, lessonName: string): void {
      const text: string = words[lessonName][language];  // Текст в зависимости от выбранного урока и языка
      
      appendText(text); // Вставляем текст

      hideModal(".modal_trainer-settings")  // Прячем модально окно

      addHintHighlight()   // Подсвечиваем первую букву

      document.addEventListener("keydown", checkSymbol);
   }

   // Вставка текста с HTML разметкой
   function appendText(text: string): void {   
      const textBody: HTMLElement | null = document.querySelector(".trainerText__body");   // Находим элемент куда будем его вставлять

      // Если элемент для вставки найден
      if (textBody != null) {
         // Список символов, которые пользователь не должен будет вводить при печати. Не выделяются в тексте.
         const specialSymbols: string[] = ["!", "-", ":", "?"];

         text.split("").forEach((item: string, index: number) => { // Для каждого символа текста 
            if (specialSymbols.indexOf(item) === -1) {   // Если символ не относится к специальным
               const span: HTMLElement = document.createElement("span");   // То создаем для него элемент
               span.classList.add("trainerText__item");  // Добавляем класс

               if (index === 0) span.classList.add("trainerText__item_current"); // Первый символ в тексте отмечаем как текущий

               if (item === "ё") span.textContent = "е"; // Вставляем содержимое в созданный элемент + дополнительная проверка на букву "ё"
               else span.textContent = item;

               textBody.append(span);  // Вставляем элемент на страницу 
            }
            else textBody.append(item);   // Если символ относиться к специальным, то просто вставляем его без элемента
         });
      }  // Если элемент для вставки не найден - выбрасываем ошибку
      else throw new Error("The text insertion location was not found");
   }

   // Подсветка-подсказка клавиши
   function addHintHighlight(): void { 
      // Текущий символ из текста, клавишу с которым следует нажать пользователю
      const symbolElement: HTMLElement | null  = document.querySelector(".trainerText__item_current");
        
      if (symbolElement != null){   // Проверяем существование элемента и его контента 
         const symbolContent: string | null = symbolElement.textContent;
         if (symbolContent != null) {
            const currentSymbol: string = symbolContent; // Запоминаем символ
            const language: string = keyboard.keyboardLanguage // Выбранный язык текста
            const objProp = Object.entries(keyboard.keysValues);   // Массив пар ключ-значение [keyCode: string] : {Rus: string; Eng: string}
            
            objProp.find(item => {  // Обходим все пары значений и ищем код клавиши соответствующую текущему символу из текста
               if (item[1][language] === currentSymbol.toUpperCase()) { // Если нашли
                  const key: string = item[0]; // Запоминаем
                  const keyboardBtn: HTMLElement | null = document.querySelector(`.keyboard__item[data-key="${key}"]`); // Ищем на виртуальной клавиатуре кнопку с таким кодом
                  if (keyboardBtn != null) {
                     keyboardBtn.classList.add("keyHintHighlight");   // Если нашли, то подсвечиваем
                     return true;
                  } 
                  else throw new Error("The key corresponding to the current character was not found");  // Иначе ошибка
               } 
            });               
         }
      }
   }

   // Выключение подсветки клавиши
   function removeHintHighlight(): void {  
      const element: HTMLElement | null = document.querySelector(".keyHintHighlight");

      if (element != null && element.classList.contains("keyHintHighlight")) {
         element.classList.remove("keyHintHighlight");
      }
   }

   // Проверка нажатой клавиши
   function checkSymbol(e: KeyboardEvent): void {  
      // Проверяем что нажата проверяемая клавиша (буквенная или пробел)
      if (Object.keys(keyboard.keysValues).indexOf(e.code) != -1) { 

         if (trainer.results.typedSymbols === 0) {
            trainer.settings.timerObj = startTimer();   // Если напечатан первый символ, то запускаем таймер
            updateTimer(trainer.settings.timerObj);   // И включаем обновление таймера
         } 

         if (e.code === "Space") e.preventDefault();  // Если был нажат пробел, то отключаем стандартную прокрутку страницы при его нажатии

         const currentSymbol: HTMLElement | null = document.querySelector(".trainerText__item_current");  // Текущий символ из текста, клавишу с которым следует нажать пользователю

         if (currentSymbol != null) {
            const language: string = keyboard.keyboardLanguage // Выбранный язык текста
            const pressedSymbol: string = keyboard.keysValues[e.code][language];  // Символ, который соответствует нажатой пользователем клавиши
            
            
            if (currentSymbol.textContent === pressedSymbol || currentSymbol.textContent === pressedSymbol.toLowerCase()) {   // Если пользователь нажал правильную клавишу
               currentSymbol.classList.remove("trainerText__item_current");   // Убираем у текущего символа соответствующий класс
               currentSymbol.classList.add("trainerText__item_correct");   // И отмечаем его как верно нажатый
            }
            else {   // Если пользователь нажал неверную клавишу
               currentSymbol.classList.remove("trainerText__item_current");    // Убираем у текущего символа соответствующий класс
               currentSymbol.classList.add("trainerText__item_wrong");  /// И отмечаем его как неверно нажатый
               trainer.results.errors++;  // Считаем ошибки
            }

            if (keyboard.hints) removeHintHighlight();   // Если включены подсказки, то убираем текущую подсказку

            trainer.results.typedSymbols++;  // Считаем напечатанные символы

            const nextSymbol: Element | null = currentSymbol.nextElementSibling; // Следующай символ после текущего

            if (nextSymbol != null) {  // Если это был не последний символ текста
               nextSymbol.classList.add("trainerText__item_current");   // То обозначаем следующий символ текста как текущий
               addHintHighlight(); // И подсвечиваем его
            }
            else {   // Иначе
               stopTimer(trainer.settings.timerObj);  // Останавливаем таймер
               showStatistics(); // Показываем статистику
            }
         }
         else throw new Error("Current text symbol is null");        
      }
   }

   // Запуск таймера 
   function startTimer(): Timer {   
      let timerHTMLElem: HTMLElement | null = document.querySelector(".trainer-timer");  // HTML объект таймера

      if (timerHTMLElem != null) {
         document.querySelector(".info__message .text")?.classList.add("not-displayed");  // Подсказка о включении таймера при начале печати

         let timerObj: Timer = new Timer();  // Новый объект таймера

         timerObj.start(); // Запуск таймера

         return timerObj;
      }
      else throw new Error("Timer element is null");  
   }

   // Ежесекундное обновление таймера в элементе
   function updateTimer(timerObj: Timer): void {
      const timerElem: HTMLElement | null = document.querySelector(".trainer-timer");
      if (timerElem != null) {
         setInterval(() => {
            timerElem.innerHTML = timerObj.getTime();
         }, 1000)
      }
      else throw new Error("Timer element is null");
   }

   // Остановка таймера
   function stopTimer(timerObj: Timer | undefined): void {   
      timerObj?.stop();
   }

   function showStatistics(): void {   // Показ статистики 
      const timerObj: Timer | undefined = trainer.settings.timerObj;

      if (timerObj != undefined) {
         const erros: number = trainer.results.errors;

         showModal(".modal_result");   // Показываем модалку со статистикой
         if (erros <= 5) document.querySelector(".modal_result .result_success")?.classList.remove("hidden");
         else document.querySelector(".modal_result .result_fail")?.classList.remove("hidden");       
      }
      else throw new Error("timerObj is undefinded");
   }

   const submitBtn: HTMLElement | null = document.querySelector(".tabs__form-btn");
   if (submitBtn != null) submitBtn.addEventListener("click", getFormData)
   else throw new Error("Submit button is null");
   
} catch (error: any) {
   alert(error.message);
}