const keysValues = {   // Значения клавиш
   Rus: {   //Русская расладка
      "KeyA": "Ф",
      "KeyB": "И",
      "KeyC": "С",
      "KeyD": "В",
      "KeyE": "У",
      "KeyF": "А",
      "KeyG": "П",
      "KeyH": "Р",
      "KeyI": "Ш",
      "KeyJ": "О",
      "KeyK": "Л",
      "KeyL": "Д",
      "KeyM": "Ь",
      "KeyN": "Т",
      "KeyO": "Щ",
      "KeyP": "З",
      "KeyQ": "Й",
      "KeyR": "К",
      "KeyS": "Ы",
      "KeyT": "Е",
      "KeyU": "Г",
      "KeyV": "М",
      "KeyW": "Ц",
      "KeyX": "Ч",
      "KeyY": "Н",
      "KeyZ": "Я",
      "BracketLeft": "Х",
      "BracketRight": "Ъ",
      "Semicolon": "Ж",
      "Quote": "Э",
      "Comma": "Б",
      "Period": "Ю",
      "Slash": ".",
      "Space": " ",
   },
   Eng: {   // Английская раскладка
      "KeyA": "A",
      "KeyB": "B",
      "KeyC": "C",
      "KeyD": "D",
      "KeyE": "E",
      "KeyF": "F",
      "KeyG": "G",
      "KeyH": "H",
      "KeyI": "I",
      "KeyJ": "J",
      "KeyK": "K",
      "KeyL": "L",
      "KeyM": "M",
      "KeyN": "N",
      "KeyO": "O",
      "KeyP": "P",
      "KeyQ": "Q",
      "KeyR": "R",
      "KeyS": "S",
      "KeyT": "T",
      "KeyU": "U",
      "KeyV": "V",
      "KeyW": "W",
      "KeyX": "X",
      "KeyY": "Y",
      "KeyZ": "Z",
      "BracketLeft": "[",
      "BracketRight": "]",
      "Semicolon": ";",
      "Quote": "'",
      "Comma": ",",
      "Period": ".",
      "Slash": "/",
      "Space": " ",
   }
};

const trainer = {  // Параметры тренажера
   settings: {
      language: "Rus",
      textSize: "Medium",
      needTips: false,
      timerObj: {},
   },
   results: {
      errors: 0,
      typedSymbols: 0,
   }
}

function getFormData(e) {  // Получение и установка настроек тренажера
   e.preventDefault();  // Предотвращеаем стандартное поведение кнопки "Submit"
   const form = document.querySelector(".tabs__form");   // Находим форму
   const languageRadio = Array.from(form.elements["text-language"]); // Считываем все возможные варианты языка, размера текста, и подсказок
   const textSizeRadio = Array.from(form.elements["text-size"]);
   const tipsRadio = Array.from(form.elements["text-tips"]);
   trainer.settings.language = languageRadio.find(item => item.checked).value; // Получаем выбранные пользователем варианты и устанавливаем свойства в объект настроек
   trainer.settings.textSize = textSizeRadio.find(item => item.checked).value;
   const tips = tipsRadio.find(item => item.checked).value;

   tips === "With" ? trainer.settings.needTips = true : trainer.settings.needTips = false;

   changeKeyboardLanguage(trainer.settings.language);  // Меняем раскладку клавиатуры в соответствии с выбранным языком
   createText(trainer.settings.language, trainer.settings.textSize);   // Создаем текст
}

