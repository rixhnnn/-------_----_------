// === МУЗЫКАЛЬНАЯ КНОПКА ===
const musicBtn = document.getElementById("music-btn");
const audio = document.getElementById("bg-music");
let isPlaying = false;

musicBtn.addEventListener("click", () => {
  if (isPlaying) {
    audio.pause();
    musicBtn.textContent = "🔇";
    musicBtn.classList.remove("music-anim");
  } else {
    audio.play().catch((e) => console.log("Автоплей блокирован браузером"));
    musicBtn.textContent = "🎵";
    musicBtn.classList.add("music-anim");
  }
  isPlaying = !isPlaying;
});

// === ТАЙМЕР ОБРАТНОГО ОТСЧЕТА ===
const weddingDate = new Date("January 24, 2026 15:00:00").getTime();
const countdownEl = document.getElementById("countdown");

const timer = setInterval(() => {
  const now = new Date().getTime();
  const distance = weddingDate - now;

  if (distance < 0) {
    clearInterval(timer);
    countdownEl.innerHTML =
      "<h3 style='width:100%; color: var(--red-accent);'>День свадьбы настал!</h3>";
    return;
  }

  document.getElementById("days").innerText = Math.floor(
    distance / (1000 * 60 * 60 * 24)
  );
  document.getElementById("hours").innerText = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  document.getElementById("minutes").innerText = Math.floor(
    (distance % (1000 * 60 * 60)) / (1000 * 60)
  );
  document.getElementById("seconds").innerText = Math.floor(
    (distance % (1000 * 60)) / 1000
  );
}, 1000);

// === ЛОГИКА ПОКАЗА/СКРЫТИЯ ПОЛЕЙ ФОРМЫ ===
const rsvpForm = document.querySelector('.rsvp-section form');
const attendingSelect = rsvpForm ? rsvpForm.querySelector('select') : null;

if (attendingSelect) {
  // Найти все поля, которые нужно скрывать
  const formGroups = rsvpForm.querySelectorAll('.form-group');
  const guestsGroup = formGroups[3]; // "Гостей с вами"
  const alcoholGroup = formGroups[4]; // "Предпочтения в алкоголе"
  
  attendingSelect.addEventListener('change', function() {
    if (this.value === 'К сожалению, нет') {
      // Скрыть поля с плавной анимацией
      guestsGroup.style.transition = 'opacity 0.3s, max-height 0.3s';
      alcoholGroup.style.transition = 'opacity 0.3s, max-height 0.3s';
      guestsGroup.style.opacity = '0';
      alcoholGroup.style.opacity = '0';
      guestsGroup.style.maxHeight = '0';
      alcoholGroup.style.maxHeight = '0';
      guestsGroup.style.overflow = 'hidden';
      alcoholGroup.style.overflow = 'hidden';
      
      setTimeout(() => {
        guestsGroup.style.display = 'none';
        alcoholGroup.style.display = 'none';
      }, 300);
      
      // Сбросить значения
      rsvpForm.querySelectorAll('select')[1].selectedIndex = 0;
      document.querySelectorAll('input[name="alcho"]:checked').forEach(checkbox => {
        checkbox.checked = false;
      });
    } else {
      // Показать поля с плавной анимацией
      guestsGroup.style.display = 'block';
      alcoholGroup.style.display = 'block';
      
      setTimeout(() => {
        guestsGroup.style.opacity = '1';
        alcoholGroup.style.opacity = '1';
        guestsGroup.style.maxHeight = '1000px';
        alcoholGroup.style.maxHeight = '1000px';
      }, 10);
    }
  });
  
  // Проверить при загрузке страницы
  if (attendingSelect.value === 'К сожалению, нет') {
    guestsGroup.style.display = 'none';
    alcoholGroup.style.display = 'none';
  }
}

// === ОТПРАВКА ФОРМЫ В GOOGLE SHEETS ===

