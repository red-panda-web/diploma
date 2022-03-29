let keysValues = {   // Значения клавиш
   CapsIsActive: false, // Свойство для контроля нажатия CapsLock
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
      "CapsLock": "CapsLock"
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
      "CapsLock": "CapsLock"
   }
};

function showNextModal(e) {   // Показ следующего модального окна
   let target = e.target.closest(".modal__choose-btn").dataset.choose;   // Получаем значение data атрибута нажатой в модальном окне кнопки 
   if (target === "Gen") { // Если была нажата кнопка генерации текста
      document.querySelector(".modal__content[data-order='1']").classList.add("not-displayed");  // Скрываем текущее содержимое модального окна и показываем следующее
      document.querySelector(".modal__content[data-order='2']").classList.remove("not-displayed");
      document.querySelector(".modal__back-btn").classList.remove("hidden"); // Показываем кнопку возврата
   }
   if (target === "Rus" || target === "Eng") {  // Если была нажата кнопка выбора языка
      changeKeyboardLanguage(target);  // Меняем раскладку клавиатуры на соответствующий язык
      document.querySelector(".keyboard").dataset.language = target; // Запоминаем выбранный язык
      document.querySelector(".modal__content[data-order='2']").classList.add("not-displayed");  // Скрываем текущее содержимое модального окна и показываем следующее
      document.querySelector(".modal__content[data-order='3']").classList.remove("not-displayed");
   }
   if (target === "Small" || target === "Medium" || target === "Big") { // Если была нажата кнопка выбора размера текста
      let textLanguage = document.querySelector(".keyboard").dataset.language; // Узнаем выбранный язык
      document.querySelector(".modal__content[data-order='3']").classList.add("not-displayed"); // Скрываем текущее содержимое модального окна и показываем самое первое содержимое (на случай повторного вызова модального окна, чтобы выбор начинался с начала)
      document.querySelector(".modal__content[data-order='1']").classList.remove("not-displayed");
      document.querySelector(".modal").classList.add("hidden");   // Скрываем полностью модальное окно
      document.querySelector("body").classList.remove("lock"); // Разблокируем скрол страницы
      createText(textLanguage, target);   // Генерируем текст
   }
}

function showPreviousModal() {   // Показ предыдущего модального окна
   let activeModal = document.querySelector(".modal__content:not(.not-displayed)");  // Получаем текущее содержание
   let contentOrder = activeModal.dataset.order;   // Получаем его data атрибут, чтобы понять какой он по счету
   let previousModal = document.querySelector(`.modal__content[data-order='${contentOrder
      - 1}']`);   // Находим предыдущее содержимое
   activeModal.classList.add("not-displayed");   // Скрываем текущее содержимое
   previousModal.classList.remove("not-displayed"); //Показываем предыдущее
   if (contentOrder - 1 === 1) document.querySelector(".modal__back-btn").classList.add("hidden");  // Если предыдущее содержимое является самым первым, то скрываем кнопку возврата (возвращаться уже некуда)
}

function createText(language, size) {  // Генерация текста с HTML разметкой
   let url = ""; // URL адрес по которому будет направлен запрос 
   let sentenceCount;   // Количество предложений в генерируемом тексте
   
   switch (size) {   // В зависимости от выбранного размера текста устанавливаем количество предложений в итоговом тексте
      case "Small":
         sentenceCount = 3;
         break;
      case "Medium":
         sentenceCount = 5;
         break;
      case "Big":
         sentenceCount = 7;
         break;
   }
   // В зависимости от выбранного языка устанавливаем URL адрес на который будет отправлять запрос
   if (language === "Rus") url = `https://fish-text.ru/get?number=${sentenceCount}`;   
   else url = `http://asdfast.beobit.net/api/?length=${sentenceCount}`;
   
   fetch(url)  // Отправляем запрос
      .then(response => response.json())  // Дожидаемся полного ответа сервера и переводим ответ в формат JSON 
      .then(json => {   // В случае успеха обрабатываем ответ
         let text = json.text;   // Получаем текст
         let textBody = document.querySelector(".trainerText__body");   // Находим элемент куда будем его вставлять
         text.split("").forEach(item => { // Для каждого символа текста
            let span = document.createElement("span");   // Создаем элемент
            span.classList.add("trainerText__item");
            span.textContent = item;   // Вставляем содержимое
            textBody.append(span);  // Вставляем элемент на страницу
         });
      })
      .catch(error => alert(error)); // В случае ошибки – выводим её
}

function changeKeyboardLanguage(language) { // Изменение раскладки клавиатуры
   let keys = document.querySelectorAll(".keyboard__item[data-key]");   // Получаем все объкты клавиш
   keys.forEach(item => {  // Для каждой клавиши
      let keyCode = item.dataset.key;  // Узнаем её ключ из data-атрибута 
      item.textContent = keysValues[language][keyCode]; // Вставляем в объект клавиши подходящую букву в соответствии с выбранным языком и ключом
   });
}

function keyHighlight(e) { // Подсветка нажатых клавиш
   let keyCode = e.code;   // Получаем ключ нажатой на клавиатуре клавиши
   let key = document.querySelector(`.keyboard__item[data-key="${keyCode}"]`);   // Находим соответствующий её объект
   if (key != null) {   // Если такой объект найден
      if (keyCode === "CapsLock") { // Если был нажат CapsLock
         keysValues.CapsIsActive = !keysValues.CapsIsActive;   // Меняем свойство контроля нажатия CapsLock
         key.classList.toggle("keyHighlight")   // И подсвечиваем его
      }
      else {   // Если нажата другая клавиша
         key.classList.add("keyHighlight");  // Подсвечиваем её на короткое время
         setTimeout((key) => {
            key.classList.remove("keyHighlight");
         }, 400, key);
      }
   }
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
   let timerTip = document.querySelector(".info__message .text").classList.add("not-displayed");  // Подсказка о включении таймера при начале печати
   let timerObj = new Timer(timerHTMLElem);  // Новый объект таймера
   timerObj.start(); // Запуск таймера
   return timerObj;
}

function stopTimer(timerObj) {   // Остановка таймера
   timerObj.stop();
}

/*function writeText(e) {
   let keyCode = e.code;
   let selectedLanguage = document.querySelector(".keyboard").dataset.language;
   let symbol = keysValues[selectedLanguage][keyCode];
   let textArea = document.querySelector("#enteredText");

   if (symbol !== undefined) {
      if (keysValues.CapsIsActive) textArea.value += symbol;
      else textArea.value += symbol.toLowerCase();
   }
}*/

//let selectLanguageBtn = document.querySelector("#selectLanguageBtn");

//selectLanguageBtn.addEventListener("click", changeKeyboardLanguage);

document.addEventListener("keydown", keyHighlight);
document.addEventListener("keydown", startTimer, { once: true });

document.querySelector(".modal__body").addEventListener("click", showNextModal);
document.querySelector(".modal__back-btn").addEventListener("click", showPreviousModal);

