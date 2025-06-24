document.addEventListener('DOMContentLoaded', function() {
  const correctAnswers = {
    'cssweek1': { css1q1: 'b' },
    'cssweek2': { css2q1: 'b' },
    'cssweek3': { css3q1: 'b' },
    'cssweek4': { css4q1: 'b' },
    'cssweek5': { css5q1: 'a' },
    'cssweek6': { css6q1: 'b' },
    'cssexam': {
      examq1: 'b',  // .main
      examq2: 'b',  // padding
      examq3: 'b',  // align-items
      examq4: 'b',  // :hover
      examq5: 'b',  // @media (max-width: 600px)
      examq6: 'b',  // --main-color: #39ff14;
      examq7: 'a',  // transition и :hover
      examq8: 'a',  // display: flex; flex-wrap: wrap;
      examq9: 'a',  // CSS-переменные
      examq10: 'a'  // DevTools
    }
  };

  document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      // Закрыть все остальные
      document.querySelectorAll('.accordion-item .accordion-content').forEach(content => {
        if (content !== btn.nextElementSibling) {
          content.classList.remove('active');
          content.previousElementSibling.classList.remove('active');
        }
      });

      // Открыть/закрыть текущий
      const isActive = btn.classList.contains('active');
      btn.classList.toggle('active');
      btn.nextElementSibling.classList.toggle('active');

      // Центрировать только если открываем (а не закрываем)
      if (!isActive) {
        setTimeout(() => {
          const btnRect = btn.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const btnCenter = btnRect.top + scrollTop + btnRect.height / 2;
          const windowCenter = window.innerHeight / 2;
          let targetY = btnCenter - windowCenter;

          // Не выходим за пределы документа
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          targetY = Math.max(0, Math.min(targetY, maxScroll));

          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }, 600); // увеличенная задержка для корректного схлопывания
      }
    });
  });

  document.querySelectorAll('.weeks-nav-floating button').forEach(btn => {
    btn.addEventListener('click', function() {
      const weekId = this.dataset.goto;
      const item = document.getElementById(weekId);
      if (!item) return;
      const btnHeader = item.querySelector('.accordion-btn');
      const content = item.querySelector('.accordion-content');
      const isActive = btnHeader.classList.contains('active');

      // Закрыть все остальные недели
      document.querySelectorAll('.accordion-item .accordion-content').forEach(cont => {
        if (cont !== content) {
          cont.classList.remove('active');
          cont.previousElementSibling.classList.remove('active');
        }
      });

      // Открыть нужную неделю (если была закрыта)
      btnHeader.classList.add('active');
      content.classList.add('active');

      // Центрировать: верх блока по центру экрана
      function centerAccordionItemTop() {
        const itemRect = item.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        let targetY = itemRect.top + scrollTop - (window.innerHeight / 2);
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        targetY = Math.max(0, Math.min(targetY, maxScroll));
        window.scrollTo({ top: targetY, behavior: 'smooth' });

        // Вспышка для визуального выделения
        item.classList.remove('flash-highlight');
        void item.offsetWidth;
        item.classList.add('flash-highlight');
        setTimeout(() => item.classList.remove('flash-highlight'), 700);
      }

      // Если неделя уже открыта — центрируем сразу
      if (isActive) {
        setTimeout(centerAccordionItemTop, 50);
      } else {
        // Центрируем после завершения transition (только для открытия)
        let done = false;
        function onTransitionEnd(e) {
          if (e.target === content && !done) {
            done = true;
            centerAccordionItemTop();
            content.removeEventListener('transitionend', onTransitionEnd);
          }
        }
        content.addEventListener('transitionend', onTransitionEnd);
        setTimeout(() => {
          if (!done) {
            done = true;
            centerAccordionItemTop();
            content.removeEventListener('transitionend', onTransitionEnd);
          }
        }, 800); // увеличь если transition дольше
      }
    });
  });

  document.querySelectorAll('.quiz-submit').forEach(btn => {
    btn.addEventListener('click', function() {
      const quiz = btn.closest('.quiz');
      const week = btn.closest('.accordion-item').id;
      const inputs = quiz.querySelectorAll('input[type="radio"]');
      let selected = null;
      let name = '';
      inputs.forEach(input => { if (input.checked) { selected = input.value; name = input.name; } });
      const result = quiz.querySelector('.quiz-result');
      if (!selected) {
        result.textContent = 'Выберите вариант ответа!';
        result.style.color = '#ffb347';
        return;
      }
      if (
        correctAnswers[week] &&
        correctAnswers[week][name] &&
        selected === correctAnswers[week][name]
      ) {
        result.textContent = 'Верно!';
        result.style.color = '#39ff14';
      } else {
        result.textContent = 'Неверно!';
        result.style.color = '#ff4c4c';
      }
    });
  });

  const completeBtns = document.querySelectorAll('.complete-btn');
  const undoBtns = document.querySelectorAll('.undo-btn');
  const progressBar = document.getElementById('progress');
  const progressText = document.getElementById('progressText');
  const totalWeeks = completeBtns.length;

  let completedArr = JSON.parse(localStorage.getItem('cssCourseCompletedWeeks') || '[]');

  function updateProgress() {
    const percent = Math.round((completedArr.length / totalWeeks) * 100);
    progressBar.style.width = percent + '%';
    progressText.textContent = percent + '% завершено';
    const examItem = document.getElementById('cssexam');
    if (examItem) {
      examItem.style.display = (completedArr.length === totalWeeks) ? '' : 'none';
    }
    completeBtns.forEach((btn, idx) => {
      const item = btn.closest('.accordion-item');
      const content = item.querySelector('.accordion-content');
      if (btn.classList.contains('completed')) {
        content.classList.remove('active');
        item.querySelector('.accordion-btn').classList.remove('active');
      }
    });
  }

  completeBtns.forEach((btn, idx) => {
    const undoBtn = undoBtns[idx];
    // По умолчанию "Отменить" неактивна
    if (!btn.classList.contains('completed')) {
      undoBtn.disabled = true;
      undoBtn.classList.add('disabled');
    } else {
      undoBtn.disabled = false;
      undoBtn.classList.remove('disabled');
    }

    btn.addEventListener('click', function() {
      if (!btn.classList.contains('completed')) {
        btn.classList.add('completed');
        btn.textContent = 'Неделя завершена!';
        btn.disabled = true;
        undoBtn.disabled = false;
        undoBtn.classList.remove('disabled');
        completedArr.push(idx);
        localStorage.setItem('cssCourseCompletedWeeks', JSON.stringify(completedArr));
        updateProgress();
      }
    });
  });

  undoBtns.forEach((btn, idx) => {
    btn.addEventListener('click', function() {
      const completeBtn = completeBtns[idx];
      if (completeBtn.classList.contains('completed')) {
        completeBtn.classList.remove('completed');
        completeBtn.textContent = 'Отметить неделю как пройденную';
        completeBtn.disabled = false;
        btn.disabled = true;
        btn.classList.add('disabled');
        completedArr = completedArr.filter(i => i !== idx);
        localStorage.setItem('cssCourseCompletedWeeks', JSON.stringify(completedArr));
        updateProgress();
      }
    });
  });

  updateProgress();

  const goToJsBtn = document.getElementById('goToJsBtn');
  if (goToJsBtn) {
    goToJsBtn.addEventListener('click', () => {
      window.location.href = 'js-course.html';
    });
  }
});
