(() => {
  const init = () => {
    const dialog = document.getElementById('hero-quiz');
    if (!dialog || window.__heroQuizReady) return;
    window.__heroQuizReady = true;
    const nativeDialog = typeof dialog.showModal === 'function';
    const openDialog = () => {
      if (nativeDialog) dialog.showModal();
      else {
        dialog.classList.add('quiz-dialog-fallback');
        dialog.setAttribute('open', '');
        document.body.classList.add('quiz-modal-open');
      }
    };
    const closeDialog = () => {
      if (nativeDialog) dialog.close();
      else {
        dialog.removeAttribute('open');
        dialog.classList.remove('quiz-dialog-fallback');
        document.body.classList.remove('quiz-modal-open');
        dialog.dispatchEvent(new Event('close'));
      }
    };
    const form = document.getElementById('quiz-form');
    const steps = [...form.querySelectorAll('.quiz-step')];
    const next = form.querySelector('.quiz-next');
    const back = form.querySelector('.quiz-back');
    const counter = document.getElementById('quiz-counter');
    const progress = document.getElementById('quiz-progress');
    const result = document.getElementById('quiz-result');
    let index = 0;
    let opener = null;
    const labels = {
      zone: {body:'Тело, руки или ноги',brows:'Брови',lips:'Губы',face:'Лицо или веки'},
      intent: {consult:'Консультация специалиста',test:'Бесплатный тест 1×1 см',soon:'Запись на ближайшее время',price:'Расчёт стоимости'}
    };
    const recommendations = {
      tattoo: ['Лазерное удаление татуировки','Для пигмента на теле специалист оценит глубину, оттенки и плотность нанесения. Можно начать с бесплатной тестовой процедуры на участке 1×1 см.'],
      pmu: ['Удаление татуажа лазером','Для перманентного макияжа важны зона и оттенок пигмента. Специалист подберёт параметры воздействия после осмотра.'],
      scar: ['Лазерная коррекция шрама','Для рубца важны его возраст, рельеф и реакция кожи. На консультации врач определит подходящий протокол коррекции.'],
      rejuvenation: ['Лазерное омоложение кожи','Для улучшения тона и качества кожи специалист оценит её состояние и предложит подходящий аппаратный протокол.']
    };
    const selected = () => steps[index].querySelector('input:checked');
    const render = () => {
      steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
      counter.textContent = `Вопрос ${index + 1} из ${steps.length}`;
      progress.style.width = `${(index + 1) / steps.length * 100}%`;
      back.classList.toggle('is-visible', index > 0);
      next.disabled = !selected();
      next.innerHTML = index === steps.length - 1 ? 'Показать результат <svg class="icon" aria-hidden="true"><use href="#i-next"/></svg>' : 'Далее <svg class="icon" aria-hidden="true"><use href="#i-next"/></svg>';
    };
    const finish = () => {
      const data = Object.fromEntries(new FormData(form));
      const [title, text] = recommendations[data.goal] || recommendations.tattoo;
      document.getElementById('quiz-result-title').textContent = title;
      document.getElementById('quiz-result-text').textContent = text;
      document.getElementById('quiz-result-zone').textContent = labels.zone[data.zone] || 'Уточняется на консультации';
      document.getElementById('quiz-result-intent').textContent = labels.intent[data.intent] || 'Консультация специалиста';
      form.hidden = true;
      result.classList.add('is-active');
      counter.textContent = 'Результат';
      progress.style.width = '100%';
      result.querySelector('a').focus({preventScroll:true});
    };
    const reset = () => {
      form.reset(); index = 0; form.hidden = false; result.classList.remove('is-active'); render();
      steps[0].querySelector('input').focus({preventScroll:true});
    };
    document.querySelectorAll('[data-quiz-open]').forEach(button => button.addEventListener('click', () => {opener = button; reset(); openDialog();}));
    dialog.querySelector('[data-quiz-close]').addEventListener('click', closeDialog);
    dialog.addEventListener('click', event => {if (event.target === dialog) closeDialog();});
    dialog.addEventListener('close', () => opener?.focus({preventScroll:true}));
    form.addEventListener('change', () => {next.disabled = !selected();});
    next.addEventListener('click', () => {
      if (!selected()) return;
      if (index === steps.length - 1) finish();
      else {index++; render(); steps[index].querySelector('input').focus({preventScroll:true});}
    });
    back.addEventListener('click', () => {
      if (index) {index--; render(); steps[index].querySelector('input:checked, input').focus({preventScroll:true});}
    });
    result.querySelector('.quiz-restart').addEventListener('click', reset);
    render();
  };
  let attempts = 0;
  const boot = () => {
    init();
    if (!window.__heroQuizReady && attempts++ < 50) setTimeout(boot, 200);
  };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
