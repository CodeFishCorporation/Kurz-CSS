document.addEventListener('DOMContentLoaded', function() {
  const correctAnswers = {
    'cssweek1': { css1q1: 'b' },
    'cssweek2': { css2q1: 'b' },
    'cssweek3': { css3q1: 'b' },
    'cssweek4': { css4q1: 'b' },
    'cssweek5': { css5q1: 'a' },
    'cssweek6': { css6q1: 'b' },
    'cssexam': {
      examq1: 'b',
      examq2: 'b',
      examq3: 'b',
      examq4: 'b',
      examq5: 'b',
      examq6: 'b'
    }
  };

  document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const content = this.nextElementSibling;
      this.classList.toggle('active');
      content.classList.toggle('active');
    });
  });

  document.querySelectorAll('.weeks-nav-floating button').forEach(btn => {
    btn.addEventListener('click', function() {
      const weekId = this.dataset.goto;
      const target = document.getElementById(weekId);
      if (target) {
        const rect = target.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = rect.top + scrollTop - (window.innerHeight / 2) + (rect.height / 2);
        window.scrollTo({ top: targetY, behavior: 'smooth' });
        target.classList.remove('flash-highlight');
        void target.offsetWidth;
        target.classList.add('flash-highlight');
        setTimeout(() => target.classList.remove('flash-highlight'), 700);
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
  }

  completeBtns.forEach((btn, idx) => {
    if (completedArr.includes(idx)) {
      btn.classList.add('completed');
      btn.textContent = 'Неделя завершена!';
      btn.disabled = true;
    }
    btn.addEventListener('click', function() {
      if (!btn.classList.contains('completed')) {
        btn.classList.add('completed');
        btn.textContent = 'Неделя завершена!';
        btn.disabled = true;
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
