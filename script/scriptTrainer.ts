import Timer from "./timer.js";
import keyboard from "./keyboard.js";
import { showModal, hideModal } from "./modal.js";

const trainer: ITrainer = {  // Параметры тренажера
   timerObj: new Timer(),
   results: {
      errors: 0,
      typedSymbols: 0,
   },
   classes: {
      settingsModal: "modal_trainer-settings", // Класс модального окна с настройками тренжера
      resultModal: "modal_result", // Класс модального окна с статистикой
      inputTextField: "trainerText__entered-area",   // Класс поля ввода текста
      originalTextField: "trainerText__original", // Класс блока исходного текста
      originalTextSymbol: "trainerText__item",  // Класс буквы исходного текста
      currentOriginalTextSymbol: "trainerText__item_current",  // Класс буквы исходного текста, которую пользователю необходимо ввести в данный момент
      correctlyEnteredSymbol: "trainerText__item_correct",  // Класс для отметки правильно введенной буквы
      wrongEnteredSymbol: "trainerText__item_wrong",   // Класс для отметки неправильно введеной буквы
      hintHighlight: "keyHintHighlight"   // Класс для подсветки-подсказки
   }
}

interface ITrainer {  // Интерфейс тренажера
   timerObj: Timer;
   results: {
      errors: number;
      typedSymbols: number;
   },
   classes: {
      [elementName: string]: string;
   }
}