function createText(language, size) {  // Генерация текста с HTML разметкой
   let url = ""; // URL адрес по которому будет направлен запрос 
   let sentenceCount = 0;   // Количество предложений в генерируемом тексте
   
   // В зависимости от выбранного размера текста устанавливаем количество предложений в итоговом тексте
   if (size === "Small") sentenceCount = 3
   else if (size === "Medium") sentenceCount = 5
   else sentenceCount = 7;
  
   // В зависимости от выбранного языка устанавливаем URL адрес на который будет отправлять запрос
   if (language === "Rus") url = `https://fish-text.ru/get?number=${sentenceCount}`;   
   else url = `https://baconipsum.com/api/?type=meat-and-filler&sentences=${sentenceCount * 2}`;
   
   fetch(url)  // Отправляем запрос
      .then(response => response.json())  // Дожидаемся полного ответа сервера и переводим ответ в формат JSON 
      .then(json => {   // В случае успеха обрабатываем ответ
         let text = json.text || json[0];   // Получаем текст
         appendText(text); // Вставляем текст
      })
      .then(() => {
         hideModal(".modal_trainer-settings")  // Прячем модально окно
      })
      .then(() => {
         if (trainer.settings.needTips) addKeyHighlight(); // Если включены подсказки, то подсвечиваем первую клавишу на клавиатуре, которую необходимо нажать
         addKeydownListeners(); // Активируем события нажатия клавиш
      })
      .catch(error => alert(error)); // В случае ошибки – выводим её  
}

function appendText(text) {   // Вставка текста с HTML разметкой
   const specialSymbols = ["!", ".", ",", "-", ":", "?"];   // Список символов, которые пользователь не должен будет вводить при печати. Не выделяются в тексте.
   const textBody = document.querySelector(".trainerText__body");   // Находим элемент куда будем его вставлять

   text.split("").forEach((item, index) => { // Для каждого символа текста 
      if (specialSymbols.indexOf(item) === -1) {   // Если символ не относится к специальным
         let span = document.createElement("span");   // То создаем для него элемент
         span.classList.add("trainerText__item");  // Добавляем класс

         if (index === 0) span.classList.add("trainerText__item_current"); // Первый символ в тексте отмечаем как текущий

         if (item === "ё") span.textContent = "е"; // Вставляем содержимое в созданный элемент + дополнительная проверка на букву "ё"
         else span.textContent = item 

         textBody.append(span);  // Вставляем элемент на страницу 
      }
      else textBody.append(item);   // Если символ относиться к специальным, то просто вставляем его без элемента
   });
}

function addKeydownListeners() { // Добавляем обработчики событий для проверки вводимых символов, подсветки клавиш, активации таймера
   document.addEventListener("keydown", checkSymbol);
   document.addEventListener("keydown", addTempKeyHighlight);  
   if (trainer.settings.needTips) document.addEventListener("keydown", addKeyHighlight) // Если включены подсказки, то добавляем подсвтеку нужных клавиш
}

function showModal(modalElemClass) { // Функция показа модального окна
   document.querySelector(modalElemClass).classList.remove("hidden");   // Скрываем полностью модальное окно
   document.querySelector("body").classList.add("lock"); // Разблокируем скрол страницы
}

function hideModal(modalElemClass) {   // Функция скрытия модального окна
   document.querySelector(modalElemClass).classList.add("hidden");   // Скрываем полностью модальное окно
   document.querySelector("body").classList.remove("lock"); // Разблокируем скрол страницы
}

