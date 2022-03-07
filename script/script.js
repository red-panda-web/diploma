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
   let target = e.target.closest(".modal__chooseBtn").dataset.choose;   // Получаем значение data атрибута нажатой в модальном окне кнопки
   let textLanguage; // Переменная для хранения выбранного языка текста
   if (target === "Gen") { // Если была нажата кнопка генерации текста
      document.querySelector(".modal__content[data-order='1']").classList.add("notDisplayed");  // Скрываем текущее содержимое модального окна и показываем следующее
      document.querySelector(".modal__content[data-order='2']").classList.remove("notDisplayed");
      document.querySelector(".modal__backBtn").classList.remove("hidden"); // Показываем кнопку возврата
   }
   if (target === "Rus" || target === "Eng") {  // Если была нажата кнопка выбора языка
      changeKeyboardLanguage(target);  // Меняем раскладку клавиатуры на соответствующий язык
      document.querySelector(".modal__content[data-order='2']").classList.add("notDisplayed");  // Скрываем текущее содержимое модального окна и показываем следующее
      document.querySelector(".modal__content[data-order='3']").classList.remove("notDisplayed");
   }
   if (target === "Small" || target === "Medium" || target === "Big") { // Если была нажата кнопка выбора размера текста
      document.querySelector(".modal__content[data-order='3']").classList.add("notDisplayed"); // Скрываем текущее содержимое модального окна и показываем самое первое содержимое (на случай повторного вызова модального окна, чтобы выбор начинался с начала)
      document.querySelector(".modal__content[data-order='1']").classList.remove("notDisplayed");
      document.querySelector(".modal").classList.add("hidden");   // Скрываем полностью модальное окно
      document.querySelector("body").classList.remove("lock"); // Разблокируем скрол страницы
      createText(textLanguage, target);   // Генерируем текст
   }
}

function showPreviousModal() {   // Показ предыдущего модального окна
   let activeModal = document.querySelector(".modal__content:not(.notDisplayed)");  // Получаем текущее содержание
   let contentOrder = activeModal.dataset.order;   // Получаем его data атрибут, чтобы понять какой он по счету
   let previousModal = document.querySelector(`.modal__content[data-order='${contentOrder
      - 1}']`);   // Находим предыдущее содержимое
   activeModal.classList.add("notDisplayed");   // Скрываем текущее содержимое
   previousModal.classList.remove("notDisplayed"); //Показываем предыдущее
   if (contentOrder - 1 === 1) document.querySelector(".modal__backBtn").classList.add("hidden");  // Если предыдущее содержимое является самым первым, то скрываем кнопку возврата (возвращаться уже некуда)
}

function createText(language, size) {  // Генерация текста с HTML разметкой
   let sentenceCount;   // Количество предложений в генерируемом тексте зависит от выбранной величины текста
   if (size === "Small") sentenceCount = 5;
   else if (size === "Medium") sentenceCount = 10;
   else sentenceCount = 15;
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
      else {   // Если нажата друга клавиша
         key.classList.add("keyHighlight");  // Подсвечиваем её на короткое время
         setTimeout((key) => {
            key.classList.remove("keyHighlight");
         }, 400, key);
      }
   }
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

document.querySelector(".modal__body").addEventListener("click", showNextModal);
document.querySelector(".modal__backBtn").addEventListener("click", showPreviousModal);
//document.addEventListener("keydown", writeText);