// !!! ЗАМЕНИ ЭТОТ URL НА СВОЙ ИЗ GOOGLE APPS SCRIPT !!!
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyJJO4Rjoff_eVAH8xFNu0N5f6kmLA5h0mIDSn75AlqVFMICtzaNkzyamQSHbOYARBhog/exec';

if (rsvpForm) {
  rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Создаем div для сообщений если его еще нет
    let messageDiv = rsvpForm.querySelector('.form-message');
    if (!messageDiv) {  
      messageDiv = document.createElement('div');
      messageDiv.className = 'form-message';
      messageDiv.style.cssText = 'margin-top: 20px; text-align: center; padding: 15px; border-radius: 10px; transition: all 0.3s;';
      rsvpForm.querySelector('.submit-btn').insertAdjacentElement('afterend', messageDiv);
    }
    
    // Показать загрузку
    messageDiv.style.background = 'rgba(200, 200, 200, 0.2)';
    messageDiv.innerHTML = '<p style="color: #666; font-size: 1.1rem; margin: 0;">⏳ Отправка...</p>';
    
    // Собрать данные
    const name = document.getElementById('name').value;
    const phone = document.getElementById('tel').value;
    const attending = rsvpForm.querySelector('select').value;
    
    // Если не придёт - пропускаем остальные поля
    let guests = 'Не применимо';
    let alcohol = 'Не применимо';
    
    if (attending !== 'К сожалению, нет') {
      guests = rsvpForm.querySelectorAll('select')[1].value;
      
      // Собрать выбранные checkbox'ы алкоголя
      const alcoholChoices = [];
      document.querySelectorAll('input[name="alcho"]:checked').forEach(checkbox => {
        const span = checkbox.parentElement.querySelector('span');
        if (span) {
          alcoholChoices.push(span.textContent.trim());
        }
      });
      alcohol = alcoholChoices.length > 0 ? alcoholChoices.join(', ') : 'Не выбрано';
    }
    
    // Подготовить данные для отправки
    const data = {
      type: 'rsvp',
      name: name,
      phone: phone,
      attending: attending,
      guests: guests,
      alcohol: alcohol
    };
    
    try {
      // Отправка в Google Sheets
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // С этим режимом мы не можем проверить ответ
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      // С mode: 'no-cors' fetch ВСЕГДА успешен, поэтому считаем что данные отправлены
      // Показать успешное сообщение
      messageDiv.style.background = 'rgba(46, 125, 50, 0.1)';
      messageDiv.innerHTML = `
        <p style="color: var(--red-accent); font-weight: bold; font-size: 1.2rem; margin: 0;">
          ✓ Спасибо! Ваш ответ получен.
        </p>
      `;
      
      // Очистить форму
      document.getElementById('name').value = '';
      document.getElementById('tel').value = '';
      rsvpForm.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
      
      // Убрать активные сердечки
      document.querySelectorAll('.like:checked').forEach(checkbox => {
        checkbox.checked = false;
      });
      
      // Показать все поля обратно
      const formGroups = rsvpForm.querySelectorAll('.form-group');
      formGroups[3].style.display = 'block';
      formGroups[4].style.display = 'block';
      formGroups[3].style.opacity = '1';
      formGroups[4].style.opacity = '1';
      formGroups[3].style.maxHeight = '1000px';
      formGroups[4].style.maxHeight = '1000px';
      
      // Скрыть сообщение через 5 секунд
      setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
          messageDiv.innerHTML = '';
          messageDiv.style.background = 'transparent';
          messageDiv.style.opacity = '1';
        }, 300);
      }, 5000);
      
    } catch (error) {
      // Этот блок НЕ ДОЛЖЕН выполняться с mode: 'no-cors'
      // Но на всякий случай оставим
      console.error('Ошибка отправки:', error);
      messageDiv.style.background = 'rgba(211, 47, 47, 0.1)';
      messageDiv.innerHTML = `
        <p style="color: red; font-weight: bold; margin: 0;">
          ✗ Ошибка отправки. Попробуйте позже.
        </p>
      `;
    }
  });
}

