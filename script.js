const selected = new Set();
const countEls = [document.querySelector('#cart-count'), document.querySelector('#floating-count')];
const floatingCart = document.querySelector('#floating-cart');
const modal = document.querySelector('#quote-modal');
const selectedList = document.querySelector('#selected-list');
const toast = document.querySelector('#toast');

document.querySelector('#year').textContent = new Date().getFullYear();

document.querySelector('.menu-toggle').addEventListener('click', (event) => {
  const nav = document.querySelector('.nav');
  const isOpen = nav.classList.toggle('open');
  event.currentTarget.setAttribute('aria-expanded', isOpen);
});
document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => document.querySelector('.nav').classList.remove('open')));

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  const filter = button.dataset.filter;
  document.querySelectorAll('.toy-card').forEach(card => card.classList.toggle('hidden', filter !== 'todos' && card.dataset.category !== filter));
}));

document.querySelectorAll('.add-button').forEach(button => button.addEventListener('click', () => {
  const card = button.closest('.toy-card');
  const name = card.dataset.name;
  if (selected.has(name)) {
    selected.delete(name);
    button.classList.remove('added');
    button.innerHTML = 'Adicionar <span>+</span>';
    notify(`${name} removido da lista`);
  } else {
    selected.add(name);
    button.classList.add('added');
    button.innerHTML = 'Adicionado <span>✓</span>';
    notify(`${name} adicionado!`);
  }
  updateCart();
}));

function updateCart() {
  countEls.forEach(element => element.textContent = selected.size);
  floatingCart.classList.toggle('visible', selected.size > 0);
  renderSelected();
}

function renderSelected() {
  selectedList.innerHTML = selected.size
    ? [...selected].map(name => `<div class="selected-item"><span>🎈 ${name}</span><button type="button" data-remove="${name}" aria-label="Remover ${name}">×</button></div>`).join('')
    : '<p>Nenhum brinquedo foi selecionado ainda.</p>';
  selectedList.querySelectorAll('[data-remove]').forEach(button => button.addEventListener('click', () => {
    const name = button.dataset.remove;
    selected.delete(name);
    const cardButton = document.querySelector(`[data-name="${CSS.escape(name)}"] .add-button`);
    if (cardButton) { cardButton.classList.remove('added'); cardButton.innerHTML = 'Adicionar <span>+</span>'; }
    updateCart();
  }));
}

function openModal() {
  if (!selected.size) { document.querySelector('#brinquedos').scrollIntoView(); notify('Escolha pelo menos um brinquedo'); return; }
  renderSelected(); modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('modal-open');
}
function closeModal() { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.classList.remove('modal-open'); }
floatingCart.addEventListener('click', openModal);
document.querySelector('.cart-button').addEventListener('click', event => { if (selected.size) { event.preventDefault(); openModal(); } });
document.querySelectorAll('[data-close]').forEach(element => element.addEventListener('click', closeModal));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });

document.querySelector('#quote-form').addEventListener('submit', event => {
  event.preventDefault();

  if (!selected.size) {
    notify('Escolha pelo menos um brinquedo');
    return;
  }

  const name = document.querySelector('#customer-name').value.trim();
  const dateValue = document.querySelector('#event-date').value;
  const place = document.querySelector('#event-place').value.trim();
  const notes = document.querySelector('#event-notes').value.trim();

  const date = new Date(
    `${dateValue}T12:00:00`
  ).toLocaleDateString('pt-BR');

  const message = [
    'Olá, Animafest! Gostaria de solicitar um orçamento. 🎉',
    '',
    `*Nome:* ${name}`,
    `*Data da festa:* ${date}`,
    `*Cidade/Bairro:* ${place}`,
    '',
    '*Brinquedos escolhidos:*',
    ...[...selected].map(item => `• ${item}`),
    notes ? `\n*Observações:* ${notes}` : '',
    '',
    'Podem verificar a disponibilidade para mim?'
  ]
    .filter(Boolean)
    .join('\n');

const telefone = '554899495377';

window.open(
  `https://wa.me/${telefone}?text=${encodeURIComponent(message)}`,
  '_blank',
  'noopener'
);
});



function notify(message) { toast.textContent = message; toast.classList.add('show'); clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => toast.classList.remove('show'), 2200); }

const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

