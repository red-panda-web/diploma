import Timer from "./timer.js";
import keyboard from "./keyboard.js";
import { showModal, hideModal } from "./modal.js";

const trainer: ITrainer = {  // Параметры тренажера
   settings: {
      textSize: "Medium",
      timerObj: undefined
   },
   results: {
      errors: 0,
      typedSymbols: 0,
   }
}

interface ITrainer {  // Интерфейс тренажера
   settings: {
      textSize: string;
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
      

      // Считываем все возможные варианты языка, размера текста, и подсказок
      const languageRadio = Array.from(document.getElementsByName("text-language")) as HTMLInputElement[]; 
      const textSizeRadio = Array.from(document.getElementsByName("text-size")) as HTMLInputElement[];
      const hintsRadio = Array.from(document.getElementsByName("text-hints")) as HTMLInputElement[];

      // Получаем выбранные пользователем варианты и устанавливаем свойства в объект тренера и клавиатуры
      const language: string | undefined = languageRadio.find((item: HTMLInputElement) => item.checked)?.value;
      if (language != undefined) {
         keyboard.keyboardLanguage = language;
         keyboard.setLanguage(language);
      }
      else throw new Error("Language is undefined");
      

      const textSize: string | undefined  = textSizeRadio.find((item: HTMLInputElement) => item.checked)?.value;
      if (textSize != undefined) trainer.settings.textSize = textSize;
      else throw new Error("Text size is undefined");
        
         
      const hints: string | undefined  = hintsRadio.find((item: HTMLInputElement) => item.checked)?.value;
      if (hints != undefined) {
         if (hints === "With") keyboard.hints = true
         else keyboard.hints = false
      } 
      else throw new Error("Hints is undefined");
     
      
      // Создаем текст
      createText(keyboard.keyboardLanguage, trainer.settings.textSize);   
   }

   async function createText(language: string, textSize: string): Promise<void> {
      let url: string; // URL адрес по которому будет направлен запрос 
      let sentenceCount: number;   // Количество предложений в генерируемом тексте
      
      // В зависимости от выбранного размера текста устанавливаем количество предложений в итоговом тексте
      if (textSize === "Small") sentenceCount = 3
      else if (textSize === "Medium") sentenceCount = 5
      else sentenceCount = 7;
   
      // В зависимости от выбранного языка устанавливаем URL адрес на который будет отправлять запрос
      if (language === "Rus") url = `https://fish-text.ru/get?number=${sentenceCount}`;   
      else url = `https://baconipsum.com/api/?type=meat-and-filler&sentences=${sentenceCount * 2}`;
      
      const response: Response = await fetch(url);

      if (response.status != 200) throw new Error("Fetch error");

      const fullResponse = await response.json(); 

      const text: string = fullResponse.text || fullResponse[0];   // Получаем текст
      appendText(text); // Вставляем текст

      hideModal(".modal_trainer-settings")  // Прячем модально окно

      if (keyboard.hints) {
         addHintHighlight(); // Если включены подсказки, то подсвечиваем первую клавишу на клавиатуре, которую необходимо нажать
      } 
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

            if (keyboard.hints){} removeHintHighlight();   // Если включены подсказки, то убираем текущую подсказку

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
         const language: string = keyboard.keyboardLanguage;  // Считываем конечные данные
         const textSize: string = trainer.settings.textSize;
         const symbolsCount: number = document.querySelectorAll(".trainerText__item").length;
         const erros: number = trainer.results.errors;
         const time: Element | null = document.querySelector(".trainer-timer");
         const accuracy: number = 100 - (erros / symbolsCount * 100);
         const timeInSec: number = timerObj.getHours() * 3600 + timerObj.getMins() * 60 + timerObj.getSecs();
         const typeSpeed: number = symbolsCount / timeInSec * 60;

         const languageCellTable: HTMLElement | null = document.querySelector(".result-table__language");  // Находим куда будем их вставлять
         const textSizeCellTable: HTMLElement | null = document.querySelector(".result-table__text-size");
         const symbolsCountCellTable: HTMLElement | null = document.querySelector(".result-table__symbols-count");
         const errorsCellTable: HTMLElement | null = document.querySelector(".result-table__errors");
         const accuracyCellTable: HTMLElement | null = document.querySelector(".result-table__accuracy");
         const timeCellTable: HTMLElement | null = document.querySelector(".result-table__time");
         const typeSpeedCellTable: HTMLElement | null = document.querySelector(".result-table__type-speed");

         if (languageCellTable != null) languageCellTable.textContent = language === "Rus" ? "Русский" : "Английский";   // И вставляем проверяя ячейки на существование
         else throw new Error("languageCellTable is null");

         if (textSizeCellTable != null) textSizeCellTable.textContent = textSize === "Small" ? "Маленький" : textSize === "Medium" ? "Средний" : "Большой";
         else throw new Error("textSizeCellTable is null");

         if (symbolsCountCellTable != null) symbolsCountCellTable.textContent = String(symbolsCount);
         else throw new Error("symbolsCountCellTable is null");

         if (errorsCellTable != null) errorsCellTable.textContent = String(erros);
         else throw new Error("errorsCellTable is null");

         if (accuracyCellTable != null) accuracyCellTable.textContent = accuracy.toFixed(2) + " %";
         else throw new Error("accuracyCellTable is null");

         if (timeCellTable != null && time != null) timeCellTable.textContent = time.textContent;
         else throw new Error("timeCellTable or time is null");

         if (typeSpeedCellTable != null) typeSpeedCellTable.textContent = typeSpeed.toFixed(2) + " зн/мин.";
         else throw new Error("typeSpeedCellTable is null");
      
         showModal(".modal_result");   // Показываем модалку со статистикой
      }
      else throw new Error("timerObj is undefinded");
   }

   function tabs(e: Event) {   // Переключение вкладок
      const aimTab = e.target as HTMLElement | null;   // Элемент по которому было нажатие

      if (aimTab != null && aimTab.classList.contains("tabs__row-item")) {  // Проверяем что этот элемент является вкладкой и не равен null
         const currentTab: HTMLElement | null = document.querySelector(".tabs__row-item.active"); // Получаем текущую активную вкладку
         
         if (currentTab != e.target && currentTab != null) { // Проверяем чтобы клик был не по ней же
            const currentContent: HTMLElement | null = document.querySelector(".tabs__content-item.active");  // Получаем текущее содержимое вкладки
            const aimContent: HTMLElement | null = document.querySelector(`.tabs__content-item[data-tab='${aimTab.dataset.tab}']`);   // и её контент

            if (currentContent != null && aimContent != null) {
               currentTab.classList.remove("active"); // Перключаем вкладки
               currentContent.classList.remove("active");
               currentContent.classList.add("not-displayed");

               aimTab.classList.add("active");
               aimContent.classList.remove("not-displayed");
               aimContent.classList.add("active");
            } 
         }
      }
   }


   const submitBtn: HTMLElement | null = document.querySelector(".tabs__form-btn");
   if (submitBtn != null) submitBtn.addEventListener("click", getFormData)
   else throw new Error("Submit button is null");
   
   const tabsElement: HTMLElement | null = document.querySelector(".tabs");    // Переключение вкладок
   if (tabsElement != null) tabsElement.addEventListener("click", tabs)
   else throw new Error("tabsElement is null") 
}
catch (error: any) {
   alert(error.message);
} 
