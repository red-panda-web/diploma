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

function showNextModal(e) {   // Показ следующего модального окна
   if (e.target.closest(".modal__choose-btn") != null) { // Проверяем, что нажатие произошло на кнопку выбора в модальном окне
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
   const specialSymbols = ["!", ".", ",", "-", ":", "?"];   // Список символов, которые пользователь не должен будет вводить при печати. Не выделяются в тексте.
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
   else url = `https://baconipsum.com/api/?type=meat-and-filler&sentences=${sentenceCount * 2}`;
   
   fetch(url)  // Отправляем запрос
      .then(response => response.json())  // Дожидаемся полного ответа сервера и переводим ответ в формат JSON 
      .then(json => {   // В случае успеха обрабатываем ответ
         let text = json.text || json[0];   // Получаем текст
         let textBody = document.querySelector(".trainerText__body");   // Находим элемент куда будем его вставлять
         text.split("").forEach((item, index) => { // Для каждого символа текста 
            if (specialSymbols.indexOf(item) === -1) {   // Если символ не относится к специальным
               let span = document.createElement("span");   // То создаем для него элемент
               span.classList.add("trainerText__item");  // Добавляем класс
               if (index === 0) span.classList.add("trainerText__item_current"); // Первый символ в тексте отмечаем как текущий
               span.textContent = item;   // Вставляем содержимое в созданный элемент
               textBody.append(span);  // Вставляем элемент на страницу
            }
            else textBody.append(item);   // Если символ относиться к специальным, то просто вставляем его без эдемента
         });
      })
      .catch(error => alert(error)); // В случае ошибки – выводим её
}

function checkSymbol(e) {  // Проверка нажатой клавиши
   let language = document.querySelector(".keyboard").dataset.language; // Выбранный язык текста
   if (Object.keys(keysValues[language]).indexOf(e.code) != -1) { // Проверяем что нажата проверяемая клавиша (буквенная или пробел)
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
      }

      if (nextSymbol != null) {  // Если это был не последний символ текста
         nextSymbol.classList.add("trainerText__item_current");   // То обозначаем следующий символ текста как текущий
      }
      else alert("Конец текста, вывод статистики");   // Иначе выводим статистику
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

function keyHighlight(e) { // Подсветка нажатых клавиш
   let keyCode = e.code;   // Получаем ключ нажатой на клавиатуре клавиши
   let key = document.querySelector(`.keyboard__item[data-key="${keyCode}"]`);   // Находим соответствующий её объект
   if (key != null) {   // Если такой объект найден
      key.classList.add("keyHighlight");  // Подсвечиваем её на короткое время
      setTimeout((key) => {
         key.classList.remove("keyHighlight");
      }, 400, key);
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
   document.querySelector(".info__message .text").classList.add("not-displayed");  // Подсказка о включении таймера при начале печати
   let timerObj = new Timer(timerHTMLElem);  // Новый объект таймера
   timerObj.start(); // Запуск таймера
   return timerObj;
}

function stopTimer(timerObj) {   // Остановка таймера
   timerObj.stop();
}

document.addEventListener("keydown", checkSymbol);
document.addEventListener("keydown", keyHighlight);
document.addEventListener("keydown", startTimer, { once: true });

document.querySelector(".modal__body").addEventListener("click", showNextModal);
document.querySelector(".modal__back-btn").addEventListener("click", showPreviousModal);

