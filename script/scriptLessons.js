import Timer from "./timer.js";
import keyboard from "./keyboard.js";
import { showModal, hideModal } from "./modal.js";
import words from "./lessonTexts.js";
const trainer = {
    settings: {
        timerObj: undefined
    },
    results: {
        errors: 0,
        typedSymbols: 0,
    }
};
try {
    // Получение и установка настроек тренажера
    function getFormData(e) {
        var _a, _b;
        e.preventDefault(); // Предотвращеаем стандартное поведение кнопки "Submit" 
        // Считываем все возможные варианты языка
        const languageRadio = Array.from(document.getElementsByName("text-language"));
        const lessonsRadio = Array.from(document.getElementsByName("lesson-number"));
        // Получаем выбранные пользователем варианты и устанавливаем свойства в объект тренера и клавиатуры
        const language = (_a = languageRadio.find((item) => item.checked)) === null || _a === void 0 ? void 0 : _a.value;
        if (language != undefined) {
            keyboard.keyboardLanguage = language;
            keyboard.setLanguage(language);
        }
        else
            throw new Error("Language is undefined");
        const lesson = (_b = lessonsRadio.find((item) => item.checked)) === null || _b === void 0 ? void 0 : _b.value;
        if (lesson === undefined)
            throw new Error("Lesson is undefined");
        // Создаем текст
        createText(keyboard.keyboardLanguage, lesson);
    }
    function createText(language, lessonName) {
        const text = words[lessonName][language]; // Текст в зависимости от выбранного урока и языка
        appendText(text); // Вставляем текст
        hideModal(".modal_trainer-settings"); // Прячем модально окно
        addHintHighlight(); // Подсвечиваем первую букву
        document.addEventListener("keydown", checkSymbol);
    }
    // Вставка текста с HTML разметкой
    function appendText(text) {
        const textBody = document.querySelector(".trainerText__body"); // Находим элемент куда будем его вставлять
        // Если элемент для вставки найден
        if (textBody != null) {
            // Список символов, которые пользователь не должен будет вводить при печати. Не выделяются в тексте.
            const specialSymbols = ["!", "-", ":", "?"];
            text.split("").forEach((item, index) => {
                if (specialSymbols.indexOf(item) === -1) { // Если символ не относится к специальным
                    const span = document.createElement("span"); // То создаем для него элемент
                    span.classList.add("trainerText__item"); // Добавляем класс
                    if (index === 0)
                        span.classList.add("trainerText__item_current"); // Первый символ в тексте отмечаем как текущий
                    if (item === "ё")
                        span.textContent = "е"; // Вставляем содержимое в созданный элемент + дополнительная проверка на букву "ё"
                    else
                        span.textContent = item;
                    textBody.append(span); // Вставляем элемент на страницу 
                }
                else
                    textBody.append(item); // Если символ относиться к специальным, то просто вставляем его без элемента
            });
        } // Если элемент для вставки не найден - выбрасываем ошибку
        else
            throw new Error("The text insertion location was not found");
    }
    // Подсветка-подсказка клавиши
    function addHintHighlight() {
        // Текущий символ из текста, клавишу с которым следует нажать пользователю
        const symbolElement = document.querySelector(".trainerText__item_current");
        if (symbolElement != null) { // Проверяем существование элемента и его контента 
            const symbolContent = symbolElement.textContent;
            if (symbolContent != null) {
                const currentSymbol = symbolContent; // Запоминаем символ
                const language = keyboard.keyboardLanguage; // Выбранный язык текста
                const objProp = Object.entries(keyboard.keysValues); // Массив пар ключ-значение [keyCode: string] : {Rus: string; Eng: string}
                objProp.find(item => {
                    if (item[1][language] === currentSymbol.toUpperCase()) { // Если нашли
                        const key = item[0]; // Запоминаем
                        const keyboardBtn = document.querySelector(`.keyboard__item[data-key="${key}"]`); // Ищем на виртуальной клавиатуре кнопку с таким кодом
                        if (keyboardBtn != null) {
                            keyboardBtn.classList.add("keyHintHighlight"); // Если нашли, то подсвечиваем
                            return true;
                        }
                        else
                            throw new Error("The key corresponding to the current character was not found"); // Иначе ошибка
                    }
                });
            }
        }
    }
    // Выключение подсветки клавиши
    function removeHintHighlight() {
        const element = document.querySelector(".keyHintHighlight");
        if (element != null && element.classList.contains("keyHintHighlight")) {
            element.classList.remove("keyHintHighlight");
        }
    }
    // Проверка нажатой клавиши
    function checkSymbol(e) {
        // Проверяем что нажата проверяемая клавиша (буквенная или пробел)
        if (Object.keys(keyboard.keysValues).indexOf(e.code) != -1) {
            if (trainer.results.typedSymbols === 0) {
                trainer.settings.timerObj = startTimer(); // Если напечатан первый символ, то запускаем таймер
                updateTimer(trainer.settings.timerObj); // И включаем обновление таймера
            }
            if (e.code === "Space")
                e.preventDefault(); // Если был нажат пробел, то отключаем стандартную прокрутку страницы при его нажатии
            const currentSymbol = document.querySelector(".trainerText__item_current"); // Текущий символ из текста, клавишу с которым следует нажать пользователю
            if (currentSymbol != null) {
                const language = keyboard.keyboardLanguage; // Выбранный язык текста
                const pressedSymbol = keyboard.keysValues[e.code][language]; // Символ, который соответствует нажатой пользователем клавиши
                if (currentSymbol.textContent === pressedSymbol || currentSymbol.textContent === pressedSymbol.toLowerCase()) { // Если пользователь нажал правильную клавишу
                    currentSymbol.classList.remove("trainerText__item_current"); // Убираем у текущего символа соответствующий класс
                    currentSymbol.classList.add("trainerText__item_correct"); // И отмечаем его как верно нажатый
                }
                else { // Если пользователь нажал неверную клавишу
                    currentSymbol.classList.remove("trainerText__item_current"); // Убираем у текущего символа соответствующий класс
                    currentSymbol.classList.add("trainerText__item_wrong"); /// И отмечаем его как неверно нажатый
                    trainer.results.errors++; // Считаем ошибки
                }
                if (keyboard.hints)
                    removeHintHighlight(); // Если включены подсказки, то убираем текущую подсказку
                trainer.results.typedSymbols++; // Считаем напечатанные символы
                const nextSymbol = currentSymbol.nextElementSibling; // Следующай символ после текущего
                if (nextSymbol != null) { // Если это был не последний символ текста
                    nextSymbol.classList.add("trainerText__item_current"); // То обозначаем следующий символ текста как текущий
                    addHintHighlight(); // И подсвечиваем его
                }
                else { // Иначе
                    stopTimer(trainer.settings.timerObj); // Останавливаем таймер
                    showStatistics(); // Показываем статистику
                }
            }
            else
                throw new Error("Current text symbol is null");
        }
    }
    // Запуск таймера 
    function startTimer() {
        var _a;
        let timerHTMLElem = document.querySelector(".trainer-timer"); // HTML объект таймера
        if (timerHTMLElem != null) {
            (_a = document.querySelector(".info__message .text")) === null || _a === void 0 ? void 0 : _a.classList.add("not-displayed"); // Подсказка о включении таймера при начале печати
            let timerObj = new Timer(); // Новый объект таймера
            timerObj.start(); // Запуск таймера
            return timerObj;
        }
        else
            throw new Error("Timer element is null");
    }
    // Ежесекундное обновление таймера в элементе
    function updateTimer(timerObj) {
        const timerElem = document.querySelector(".trainer-timer");
        if (timerElem != null) {
            setInterval(() => {
                timerElem.innerHTML = timerObj.getTime();
            }, 1000);
        }
        else
            throw new Error("Timer element is null");
    }
    // Остановка таймера
    function stopTimer(timerObj) {
        timerObj === null || timerObj === void 0 ? void 0 : timerObj.stop();
    }
    function showStatistics() {
        var _a, _b;
        const timerObj = trainer.settings.timerObj;
        if (timerObj != undefined) {
            const erros = trainer.results.errors;
            showModal(".modal_result"); // Показываем модалку со статистикой
            if (erros <= 5)
                (_a = document.querySelector(".modal_result .result_success")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
            else
                (_b = document.querySelector(".modal_result .result_fail")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
        }
        else
            throw new Error("timerObj is undefinded");
    }
    const submitBtn = document.querySelector(".tabs__form-btn");
    if (submitBtn != null)
        submitBtn.addEventListener("click", getFormData);
    else
        throw new Error("Submit button is null");
}
catch (error) {
    alert(error.message);
}
//# sourceMappingURL=scriptLessons.js.map