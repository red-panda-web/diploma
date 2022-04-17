import Timer from "./timer.js";
import keyboard from "./keyboard.js";
import { showModal, hideModal } from "./modal.js";
const trainer = {
    settings: {
        textSize: 2,
        textUnitType: "sentence",
        timerObj: undefined,
    },
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
        // Считываем все возможные варианты языка, подсказок, размер текста, вид получаемого текста (предложения или абзацы) 
        const languageRadio = Array.from(document.getElementsByName("text-language"));
        const textSize = document.querySelector("#text-size");
        const hintsRadio = Array.from(document.getElementsByName("text-hints"));
        // Получаем выбранные пользователем варианты и устанавливаем свойства в объект тренера и клавиатуры
        if (textSize != undefined && +textSize.value > 0 && +textSize.value <= 10)
            trainer.settings.textSize = +textSize.value;
        else
            throw new Error("Text size is undefined or incorrect");
        const language = (_a = languageRadio.find((item) => item.checked)) === null || _a === void 0 ? void 0 : _a.value;
        if (language != undefined) {
            keyboard.keyboardLanguage = language;
            keyboard.setLanguage(language);
        }
        else
            throw new Error("Language is undefined");
        const hints = (_b = hintsRadio.find((item) => item.checked)) === null || _b === void 0 ? void 0 : _b.value;
        if (hints != undefined) {
            if (hints === "With")
                keyboard.hints = true;
            else
                keyboard.hints = false;
        }
        else
            throw new Error("Hints is undefined");
        // Создаем текст
        createText(keyboard.keyboardLanguage, trainer.settings.textSize);
    }
    async function createText(language, textSize) {
        let url; // URL адрес по которому будет направлен запрос 
        // В зависимости от выбранного языка устанавливаем URL адрес на который будет отправлять запрос
        if (language === "Rus")
            url = `https://fish-text.ru/get?number=${textSize}`;
        else
            url = `https://baconipsum.com/api/?type=meat-and-filler&sentences=${textSize}`;
        const response = await fetch(url);
        if (response.status != 200)
            throw new Error("Fetch error");
        const fullResponse = await response.json();
        const text = fullResponse.text || fullResponse[0]; // Получаем текст
        appendText(text); // Вставляем текст
        hideModal(`.${trainer.classes.settingsModal}`); // Прячем модально окно
        if (keyboard.hints) {
            addHintHighlight(); // Если включены подсказки, то подсвечиваем первую клавишу на клавиатуре, которую необходимо нажать
        }
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
        const symbolsThatRequire = ["!", "?", ":"]; // Символы требующие нажатия двух клавишь в обоих языках
        const symbolsThatNotRequire = [" ", ",", ".", "-", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]; // Символы не требующие нажатия двух клавишь в обоих языках
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
            if (trainer.results.typedSymbols === 0) {
                trainer.settings.timerObj = startTimer(); // Если напечатан первый символ, то запускаем таймер
                updateTimer(trainer.settings.timerObj); // И включаем обновление таймера
                trainer.results.typedSymbols++; // Считаем напечатанные символы
            }
            else
                trainer.results.typedSymbols++;
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
                if (keyboard.hints) {
                    removeHintHighlight(); // Если включены подсказки, то убираем текущую подсказку
                    addHintHighlight(); // И подсвечиваем следующую букву
                }
            }
            else { // Иначе
                stopTimer(trainer.settings.timerObj); // Останавливаем таймер
                showStatistics(); // Показываем статистику
            }
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
        const timerObj = trainer.settings.timerObj;
        if (timerObj != undefined) {
            const language = keyboard.keyboardLanguage; // Считываем конечные данные
            const textSize = trainer.settings.textSize;
            const symbolsCount = document.querySelectorAll(`.${trainer.classes.originalTextField}`).length;
            const erros = trainer.results.errors;
            const time = document.querySelector(".trainer-timer");
            const accuracy = 100 - (erros / symbolsCount * 100);
            const timeInSec = timerObj.getHours() * 3600 + timerObj.getMins() * 60 + timerObj.getSecs();
            const typeSpeed = symbolsCount / timeInSec * 60;
            const languageCellTable = document.querySelector(".result-table__language"); // Находим куда будем их вставлять
            const textSizeCellTable = document.querySelector(".result-table__text-size");
            const symbolsCountCellTable = document.querySelector(".result-table__symbols-count");
            const errorsCellTable = document.querySelector(".result-table__errors");
            const accuracyCellTable = document.querySelector(".result-table__accuracy");
            const timeCellTable = document.querySelector(".result-table__time");
            const typeSpeedCellTable = document.querySelector(".result-table__type-speed");
            if (languageCellTable != null)
                languageCellTable.textContent = language === "Rus" ? "Русский" : "Английский"; // И вставляем проверяя ячейки на существование
            else
                throw new Error("languageCellTable is null");
            if (textSizeCellTable != null)
                textSizeCellTable.textContent = textSize + (trainer.settings.textUnitType === "sentence" ? " предл." : "абз.");
            else
                throw new Error("textSizeCellTable is null");
            if (symbolsCountCellTable != null)
                symbolsCountCellTable.textContent = String(symbolsCount);
            else
                throw new Error("symbolsCountCellTable is null");
            if (errorsCellTable != null)
                errorsCellTable.textContent = String(erros);
            else
                throw new Error("errorsCellTable is null");
            if (accuracyCellTable != null)
                accuracyCellTable.textContent = accuracy.toFixed(2) + " %";
            else
                throw new Error("accuracyCellTable is null");
            if (timeCellTable != null && time != null)
                timeCellTable.textContent = time.textContent;
            else
                throw new Error("timeCellTable or time is null");
            if (typeSpeedCellTable != null)
                typeSpeedCellTable.textContent = typeSpeed.toFixed(2) + " зн/мин.";
            else
                throw new Error("typeSpeedCellTable is null");
            showModal(`.${trainer.classes.resultModal}`); // Показываем модалку со статистикой
        }
        else
            throw new Error("timerObj is undefinded");
    }
    function tabs(e) {
        const aimTab = e.target; // Элемент по которому было нажатие
        if (aimTab != null && aimTab.classList.contains("tabs__row-item")) { // Проверяем что этот элемент является вкладкой и не равен null
            const currentTab = document.querySelector(".tabs__row-item.active"); // Получаем текущую активную вкладку
            if (currentTab != e.target && currentTab != null) { // Проверяем чтобы клик был не по ней же
                const currentContent = document.querySelector(".tabs__content-item.active"); // Получаем текущее содержимое вкладки
                const aimContent = document.querySelector(`.tabs__content-item[data-tab='${aimTab.dataset.tab}']`); // и её контент
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
    const submitBtn = document.querySelector(".tabs__form-btn"); // Кнопка подтверждения
    if (submitBtn != null)
        submitBtn.addEventListener("click", getFormData);
    else
        throw new Error("Submit button is null");
    const tabsElement = document.querySelector(".tabs"); // Переключение вкладок
    if (tabsElement != null)
        tabsElement.addEventListener("click", tabs);
    else
        throw new Error("tabsElement is null");
}
catch (error) {
    alert(error.message);
}
//# sourceMappingURL=scriptTrainer.js.map