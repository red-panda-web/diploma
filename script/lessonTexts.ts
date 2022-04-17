const words: IWords = {
   lesson1: {  // Область левого мизинца
      Rus: "Яй фя яйф ффяй ййяяффй яфйфяффйя",
      Eng: "Za qa zq azq qza zzaq aqzq aazzqqa"
   },
   lesson2: {  // Область левого безымянного пальца
      Rus: "Цы чы цч ыцччц чыц цццччы ыччыыцыцыч",
      Eng: "Sx wx ws xsw sxww ssswxswx sxwwswxxwxwxs"
   },
   lesson3: {  // Область левого среднего пальца
      Rus: "Вс увв сув вус вусс ссввуу уууууусв",
      Eng: "Cd edc dded cdec deccced dcececdecd"
   },
   lesson4: {  // Область левого указательного пальца
      Rus: "Ик пак мим мама папа пикап пеппа мимика",
      Eng: "Rv tg bgt frb vfgt rfbvfg rggfvb tgggbrfgtv"
   },
   lesson5: {  // Область правого указательного пальца
      Rus: "От тон гон трон торг тронь огонь",
      Eng: "Um hm yuh jhnm uyjhj nmjhyu hjhunymhj"
   },
   lesson6: {  // Область правого среднего пальца
      Rus: "Бл шл блш шлб лшбб лшблшб ллшблш бббшшшлбшлб",
      Eng: "Ik k,ik kikk,,ik kiikk iik,ikk kik,ikiki,kiikk,iki"
   },
   lesson7: {  // Область парвого безымянного пальца
      Rus: "Юд щд дющ юдюдщ щюдд дюдщюд юдщщщдюддщюд",
      Eng: "ol lol o.lo lolol oo.l.ool llol.olol.llol"
   },
   lesson8: {  // Область правого мизинца
      Rus: "Хэ хэхъ хзэжж жзхъэ ъъэжзхэ эжзъхэжзэз",
      Eng: "P/ ][' ;p/p/ '][/ ppp;'/][;'p"
   },
   lesson9: {  // Центральная линия
      Rus: "Пыл жар дар опал лапа двор вывод вдова",
      Eng: "As sad lad ask gas half jags flash ;'"
   },
   lesson10: {  // Верхняя линия
      Rus: "Ух ген цех ценз шейх кузнец шенген",
      Eng: "Ru ip yep two port quot equip poetry ]["
   },
   lesson11: {  // Нижняя линия
      Rus: "Ям имя мчс бис сить чибис миссия чиститься",
      Eng: "Mc zb xv zn cmv nbc cmb , ../, ..."
   },
}

interface IWords {
   [lessonName: string]: {
      [lessonText: string]: string;
   }
}

export default words;