try {
   // Получение и установка настроек тренажера
   function getFormData(e: Event): void {  
      e.preventDefault();  // Предотвращеаем стандартное поведение кнопки "Submit"
      
      // Считываем все возможные варианты языка, подсказок, размер текста, вид получаемого текста (предложения или абзацы) 
      const languageRadio = Array.from(document.getElementsByName("text-language")) as HTMLInputElement[]; 
      const textSizeElem = document.querySelector("#text-size") as HTMLInputElement;
      const hintsRadio = Array.from(document.getElementsByName("text-hints")) as HTMLInputElement[];

      // Получаем выбранные пользователем варианты и устанавливаем свойства в объект тренера и клавиатуры
      let textSize: number = 0;
      if (textSizeElem != undefined && +textSizeElem.value > 0 && +textSizeElem.value <= 10) textSize = +textSizeElem.value;
      else {
         document.querySelector(".text-size-error")?.classList.remove("not-displayed");
         throw new Error("Text size is undefined or incorrect");
      } 

      const language: string | undefined = languageRadio.find((item: HTMLInputElement) => item.checked)?.value;
      if (language != undefined) {
         keyboard.keyboardLanguage = language;
         keyboard.setLanguage(language);
      }
      else throw new Error("Language is undefined"); 
        
      const hints: string | undefined  = hintsRadio.find((item: HTMLInputElement) => item.checked)?.value;
      if (hints != undefined) {
         if (hints === "With") keyboard.hints = true
         else keyboard.hints = false
      } 
      else throw new Error("Hints is undefined");
     
      // Создаем текст
      createText(keyboard.keyboardLanguage, textSize);   
   }

   async function createText(language: string, textSize: number): Promise<void> {
      let url: string; // URL адрес по которому будет направлен запрос 

      // В зависимости от выбранного языка устанавливаем URL адрес на который будет отправлять запрос
      if (language === "Rus") url = `https://fish-text.ru/get?number=${textSize}`;   
      else url = `https://baconipsum.com/api/?type=meat-and-filler&sentences=${textSize}`;
      
      const response: Response = await fetch(url);

      if (response.status != 200) throw new Error("Fetch error");

      const fullResponse = await response.json(); 

      const text: string = fullResponse.text || fullResponse[0];   // Получаем текст
      appendText(text); // Вставляем текст

      hideModal(`.${trainer.classes.settingsModal}`)  // Прячем модально окно

      if (keyboard.hints) {
         addHintHighlight(); // Если включены подсказки, то подсвечиваем первую клавишу на клавиатуре, которую необходимо нажать
      } 

      const textArea: HTMLTextAreaElement | null = document.querySelector(`.${trainer.classes.inputTextField}`); // TextArea для ввода текста пользователя
      if (textArea != null){  // Если такая существует
         textArea.oninput = checkSymbol;  // Активируем событие проверки каждого введенного сивола
         textArea.onpaste = () => false;  // Отключаем возможность вставки текста
         textArea.focus(); // Ставим на фокус на форму
      } 
      else throw new Error("Text area for entered text is null"); // Если такая форма не существует – кидаем ошибку
   }

   // Вставка текста с HTML разметкой
   function appendText(text: string): void {   
      const textBody: HTMLElement | null = document.querySelector(`.${trainer.classes.originalTextField}`);   // Находим элемент куда будем его вставлять

      // Если элемент для вставки найден
      if (textBody != null) {
         text.split("").forEach((item: string, index: number) => { // Для каждого символа текста 
            const span: HTMLElement = document.createElement("span");   // То создаем для него элемент
            span.classList.add(trainer.classes.originalTextSymbol);  // Добавляем класс

            if (index === 0) span.classList.add(trainer.classes.currentOriginalTextSymbol); // Самый первый символ в тексте отмечаем как текущий

            if (item === "ё") span.textContent = "е"; // Вставляем содержимое в созданный элемент + дополнительная проверка на букву "ё"
            else span.textContent = item;

            textBody.append(span);  // Вставляем элемент на страницу 
         });
      }  // Если элемент для вставки не найден - выбрасываем ошибку
      else throw new Error("The text insertion location was not found");
   }

   // Подсветка-подсказка клавиши
   function addHintHighlight(): void { 
      // Текущий символ из текста, клавишу с которым следует нажать пользователю
      const symbolContent: string | null | undefined  = document.querySelector(`.${trainer.classes.currentOriginalTextSymbol}`)?.textContent;
      
      if (symbolContent) {   // Проверяем существование элемента и его контента 
         
         if (symbolRequiresPressingTwoKeys(symbolContent)) {   // Если символ это клавиша для ввода которой необходимо нажать 2 клавиши
            const rightShift: HTMLElement | null = document.querySelector(`.keyboard__item[data-key="ShiftRight"]`); // То дополнительно подсвечиваем shift
            if (rightShift) rightShift.classList.add(trainer.classes.hintHighlight);
         }

         const objProp = Object.entries(keyboard.keysValues);   // Массив пар ключ-значение [keyCode: string] : {Rus: string; Eng: string}
         
         objProp.find(item => {  // Обходим все пары значений и ищем код клавиши соответствующую текущему символу из текста
            if (item[1][keyboard.keyboardLanguage].includes(symbolContent.toUpperCase())) { // Если нашли
               const keyboardBtn: HTMLElement | null = document.querySelector(`.keyboard__item[data-key="${item[0]}"]`); // Ищем на виртуальной клавиатуре кнопку с таким кодом
               if (keyboardBtn != null) {
                  keyboardBtn.classList.add(trainer.classes.hintHighlight);   // Если нашли, то подсвечиваем
                  return true;
               }
               else throw new Error("The key corresponding to the current character was not found");  // Иначе ошибка
            }
         });
      }
   }

   function symbolRequiresPressingTwoKeys(symbol: string): boolean { // Функция для проверки требует ли символ нажатия двух клавиш одновременно (shift + ...)
      const symbolsThatRequire: string[] = ["!", "?", ":"];  // Символы требующие нажатия двух клавиш в обоих языках
      const symbolsThatNotRequire: string[] = [" ", ",", ".", "-", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];  // Символы не требующие нажатия двух клавиш
      
      // Если символ в верхнем регистре и не относится к символам не требующим нажатмя двух клавиш
      return symbol === symbol.toUpperCase() && !symbolsThatNotRequire.includes(symbol) 
         || symbolsThatRequire.includes(symbol)  // Или является специальным символом
         || keyboard.keyboardLanguage === "Rus" && symbol === "," ? true : false;   // Или является запятой при наборе русского текста
   }

   // Выключение подсветки клавиши
   function removeHintHighlight(): void {  
      const elements: NodeListOf<Element> | null = document.querySelectorAll(`.${trainer.classes.hintHighlight}`);

      elements.forEach((item) => {
         item.classList.remove(trainer.classes.hintHighlight);
      });
   }

   // Проверка нажатой клавиши
   function checkSymbol(): void {  
      const textArea: HTMLTextAreaElement | null = document.querySelector(`.${trainer.classes.inputTextField}`); // Поле ввода текста
      const currentSymbolElement: HTMLElement | null = document.querySelector(`.${trainer.classes.currentOriginalTextSymbol}`);  // Элемент с текущим символом, который необходимо ввести

      if (textArea != null && currentSymbolElement != null) {  // Если они существуют

         if (trainer.results.typedSymbols === 0) {
            startTimer();   // Если напечатан первый символ, то запускаем таймер
            trainer.results.typedSymbols++;  // Считаем напечатанные символы
         } 
         else trainer.results.typedSymbols++;

         const textAreaLastSymbol = textArea.value[textArea.value.length - 1];   // Последний символ из поля ввода
         const currentSymbol = currentSymbolElement.textContent;  // Символ, который необходимо ввести

         if (textAreaLastSymbol === currentSymbol) {   // Если пользователь ввел правильный символ
               currentSymbolElement.classList.remove(trainer.classes.currentOriginalTextSymbol);   // Убираем у текущего символа из оригинального текста соответствующий класс
               currentSymbolElement.classList.add(trainer.classes.correctlyEnteredSymbol);   // И отмечаем его как верно введеный
            }
         else {   // Если пользователь ввел неверный символ
            currentSymbolElement.classList.remove(trainer.classes.currentOriginalTextSymbol);    // Убираем у текущего символа из оригинального текста соответствующий класс
            currentSymbolElement.classList.add(trainer.classes.wrongEnteredSymbol);  /// И отмечаем его как неверно введеный
            trainer.results.errors++;  // Считаем ошибки
         }

         const nextSymbol: Element | null = currentSymbolElement.nextElementSibling; // Следующай символ в оригинальном тексте после текущего

         if (nextSymbol != null) {  // Если это был не последний символ текста
            nextSymbol.classList.add(trainer.classes.currentOriginalTextSymbol);   // То обозначаем следующий символ текста как текущий
            if (keyboard.hints) {
               removeHintHighlight();   // Если включены подсказки, то убираем текущую подсказку
               addHintHighlight(); // И подсвечиваем следующую букву
            } 
         }
         else {   // Иначе
            stopTimer();  // Останавливаем таймер
            textArea.blur();  // Снимаем фокус с поля ввода текста
            showStatistics(); // Показываем статистику
         }
      } 
   } 

   // Запуск таймера 
   function startTimer(): void {   
      document.querySelector(".info__message .text")?.classList.add("not-displayed");  // Подсказка о включении таймера при начале печати
      trainer.timerObj.start(); // Запуск таймера
   }

   // Остановка таймера
   function stopTimer(): void {   
      trainer.timerObj.stop();
   }

   function showStatistics(): void {   // Показ статистики 
      const language: string = keyboard.keyboardLanguage;  // Считываем конечные данные
      const symbolsCount: number = document.querySelectorAll(`.${trainer.classes.originalTextSymbol}`).length;
      const erros: number = trainer.results.errors;
      const accuracy: number = 100 - (erros / symbolsCount * 100);
      const timerObj: Timer = trainer.timerObj;
      const timeInSec: number = timerObj.getHours() * 3600 + timerObj.getMins() * 60 + timerObj.getSecs();
      const typeSpeed: number = symbolsCount / timeInSec * 60;

      const languageCellTable: HTMLElement | null = document.querySelector(".result-table__language");  // Находим куда будем их вставлять
      const symbolsCountCellTable: HTMLElement | null = document.querySelector(".result-table__symbols-count");
      const errorsCellTable: HTMLElement | null = document.querySelector(".result-table__errors");
      const accuracyCellTable: HTMLElement | null = document.querySelector(".result-table__accuracy");
      const timeCellTable: HTMLElement | null = document.querySelector(".result-table__time");
      const typeSpeedCellTable: HTMLElement | null = document.querySelector(".result-table__type-speed");

      if (languageCellTable != null) languageCellTable.textContent = language === "Rus" ? "Русский" : "Английский";   // И вставляем проверяя ячейки на существование
      else throw new Error("languageCellTable is null");

      if (symbolsCountCellTable != null) symbolsCountCellTable.textContent = String(symbolsCount);
      else throw new Error("symbolsCountCellTable is null");

      if (errorsCellTable != null) errorsCellTable.textContent = String(erros);
      else throw new Error("errorsCellTable is null");

      if (accuracyCellTable != null) accuracyCellTable.textContent = accuracy.toFixed(2) + " %";
      else throw new Error("accuracyCellTable is null");

      if (timeCellTable != null) timeCellTable.textContent = timerObj.getTime();
      else throw new Error("timeCellTable or time is null");

      if (typeSpeedCellTable != null) typeSpeedCellTable.textContent = typeSpeed.toFixed(2) + " зн/мин.";
      else throw new Error("typeSpeedCellTable is null");
   
      showModal(`.${trainer.classes.resultModal}`);   // Показываем модалку со статистикой
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

   const submitBtn: HTMLElement | null = document.querySelector(".tabs__form-btn"); // Кнопка подтверждения
   if (submitBtn != null) submitBtn.addEventListener("click", getFormData)
   else throw new Error("Submit button is null");
   
   const tabsElement: HTMLElement | null = document.querySelector(".tabs");    // Переключение вкладок
   if (tabsElement != null) tabsElement.addEventListener("click", tabs)
   else throw new Error("tabsElement is null") 
}
catch (error: any) {
   alert(error.message);
} 