// === ОТПРАВКА ПОЖЕЛАНИЙ В GOOGLE SHEETS ===
const wishesForm = document.querySelector('.wishes-section form');

if (wishesForm) {
  wishesForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Создаем div для сообщений если его еще нет
    let messageDiv = wishesForm.querySelector('.form-message');
    if (!messageDiv) {  
      messageDiv = document.createElement('div');
      messageDiv.className = 'form-message';
      messageDiv.style.cssText = 'margin-top: 20px; text-align: center; padding: 15px; border-radius: 10px; transition: all 0.3s;';
      wishesForm.querySelector('.wishes-btn').insertAdjacentElement('afterend', messageDiv);
    }
    
    // Показать загрузку
    messageDiv.style.background = 'rgba(200, 200, 200, 0.2)';
    messageDiv.innerHTML = '<p style="color: #666; font-size: 1.1rem; margin: 0;">⏳ Отправка...</p>';
    
    // Собрать данные
    const wishes = document.getElementById('wishes').value;
    
    // Проверка на пустое поле
    if (!wishes.trim()) {
      messageDiv.style.background = 'rgba(255, 152, 0, 0.1)';
      messageDiv.innerHTML = `
        <p style="color: #ff9800; font-weight: bold; margin: 0;">
          ⚠ Напишите пожелание
        </p>
      `;
      
      setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
          messageDiv.innerHTML = '';
          messageDiv.style.background = 'transparent';
          messageDiv.style.opacity = '1';
        }, 300);
      }, 3000);
      
      return;
    }
    
    // Подготовить данные для отправки
    const data = {
      type: 'wishes',
      wishes: wishes,
      timestamp: new Date().toLocaleString('ru-RU')
    };
    
    try {
      // Отправка в Google Sheets (используем тот же URL)
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      // Показать успешное сообщение
      messageDiv.style.background = 'rgba(46, 125, 50, 0.1)';
      messageDiv.innerHTML = `
        <p style="color: var(--red-accent); font-weight: bold; font-size: 1.2rem; margin: 0;">
          ✓ Спасибо за пожелания!
        </p>
      `;
      
      // Очистить поле
      document.getElementById('wishes').value = '';
      
      // Скрыть сообщение через 5 секунд
      setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
          messageDiv.innerHTML = '';
          messageDiv.style.background = 'transparent';
          messageDiv.style.opacity = '1';
        }, 300);
      }, 5000);
      
    } catch (error) {
      console.error('Ошибка отправки:', error);
      messageDiv.style.background = 'rgba(211, 47, 47, 0.1)';
      messageDiv.innerHTML = `
        <p style="color: red; font-weight: bold; margin: 0;">
          ✗ Ошибка отправки. Попробуйте позже.
        </p>
      `;
    }
  });
}

// === ПРИНУДИТЕЛЬНЫЙ ЗАПУСК ВИДЕО-ФОНА ДЛЯ SAFARI ===
document.addEventListener('DOMContentLoaded', function() {
  const video = document.getElementById('hero-video');
  
  if (video) {
    // Установить базовые параметры
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    
    // Загрузить видео
    video.load();
    
    // Попытка запустить
    setTimeout(() => {
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('✓ Видео-фон запущен');
          })
          .catch(error => {
            console.log('Autoplay blocked, waiting for interaction');
            
            // Запуск при любом взаимодействии
            const startVideo = () => {
              video.play();
              document.removeEventListener('click', startVideo);
              document.removeEventListener('touchstart', startVideo);
              document.removeEventListener('scroll', startVideo);
            };
            
            document.addEventListener('click', startVideo, { once: true });
            document.addEventListener('touchstart', startVideo, { once: true });
            document.addEventListener('scroll', startVideo, { once: true });
          });
      }
    }, 100);
  }
});