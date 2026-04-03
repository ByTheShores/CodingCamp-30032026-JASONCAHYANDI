const COLORS = [
  '#4895EF', '#e74c3c', '#2ecc71', '#f39c12',
  '#9b59b6', '#1abc9c', '#e67e22', '#34495e'
];

// Load from localStorage
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

const ctx = document.getElementById('pie-chart').getContext('2d');
const pieChart = new Chart(ctx, {
  type: 'pie',
  data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
  options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
});

function saveTransactions() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function updateBalance() {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const el = document.getElementById('total-balance');
  const box = document.querySelector('#feature .fe-box');
  const label = document.querySelector('#feature h4');
  const limit = parseFloat(document.getElementById('SpendingLimit').value);
  const over = !isNaN(limit) && total > limit;

  el.textContent = '$' + total.toLocaleString();
  el.style.color = (localStorage.getItem('darkmode') === 'active') ? over ? '#e74c3c' : '#effa22' : over ? '#e74c3c' : '#4895EF';
  label.style.color = over ? '#e74c3c' : '#949494';
  box.style.backgroundColor = over ? '#fff0f0' : '';
  box.style.borderColor = over ? '#e74c3c' : '';
}

function updateChart() {
  const totals = {};
  transactions.forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + Math.abs(t.amount);
  });
  const labels = Object.keys(totals);
  pieChart.data.labels = labels;
  pieChart.data.datasets[0].data = labels.map(l => totals[l]);
  pieChart.data.datasets[0].backgroundColor = labels.map((_, i) => COLORS[i % COLORS.length]);
  pieChart.update();
}

//transaction list func
function renderList() {
  const list = document.getElementById('transaction-list');
  list.innerHTML = '';
  transactions.forEach(t => {
    const li = document.createElement('li');
    li.dataset.id = t.id;
    li.innerHTML = `
      <div class="t-info">
        <span class="t-name">${t.name}</span>
        <span class="t-amount">${t.amount}</span>
        <span class="t-category">${t.category}</span>
      </div>
      <button class="t-delete">Delete</button>
    `;
    li.querySelector('.t-delete').addEventListener('click', function () {
      const idx = transactions.findIndex(x => x.id === t.id);
      if (idx !== -1) transactions.splice(idx, 1);
      li.remove();
      saveTransactions();
      updateChart();
      updateBalance();
    });
    list.appendChild(li);
  });
}

document.querySelector('#adder button').addEventListener('click', function () {
  const name = document.getElementById('ItemName').value.trim();
  const amount = parseFloat(document.getElementById('Amount').value.trim());
  const category = document.getElementById('Category').value.trim();

  if (!name || isNaN(amount) || !category) return;

  const id = Date.now();
  transactions.push({ id, name, amount, category });
  saveTransactions();

  renderList();
  updateChart();
  updateBalance();

  document.getElementById('ItemName').value = '';
  document.getElementById('Amount').value = '';
  document.getElementById('Category').value = '';
});

document.getElementById('sort-category').addEventListener('click', function () {
  transactions.sort((a, b) => a.category.localeCompare(b.category));
  renderList();
});

document.getElementById('sort-amount').addEventListener('click', function () {
  transactions.sort((a, b) => b.amount - a.amount);
  renderList();
});

document.getElementById('SpendingLimit').addEventListener('input', function () {
  localStorage.setItem('spendingLimit', this.value);
  updateBalance();
});

// Dark mode func
const enableDarkmode = () => {
  document.body.classList.add('darkmode');
  localStorage.setItem('darkmode', 'active');
};

const disableDarkmode = () => {
  document.body.classList.remove('darkmode');
  localStorage.setItem('darkmode', null);
};

if (localStorage.getItem('darkmode') === 'active') enableDarkmode();

document.getElementById('theme-switch').addEventListener('click', function () {
  localStorage.getItem('darkmode') !== 'active' ? enableDarkmode() : disableDarkmode();
  updateBalance();
});

// Restore saved spending limit
const savedLimit = localStorage.getItem('spendingLimit');
if (savedLimit) document.getElementById('SpendingLimit').value = savedLimit;

// Init on load
renderList();
updateChart();
updateBalance();
