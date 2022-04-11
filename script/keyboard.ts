const keyboard: IKeyboard = {
   keysValues: {
      "KeyA": {
         "Rus": "Ф",
         "Eng": "A",
      },
      "KeyB": {
         "Rus": "И",
         "Eng": "B",
      },
      "KeyC": {
         "Rus": "С",
         "Eng": "C",
      },
      "KeyD": {
         "Rus": "В",
         "Eng": "D",
      },
      "KeyE": {
         "Rus": "У",
         "Eng": "E",
      },
      "KeyF": {
         "Rus": "А",
         "Eng": "F",
      },
      "KeyG":{
         "Rus": "П",
         "Eng": "G",
      },
      "KeyH": {
         "Rus": "Р",
         "Eng": "H",
      },
      "KeyI": {
         "Rus": "Ш",
         "Eng": "I",
      },
      "KeyJ": {
         "Rus": "О",
         "Eng": "J",
      },
      "KeyK": {
         "Rus": "Л",
         "Eng": "K",
      },
      "KeyL": {
         "Rus": "Д",
         "Eng": "L",
      },
      "KeyM": {
         "Rus": "Ь",
         "Eng": "M",
      },
      "KeyN": {
         "Rus": "Т",
         "Eng": "N",
      },
      "KeyO": {
         "Rus": "Щ",
         "Eng": "O",
      },
      "KeyP": {
         "Rus": "З",
         "Eng": "P",
      },
      "KeyQ": {
         "Rus": "Й",
         "Eng": "Q",
      },
      "KeyR": {
         "Rus": "К",
         "Eng": "R",
      },
      "KeyS": {
         "Rus": "Ы",
         "Eng": "S",
      },
      "KeyT": {
         "Rus": "Е",
         "Eng": "T",
      },
      "KeyU": {
         "Rus": "Г",
         "Eng": "U",
      },
      "KeyV": {
         "Rus": "М",
         "Eng": "V",
      },
      "KeyW": {
         "Rus": "Ц",
         "Eng": "W",
      },
      "KeyX": {
         "Rus": "Ч",
         "Eng": "X",
      },
      "KeyY": {
         "Rus": "Н",
         "Eng": "Y",
      },
      "KeyZ": {
         "Rus": "Я",
         "Eng": "Z",
      },
      "BracketLeft": {
         "Rus": "Х",
         "Eng": "[",
      },
      "BracketRight": {
         "Rus": "Ъ",
         "Eng": "]",
      },
      "Semicolon": {
         "Rus": "Ж",
         "Eng": ";",
      },
      "Quote": {
         "Rus": "Э",
         "Eng": "'",
      },
      "Comma": {
         "Rus": "Б",
         "Eng": ",",
      },
      "Period": {
         "Rus": "Ю",
         "Eng": ".",
      },
      "Slash": {
         "Rus": ".",
         "Eng": "/",
      },
      "Space": {
         "Rus": " ",
         "Eng": " ",
      }
   },
   keyboardLanguage: "Rus",
   hints: false,
   setLanguage(language: string): void {
      const keys: NodeListOf<Element> = document.querySelectorAll(".keyboard__item[data-key]");   // Получаем все объкты клавиш

      keys.forEach(item => {  // Для каждой клавиши
         const keyCode: string | null = item.getAttribute("data-key");  // Узнаем её ключ из data-атрибута 
         if (keyCode != null) {
            item.textContent = this.keysValues[keyCode][language]; // Вставляем в объект клавиши подходящую букву в соответствии с выбранным языком и ключом
         }
      });
   }
}

interface IKeyboard{
   keysValues: IKeys;
   keyboardLanguage: string;
   hints: boolean;
   setLanguage(language: string): void;
}

interface IKeys {
   [keyCode: string]: {
      [language: string]: string;
   }
}

export default keyboard;