function checkSymbol(e) {  // Проверка нажатой клавиши
   const language = trainer.settings.language; // Выбранный язык текста

   if (Object.keys(keysValues[language]).indexOf(e.code) != -1) { // Проверяем что нажата проверяемая клавиша (буквенная или пробел)

      if (trainer.results.typedSymbols === 0) trainer.settings.timerObj = startTimer();   // Если напечатан первый символ, то запускаем таймер

      if (e.code === "Space") e.preventDefault();  // Если был нажат пробел, то отключаем стандартную прокрутку страницы при его нажатии

      let currentSymbol = document.querySelector(".trainerText__item_current");  // Текущий символ из текста, клавишу с которым следует нажать пользователю
      let nextSymbol = document.querySelector(".trainerText__item_current").nextElementSibling; // Следующай символ после текущего
   
      let pressedSymbol = keysValues[language][e.code];  // Символ, который соответствует нажатой пользователем клавиши

      if (currentSymbol.textContent === pressedSymbol || currentSymbol.textContent === pressedSymbol.toLowerCase()) {   // Если пользователь нажал правильную клавишу
         currentSymbol.classList.remove("trainerText__item_current");   // Убираем у текущего символа соответствующий класс
         currentSymbol.classList.add("trainerText__item_correct");   // И отмечаем его как верно нажатый
      }
      else {   // Если пользователь нажал неверную клавишу
         currentSymbol.classList.remove("trainerText__item_current");    // Убираем у текущего символа соответствующий класс
         currentSymbol.classList.add("trainerText__item_wrong");  /// И отмечаем его как неверно нажатый
         trainer.results.errors++;  // Считаем ошибки
      }

      if (trainer.settings.needTips) removeKeyHighlight();   // Если включены подсказки, то убираем текущую подсказку

      trainer.results.typedSymbols++;  // Считаем напечатанные символы

      if (nextSymbol != null) {  // Если это был не последний символ текста
         nextSymbol.classList.add("trainerText__item_current");   // То обозначаем следующий символ текста как текущий
      }
      else {   // Иначе
         stopTimer(trainer.settings.timerObj);  // Останавливаем таймер
         showStatistics(); // Показываем статистику
      } 
   }
}

function changeKeyboardLanguage(language) { // Изменение раскладки клавиатуры
   if (language === "Eng") {  // Переключение иконки выбранного языка
      document.querySelector(".trainer-lng_rus").classList.add("not-displayed");
      document.querySelector(".trainer-lng_eng").classList.remove("not-displayed");
   }
   else {
      document.querySelector(".trainer-lng_rus").classList.remove("not-displayed");
      document.querySelector(".trainer-lng_eng").classList.add("not-displayed");
   }

   let keys = document.querySelectorAll(".keyboard__item[data-key]");   // Получаем все объкты клавиш

   keys.forEach(item => {  // Для каждой клавиши
      let keyCode = item.dataset.key;  // Узнаем её ключ из data-атрибута 
      item.textContent = keysValues[language][keyCode]; // Вставляем в объект клавиши подходящую букву в соответствии с выбранным языком и ключом
   });
}

function addTempKeyHighlight(e) { // Временная подсветка нажатых клавиш
   const keyCode = e.code;   // Получаем ключ нажатой на клавиатуре клавиши
   const key = document.querySelector(`.keyboard__item[data-key="${keyCode}"]`);   // Находим соответствующий её объект

   if (key != null) {   // Если такой объект найден
      key.classList.add("keyTempHighlight");  // Подсвечиваем её на короткое время
      setTimeout((key) => {
         key.classList.remove("keyTempHighlight");
      }, 400, key);
   }
}

function addKeyHighlight() { // Постоянная (до нажатия) подсветка клавиш клавиатуры
   const currentSymbol = document.querySelector(".trainerText__item_current").textContent;  // Текущий символ из текста, клавишу с которым следует нажать пользователю
   const language = trainer.settings.language // Выбранный язык текста
   const objProp = Object.entries(keysValues[language]);   // Пары ключ-значение объекта выбранного языка
   const key = objProp.find(item => item[1] === currentSymbol.toUpperCase()) // Находим ключ по символу

   // Находим элемент клавиатуры соответствующий букве, которую необходимо ввести
   const keyboardBtn = document.querySelector(`.keyboard__item[data-key="${key[0]}"]`); 
   keyboardBtn.classList.add("keyConstantHighlight");
}

function removeKeyHighlight() {  // Выключение подсветки клавиши
   document.querySelector(".keyConstantHighlight").classList.remove("keyConstantHighlight");
}

class Timer {
   hours = 0;  // Часы, минуты, секунды
   mins = 0;
   secs = 0;
   stopTimer = false;   // Флаг дял контроля остановки таймера

   constructor(timerHTMLObject) {  
      this.timerHTMLObject = timerHTMLObject;   // HTML объект в который будет выводиться результат
   }

