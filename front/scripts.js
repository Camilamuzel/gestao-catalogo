const BASE_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:3000'
  : 'https://gestao-catalogo-1.onrender.com';

const API_URL = `${BASE_URL}/produtos`;
const ENTREGAS_URL = `${BASE_URL}/entregas`;

const form = document.getElementById('form-produto');
const formEntrega = document.getElementById('form-entrega');
const container = document.getElementById('catalogo-container');
const listaEntregas = document.getElementById('lista-entregas');
let produtos = [];

function navegarPara(tela) {
  document.getElementById('view-catalogo').style.display = tela === 'catalogo' ? 'block' : 'none';
  document.getElementById('view-entregas').style.display = tela === 'entregas' ? 'block' : 'none';

  document.getElementById('nav-catalogo').classList.toggle('ativo', tela === 'catalogo');
  document.getElementById('nav-entregas').classList.toggle('ativo', tela === 'entregas');

  if (tela === 'entregas') carregarEntregas();
}

async function carregarCatalogo() {
  try {
    const res = await fetch(API_URL);
    produtos = await res.json();
    mostrarProdutos(produtos);
  } catch (err) {
    container.innerHTML = '<p style="color:red">Erro ao conectar na API.</p>';
  }
}

function mostrarProdutos(lista) {
  container.innerHTML = lista.length
    ? lista.map(p => `
        <div class="card">
          <img src="${p.imagem || 'https://via.placeholder.com/150'}" alt="${p.nome}">
          <h3>${p.nome}</h3>
          <p>R$ ${Number(p.preco).toFixed(2)}</p>
          <button onclick="irParaEntrega('${p.nome}')">Entregar</button>
          <button onclick="editar('${p.id}')">Editar</button>
          <button onclick="excluir('${p.id}')">Excluir</button>
        </div>
      `).join('')
    : '<p>Nenhum produto encontrado.</p>';
}

document.getElementById('campo-busca').addEventListener('input', (e) => {
  const termo = e.target.value.toLowerCase();
  mostrarProdutos(produtos.filter(p => p.nome.toLowerCase().includes(termo)));
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('produto-id').value;

  const dados = {
    nome: document.getElementById('titulo').value,
    preco: parseFloat(document.getElementById('preco').value),
    imagem: document.getElementById('imagem').value || 'https://via.placeholder.com/150'
  };

  await fetch(id ? `${API_URL}/${id}` : API_URL, {
    method: id ? 'PATCH' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });

  limparForm();
  carregarCatalogo();
});

function editar(id) {
  const p = produtos.find(item => item.id == id);
  document.getElementById('produto-id').value = p.id;
  document.getElementById('titulo').value = p.nome;
  document.getElementById('preco').value = p.preco;
  document.getElementById('imagem').value = p.imagem.includes('placeholder') ? '' : p.imagem;
  
  document.getElementById('btn-salvar').textContent = 'Salvar Alterações';
  document.getElementById('btn-cancelar').style.display = 'inline-block';
}

async function excluir(id) {
  if (!confirm('Excluir este produto?')) return;
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  carregarCatalogo();
}

function limparForm() {
  form.reset();
  document.getElementById('produto-id').value = '';
  document.getElementById('btn-salvar').textContent = 'Adicionar ao Catálogo';
  document.getElementById('btn-cancelar').style.display = 'none';
}
document.getElementById('btn-cancelar').addEventListener('click', limparForm);

function irParaEntrega(nomeProduto) {
  document.getElementById('entrega-produto').value = nomeProduto;
  document.getElementById('titulo-entrega').textContent = `Solicitar Entrega: ${nomeProduto}`;
  navegarPara('entregas');
}

formEntrega.addEventListener('submit', async (e) => {
  e.preventDefault();
  const novaEntrega = {
    produto: document.getElementById('entrega-produto').value,
    endereco: document.getElementById('entrega-endereco').value,
    telefone: document.getElementById('entrega-telefone').value,
    data: new Date().toLocaleDateString('pt-BR')
  };

  await fetch(ENTREGAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(novaEntrega)
  });

  formEntrega.reset();
  document.getElementById('titulo-entrega').textContent = 'Solicitar Nova Entrega';
  carregarEntregas();
});

async function carregarEntregas() {
  try {
    const res = await fetch(ENTREGAS_URL);
    const entregas = await res.json();

    listaEntregas.innerHTML = entregas.length
      ? entregas.map(ent => `
          <div class="card">
            <h3>${ent.produto}</h3>
            <p style="font-size: 0.9rem; color: var(--texto); font-weight: 400;">📍 ${ent.endereco}</p>
            <p style="font-size: 0.9rem;">📞 ${ent.telefone}</p>
            <small style="display:block; margin-bottom:10px; color:#666;">Data: ${ent.data || 'Hoje'}</small>
            <button onclick="concluirEntrega('${ent.id}')" style="background: var(--coral); color: white;">Concluir / Remover</button>
          </div>
        `).join('')
      : '<p>Nenhuma entrega solicitada ainda.</p>';
  } catch (err) {
    listaEntregas.innerHTML = '<p style="color:red">Erro ao carregar entregas.</p>';
  }
}

async function concluirEntrega(id) {
  if (!confirm('Remover este registro de entrega?')) return;
  await fetch(`${ENTREGAS_URL}/${id}`, { method: 'DELETE' });
  carregarEntregas();
}

carregarCatalogo();