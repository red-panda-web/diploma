import Timer from "./timer.js";
import keyboard from "./keyboard.js";
import { showModal, hideModal } from "./modal.js";
import words from "./lessonTexts.js";
const trainer = {
    timerObj: new Timer(),
    results: {
        errors: 0,
        typedSymbols: 0,
    },
    classes: {
        settingsModal: "modal_trainer-settings",
        resultModal: "modal_result",
        inputTextField: "trainerText__entered-area",
        originalTextField: "trainerText__original",
        originalTextSymbol: "trainerText__item",
        currentOriginalTextSymbol: "trainerText__item_current",
        correctlyEnteredSymbol: "trainerText__item_correct",
        wrongEnteredSymbol: "trainerText__item_wrong",
        hintHighlight: "keyHintHighlight" // Класс для подсветки-подсказки
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
        keyboard.hints = true;
        // Создаем текст
        createText(keyboard.keyboardLanguage, lesson);
    }
    function createText(language, lessonName) {
        const text = words[lessonName][language]; // Текст в зависимости от выбранного урока и языка
        appendText(text); // Вставляем текст
        hideModal(`.${trainer.classes.settingsModal}`); // Прячем модально окно
        addHintHighlight(); // Подсвечиваем первую букву
        const textArea = document.querySelector(`.${trainer.classes.inputTextField}`); // TextArea для ввода текста пользователя
        if (textArea != null) { // Если такая существует
            textArea.oninput = checkSymbol; // Активируем событие проверки каждого введенного сивола
            textArea.onpaste = () => false; // Отключаем возможность вставки текста
            textArea.focus(); // Ставим на фокус на форму
        }
        else
            throw new Error("Text area for entered text is null"); // Если такая форма не существует – кидаем ошибку
    }
    // Вставка текста с HTML разметкой
    function appendText(text) {
        const textBody = document.querySelector(`.${trainer.classes.originalTextField}`); // Находим элемент куда будем его вставлять
        // Если элемент для вставки найден
        if (textBody != null) {
            text.split("").forEach((item, index) => {
                const span = document.createElement("span"); // То создаем для него элемент
                span.classList.add(trainer.classes.originalTextSymbol); // Добавляем класс
                if (index === 0)
                    span.classList.add(trainer.classes.currentOriginalTextSymbol); // Самый первый символ в тексте отмечаем как текущий
                if (item === "ё")
                    span.textContent = "е"; // Вставляем содержимое в созданный элемент + дополнительная проверка на букву "ё"
                else
                    span.textContent = item;
                textBody.append(span); // Вставляем элемент на страницу 
            });
        } // Если элемент для вставки не найден - выбрасываем ошибку
        else
            throw new Error("The text insertion location was not found");
    }
    // Подсветка-подсказка клавиши
    function addHintHighlight() {
        var _a;
        // Текущий символ из текста, клавишу с которым следует нажать пользователю
        const symbolContent = (_a = document.querySelector(`.${trainer.classes.currentOriginalTextSymbol}`)) === null || _a === void 0 ? void 0 : _a.textContent;
        if (symbolContent) { // Проверяем существование элемента и его контента 
            if (symbolRequiresPressingTwoKeys(symbolContent)) { // Если символ это клавиша для ввода которой необходимо нажать 2 клавиши
                const rightShift = document.querySelector(`.keyboard__item[data-key="ShiftRight"]`); // То дополнительно подсвечиваем shift
                if (rightShift)
                    rightShift.classList.add(trainer.classes.hintHighlight);
            }
            const objProp = Object.entries(keyboard.keysValues); // Массив пар ключ-значение [keyCode: string] : {Rus: string; Eng: string}
            objProp.find(item => {
                if (item[1][keyboard.keyboardLanguage].includes(symbolContent.toUpperCase())) { // Если нашли
                    const keyboardBtn = document.querySelector(`.keyboard__item[data-key="${item[0]}"]`); // Ищем на виртуальной клавиатуре кнопку с таким кодом
                    if (keyboardBtn != null) {
                        keyboardBtn.classList.add(trainer.classes.hintHighlight); // Если нашли, то подсвечиваем
                        return true;
                    }
                    else
                        throw new Error("The key corresponding to the current character was not found"); // Иначе ошибка
                }
            });
        }
    }
    function symbolRequiresPressingTwoKeys(symbol) {
        const symbolsThatRequire = ["!", "?", ":"]; // Символы требующие нажатия двух клавиш в обоих языках
        const symbolsThatNotRequire = [" ", ",", ".", "-", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]; // Символы не требующие нажатия двух клавиш
        // Если символ в верхнем регистре и не относится к символам не требующим нажатмя двух клавиш
        return symbol === symbol.toUpperCase() && !symbolsThatNotRequire.includes(symbol)
            || symbolsThatRequire.includes(symbol) // Или является специальным символом
            || keyboard.keyboardLanguage === "Rus" && symbol === "," ? true : false; // Или является запятой при наборе русского текста
    }
    // Выключение подсветки клавиши
    function removeHintHighlight() {
        const elements = document.querySelectorAll(`.${trainer.classes.hintHighlight}`);
        elements.forEach((item) => {
            item.classList.remove(trainer.classes.hintHighlight);
        });
    }
    // Проверка нажатой клавиши
    function checkSymbol() {
        const textArea = document.querySelector(`.${trainer.classes.inputTextField}`); // Поле ввода текста
        const currentSymbolElement = document.querySelector(`.${trainer.classes.currentOriginalTextSymbol}`); // Элемент с текущим символом, который необходимо ввести
        if (textArea != null && currentSymbolElement != null) { // Если они существуют
            trainer.results.typedSymbols++; // Считаем напечатанные символы
            const textAreaLastSymbol = textArea.value[textArea.value.length - 1]; // Последний символ из поля ввода
            const currentSymbol = currentSymbolElement.textContent; // Символ, который необходимо ввести
            if (textAreaLastSymbol === currentSymbol) { // Если пользователь ввел правильный символ
                currentSymbolElement.classList.remove(trainer.classes.currentOriginalTextSymbol); // Убираем у текущего символа из оригинального текста соответствующий класс
                currentSymbolElement.classList.add(trainer.classes.correctlyEnteredSymbol); // И отмечаем его как верно введеный
            }
            else { // Если пользователь ввел неверный символ
                currentSymbolElement.classList.remove(trainer.classes.currentOriginalTextSymbol); // Убираем у текущего символа из оригинального текста соответствующий класс
                currentSymbolElement.classList.add(trainer.classes.wrongEnteredSymbol); /// И отмечаем его как неверно введеный
                trainer.results.errors++; // Считаем ошибки
            }
            const nextSymbol = currentSymbolElement.nextElementSibling; // Следующай символ в оригинальном тексте после текущего
            if (nextSymbol != null) { // Если это был не последний символ текста
                nextSymbol.classList.add(trainer.classes.currentOriginalTextSymbol); // То обозначаем следующий символ текста как текущий
                removeHintHighlight(); // Если включены подсказки, то убираем текущую подсказку
                addHintHighlight(); // И подсвечиваем следующую букву
            }
            else { // Иначе
                textArea.blur(); // Снимаем фокус с поля ввода текста
                showStatistics(); // Показываем статистику
            }
        }
    }
    function showStatistics() {
        var _a, _b;
        const erros = trainer.results.errors;
        showModal(`.${trainer.classes.resultModal}`); // Показываем модалку со статистикой
        if (erros <= 5)
            (_a = document.querySelector(`.${trainer.classes.resultModal} .result_success`)) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
        else
            (_b = document.querySelector(`.${trainer.classes.resultModal} .result_fail`)) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
    }
    function horizontalTextAlignment() {
        const horizontalBtn = document.querySelector("#horizontal");
        const verticalBtn = document.querySelector("#vertical");
        const textBody = document.querySelector(".trainerText__body");
        if (horizontalBtn != null && verticalBtn != null && textBody != null) {
            horizontalBtn.classList.add("selected");
            verticalBtn.classList.remove("selected");
            textBody.classList.remove("trainerText__body_vertical");
            textBody.classList.add("trainerText__body_horizontal");
        }
    }
    function verticalTextAlignment() {
        const horizontalBtn = document.querySelector("#horizontal");
        const verticalBtn = document.querySelector("#vertical");
        const textBody = document.querySelector(".trainerText__body");
        if (horizontalBtn != null && verticalBtn != null && textBody != null) {
            horizontalBtn.classList.remove("selected");
            verticalBtn.classList.add("selected");
            textBody.classList.remove("trainerText__body_horizontal");
            textBody.classList.add("trainerText__body_vertical");
        }
    }
    const submitBtn = document.querySelector(".tabs__form-btn");
    if (submitBtn != null)
        submitBtn.addEventListener("click", getFormData);
    else
        throw new Error("Submit button is null");
    const horizontalBtn = document.querySelector("#horizontal"); // Горизонтальное расположение блоков текста
    if (horizontalBtn != null)
        horizontalBtn.addEventListener("click", horizontalTextAlignment);
    else
        throw new Error("Horizontal button is null");
    const verticalBtn = document.querySelector("#vertical"); // Вертикальное расположение блоков текста
    if (verticalBtn != null)
        verticalBtn.addEventListener("click", verticalTextAlignment);
    else
        throw new Error("Vertical button is null");
}
catch (error) {
    alert(error.message);
}
//# sourceMappingURL=scriptLessons.js.map