   start() {   // Запуск таймера
      let timer = setInterval(() => {
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
            // И вставляем в переданный элемент
            this.#update();
         } 
      }, 1000);
   }

   stop() { // Остановка таймера
      this.stopTimer = true;
   }

   #update() {
      this.timerHTMLObject.textContent = `${this.hours < 10 ? "0" + this.hours : this.hours}:${this.mins < 10 ? "0" + this.mins : this.mins}:${this.secs < 10 ? "0" + this.secs : this.secs}`;
   }
}

function startTimer() { // Запуск таймера   
   let timerHTMLElem = document.querySelector(".trainer-timer");  // HTML объект таймера

   document.querySelector(".info__message .text").classList.add("not-displayed");  // Подсказка о включении таймера при начале печати

   let timerObj = new Timer(timerHTMLElem);  // Новый объект таймера

   timerObj.start(); // Запуск таймера

   return timerObj;
}

function stopTimer(timerObj) {   // Остановка таймера
   timerObj.stop();
}

function tabs(e) {   // Переключение вкладок
   if (e.target.classList.contains("tabs__row-item")) {  // Проверяем был ли клик по вкладке
      const currentTab = document.querySelector(".tabs__row-item.active"); // Получаем текущую активную вкладку
      if (currentTab != e.target) { // Проверяем чтобы клик был не по ней же
         const currentContent = document.querySelector(".tabs__content-item.active");  // Получаем текущее содержимое вкладки
         const aimTab = e.target;   // Вкладка по которой было нажатие
         const aimContent = document.querySelector(`.tabs__content-item[data-tab='${aimTab.dataset.tab}']`);   // и её контент

         currentTab.classList.remove("active"); // Перключаем вкладки
         currentContent.classList.remove("active");
         currentContent.classList.add("not-displayed");

         aimTab.classList.add("active");
         aimContent.classList.remove("not-displayed");
         aimContent.classList.add("active");
      }
   }

}

function showStatistics() {   // Показ статистики
   const language = trainer.settings.language;  // Считываем конечные данные
   const textSize = trainer.settings.textSize;
   const symbolsCount = document.querySelectorAll(".trainerText__item").length;
   const erros = trainer.results.errors;
   const time = document.querySelector(".trainer-timer").textContent;
   const timeInSec = trainer.settings.timerObj.hours * 3600 + trainer.settings.timerObj.mins * 60 + trainer.settings.timerObj.secs;
   const accuracy = 100 - (erros / symbolsCount * 100);
   const typeSpeed = symbolsCount / timeInSec * 60;

   const languageCellTable = document.querySelector(".result-table__language");  // Находим куда будем их вставлять
   const textSizeCellTable = document.querySelector(".result-table__text-size");
   const symbolsCountCellTable = document.querySelector(".result-table__symbols-count");
   const errorsCellTable = document.querySelector(".result-table__errors");
   const accuracyCellTable = document.querySelector(".result-table__accuracy");
   const timeCellTable = document.querySelector(".result-table__time");
   const typeSpeedCellTable = document.querySelector(".result-table__type-speed");

   languageCellTable.textContent = language === "Rus" ? "Русский" : "Английский";   // И вставляем
   textSizeCellTable.textContent = textSize === "Small" ? "Маленький" : textSize === "Medium" ? "Средний" : "Большой";
   symbolsCountCellTable.textContent = symbolsCount;
   errorsCellTable.textContent = erros;
   accuracyCellTable.textContent = accuracy.toFixed(2) + " %";
   timeCellTable.textContent = time;
   typeSpeedCellTable.textContent = typeSpeed.toFixed(2) + " зн/мин.";

   showModal(".modal_result");   // Показываем модалку со статистикой
}

document.querySelector(".tabs").addEventListener("click", tabs)   // Переключение вкладок
document.querySelector(".tabs__form-btn").addEventListener("click", getFormData); // Считывание выбранных параметров тренажера

