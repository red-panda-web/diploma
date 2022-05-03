import Timer from "./timer.js";
import keyboard from "./keyboard.js";
import { showModal, hideModal } from "./modal.js";
import words from "./lessonTexts.js";

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
      
      keyboard.hints = true;
      // Создаем текст
      createText(keyboard.keyboardLanguage, lesson);   
   }

   function createText(language: string, lessonName: string): void {
      const text: string = words[lessonName][language];  // Текст в зависимости от выбранного урока и языка
      
      appendText(text); // Вставляем текст

      hideModal(`.${trainer.classes.settingsModal}`)  // Прячем модально окно

      addHintHighlight()   // Подсвечиваем первую букву

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

         trainer.results.typedSymbols++;  // Считаем напечатанные символы

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
            removeHintHighlight();   // Если включены подсказки, то убираем текущую подсказку
            addHintHighlight(); // И подсвечиваем следующую букву
         }
         else {   // Иначе
            textArea.blur();  // Снимаем фокус с поля ввода текста
            showStatistics(); // Показываем статистику
         }
      } 
   } 

   function showStatistics(): void {   // Показ статистики 
      const erros: number = trainer.results.errors;

      showModal(`.${trainer.classes.resultModal}`);   // Показываем модалку со статистикой
      if (erros <= 5) document.querySelector(`.${trainer.classes.resultModal} .result_success`)?.classList.remove("hidden");
      else document.querySelector(`.${trainer.classes.resultModal} .result_fail`)?.classList.remove("hidden");       
   }

   function horizontalTextAlignment() { // Горизонтальное расположение блоков текста
      const horizontalBtn: HTMLElement | null = document.querySelector("#horizontal");
      const verticalBtn: HTMLElement | null = document.querySelector("#vertical");
      const textBody: HTMLElement | null = document.querySelector(".trainerText__body");

      if (horizontalBtn != null && verticalBtn != null && textBody != null) {
         horizontalBtn.classList.add("selected");
         verticalBtn.classList.remove("selected");
         textBody.classList.remove("trainerText__body_vertical");
         textBody.classList.add("trainerText__body_horizontal");
      }
   }

   function verticalTextAlignment() {  // Вертикальное расположение блоков текста
      const horizontalBtn: HTMLElement | null = document.querySelector("#horizontal");
      const verticalBtn: HTMLElement | null = document.querySelector("#vertical");
      const textBody: HTMLElement | null = document.querySelector(".trainerText__body");

      if (horizontalBtn != null && verticalBtn != null && textBody != null) {
         horizontalBtn.classList.remove("selected");
         verticalBtn.classList.add("selected");
         textBody.classList.remove("trainerText__body_horizontal");
         textBody.classList.add("trainerText__body_vertical");
      }
   }

   const submitBtn: HTMLElement | null = document.querySelector(".tabs__form-btn");
   if (submitBtn != null) submitBtn.addEventListener("click", getFormData)
   else throw new Error("Submit button is null");

   const horizontalBtn: HTMLElement | null = document.querySelector("#horizontal");   // Горизонтальное расположение блоков текста
   if (horizontalBtn != null) horizontalBtn.addEventListener("click", horizontalTextAlignment)
   else throw new Error("Horizontal button is null");

   const verticalBtn: HTMLElement | null = document.querySelector("#vertical");   // Вертикальное расположение блоков текста
   if (verticalBtn != null) verticalBtn.addEventListener("click", verticalTextAlignment)
   else throw new Error("Vertical button is null");
   
} catch (error: any) {
   alert(error.message);
}