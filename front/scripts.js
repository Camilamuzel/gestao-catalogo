const API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:3000/produtos'
  : 'https://gestao-catalogo-1.onrender.com/produtos';

const form = document.getElementById('form-produto');
const container = document.getElementById('catalogo-container');
let produtos = [];

// 1. LER (GET) e RENDERIZAR
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
          <button onclick="editar('${p.id}')">Editar</button>
          <button onclick="excluir('${p.id}')">Excluir</button>
        </div>
      `).join('')
    : '<p>Nenhum produto encontrado.</p>';
}

// 2. CONSULTAR (Busca em tempo real)
document.getElementById('campo-busca').addEventListener('input', (e) => {
  const termo = e.target.value.toLowerCase();
  mostrarProdutos(produtos.filter(p => p.nome.toLowerCase().includes(termo)));
});

// 3. CRIAR (POST) ou ATUALIZAR (PATCH)
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
