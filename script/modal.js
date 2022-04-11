// Функция показа модального окна
export function showModal(modalElemClass) {
    // Находим элемент с переданным классом
    const elem = document.querySelector(modalElemClass);
    if (elem != null) { // Если он существует
        elem.classList.remove("hidden"); // Показываем модальное окно
    }
    else
        throw new Error("Element with transmotted class is null");
    document.body.classList.add("lock"); // Блокируем скролл страницы
}
// Функция скрытия модального окна
export function hideModal(modalElemClass) {
    // Находим элемент с переданным классом
    const elem = document.querySelector(modalElemClass);
    if (elem != null) { // Если он существует
        elem.classList.add("hidden"); // Скрываем полностью модальное окно
    }
    else
        throw new Error("Element with transmotted class is null");
    document.body.classList.remove("lock"); // Разблокируем скролл страницыы
}
//# sourceMappingURL=modal.js.map