const keyboard = {
    keysValues: {
        "KeyA": {
            "Rus": ["Ф"],
            "Eng": ["A"],
        },
        "KeyB": {
            "Rus": ["И"],
            "Eng": ["B"],
        },
        "KeyC": {
            "Rus": ["С"],
            "Eng": ["C"],
        },
        "KeyD": {
            "Rus": ["В"],
            "Eng": ["D"],
        },
        "KeyE": {
            "Rus": ["У"],
            "Eng": ["E"],
        },
        "KeyF": {
            "Rus": ["А"],
            "Eng": ["F"],
        },
        "KeyG": {
            "Rus": ["П"],
            "Eng": ["G"],
        },
        "KeyH": {
            "Rus": ["Р"],
            "Eng": ["H"],
        },
        "KeyI": {
            "Rus": ["Ш"],
            "Eng": ["I"],
        },
        "KeyJ": {
            "Rus": ["О"],
            "Eng": ["J"],
        },
        "KeyK": {
            "Rus": ["Л"],
            "Eng": ["K"],
        },
        "KeyL": {
            "Rus": ["Д"],
            "Eng": ["L"],
        },
        "KeyM": {
            "Rus": ["Ь"],
            "Eng": ["M"],
        },
        "KeyN": {
            "Rus": ["Т"],
            "Eng": ["N"],
        },
        "KeyO": {
            "Rus": ["Щ"],
            "Eng": ["O"],
        },
        "KeyP": {
            "Rus": ["З"],
            "Eng": ["P"],
        },
        "KeyQ": {
            "Rus": ["Й"],
            "Eng": ["Q"],
        },
        "KeyR": {
            "Rus": ["К"],
            "Eng": ["R"],
        },
        "KeyS": {
            "Rus": ["Ы"],
            "Eng": ["S"],
        },
        "KeyT": {
            "Rus": ["Е"],
            "Eng": ["T"],
        },
        "KeyU": {
            "Rus": ["Г"],
            "Eng": ["U"],
        },
        "KeyV": {
            "Rus": ["М"],
            "Eng": ["V"],
        },
        "KeyW": {
            "Rus": ["Ц"],
            "Eng": ["W"],
        },
        "KeyX": {
            "Rus": ["Ч"],
            "Eng": ["X"],
        },
        "KeyY": {
            "Rus": ["Н"],
            "Eng": ["Y"],
        },
        "KeyZ": {
            "Rus": ["Я"],
            "Eng": ["Z"],
        },
        "BracketLeft": {
            "Rus": ["Х"],
            "Eng": ["[", "{"],
        },
        "BracketRight": {
            "Rus": ["Ъ"],
            "Eng": ["]", "}"],
        },
        "Semicolon": {
            "Rus": ["Ж"],
            "Eng": [";", ":"],
        },
        "Quote": {
            "Rus": ["Э"],
            "Eng": ["'", '"'],
        },
        "Comma": {
            "Rus": ["Б"],
            "Eng": [","],
        },
        "Period": {
            "Rus": ["Ю"],
            "Eng": ["."],
        },
        "Slash": {
            "Rus": [".", ","],
            "Eng": ["/", "?"],
        },
        "Space": {
            "Rus": [" "],
            "Eng": [" "],
        },
        "ShiftLeft": {
            "Rus": ["Shift"],
            "Eng": ["Shift"],
        },
        "ShiftRight": {
            "Rus": ["Shift"],
            "Eng": ["Shift"],
        },
        "Digit1": {
            "Rus": ["1", "!"],
            "Eng": ["1", "!"],
        },
        "Digit2": {
            "Rus": ["2", '"'],
            "Eng": ["2", "@"],
        },
        "Digit3": {
            "Rus": ["3", "№"],
            "Eng": ["3", "#"],
        },
        "Digit4": {
            "Rus": ["4", ";"],
            "Eng": ["4", "$"],
        },
        "Digit5": {
            "Rus": ["5", "%"],
            "Eng": ["5", "%"],
        },
        "Digit6": {
            "Rus": ["6", ":"],
            "Eng": ["6", "^"],
        },
        "Digit7": {
            "Rus": ["7", "?"],
            "Eng": ["7", "&"],
        },
        "Digit8": {
            "Rus": ["8", "*"],
            "Eng": ["8", "*"],
        },
        "Digit9": {
            "Rus": ["9", "("],
            "Eng": ["9", "("],
        },
        "Digit0": {
            "Rus": ["0", ")"],
            "Eng": ["0", ")"],
        },
        "Minus": {
            "Rus": ["-", "_"],
            "Eng": ["-", "_"],
        },
        "Equal": {
            "Rus": ["=", "+"],
            "Eng": ["=", "+"],
        },
    },
    keyboardLanguage: "Rus",
    hints: false,
    setLanguage(language) {
        const keys = document.querySelectorAll(".keyboard__item[data-key]"); // Получаем все объкты клавиш
        keys.forEach(key => {
            const keyCode = key.getAttribute("data-key"); // Узнаем её ключ из data-атрибута 
            if (keyCode != null) {
                this.keysValues[keyCode][language].forEach((item) => {
                    const span = document.createElement("span");
                    span.textContent = item;
                    key.append(span);
                }); // Вставляем в объект клавиши подходящие символы в соответствии с выбранным языком и ключом, предварительно обернув их в span
            }
        });
    }
};
export default keyboard;
//# sourceMappingURL=keyboard.js.map