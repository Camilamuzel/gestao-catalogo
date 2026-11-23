// 1. DETECÇÃO DE AMBIENTE (Docker Local vs. Render)
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_URL = isLocalhost
  ? 'http://localhost:3000/produtos'                // Porta do container Docker
  : 'https://gestao-catalogo-1.onrender.com/produtos'

// Elementos da tela
const container = document.getElementById('catalogo-container');
const form = document.getElementById('form-produto');
const inputId = document.getElementById('produto-id');
const inputTitulo = document.getElementById('titulo');
const inputPreco = document.getElementById('preco');
const inputImagem = document.getElementById('imagem');
const btnSalvar = document.getElementById('btn-salvar');
const btnCancelar = document.getElementById('btn-cancelar');


// 1. READ (GET) - Listar todos os produtos
async function carregarCatalogo() {
  // Mensagem adaptada ao ambiente
  container.innerHTML = isLocalhost
    ? '<p>Carregando catálogo do Docker...</p>'
    : '<p>Acordando servidor no Render... (pode levar até 45s no primeiro acesso)</p>';

  try {
    const resposta = await fetch(API_URL);
    if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);

    const produtos = await resposta.json();
    container.innerHTML = '';

    if (produtos.length === 0) {
      container.innerHTML = '<p>Nenhum produto cadastrado no momento.</p>';
      return;
    }

    produtos.forEach(produto => {
      const card = document.createElement('div');
      card.className = 'card';
      
      // Escapa aspas simples no nome para não quebrar o onclick
      const nomeSeguro = produto.nome.replace(/'/g, "\\'");
      const imagemUrl = produto.imagem || 'https://via.placeholder.com/150';

      card.innerHTML = `
        <img src="${imagemUrl}" alt="${produto.nome}">
        <h3>${produto.nome}</h3>
        <p>R$ ${Number(produto.preco).toFixed(2)}</p>
        <div class="acoes">
          <button onclick="prepararEdicao('${produto.id}', '${nomeSeguro}', ${produto.preco}, '${imagemUrl}')">Editar</button>
          <button onclick="deletarProduto('${produto.id}')">Excluir</button>
        </div>
      `;
      container.appendChild(card);
    });

  } catch (erro) {
    console.error('Erro ao carregar catálogo:', erro);
    container.innerHTML = `
      <p style="color: red;">
        Não foi possível conectar à API (${isLocalhost ? 'Docker' : 'Render'}).<br>
        Verifique se o servidor está rodando e confira o Console (F12).
      </p>`;
  }
}




// 2. CREATE (POST) & UPDATE (PATCH) - Salvar
form.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const id = inputId.value; // Se tiver ID, é edição (PATCH). Se estiver vazio, é criação (POST).
  
  const dadosProduto = {
    nome: inputTitulo.value.trim(),
    preco: parseFloat(inputPreco.value),
    imagem: inputImagem.value.trim() || 'https://via.placeholder.com/150'
  };



  // Define a URL e o método HTTP dinamicamente
  const url = id ? `${API_URL}/${id}` : API_URL;
  const metodo = id ? 'PATCH' : 'POST';

  btnSalvar.disabled = true;
  btnSalvar.textContent = 'Salvando...';

  try {
    const resposta = await fetch(url, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosProduto)
    });

    if (!resposta.ok) throw new Error(`Erro ao salvar: ${resposta.status}`);

    resetarFormulario();
    await carregarCatalogo(); // Atualiza a lista na tela

  } catch (erro) {
    console.error('Erro na operação:', erro);
    alert('Erro ao salvar o produto. Tente novamente.');
  } finally {
    btnSalvar.disabled = false;
  }
});


// 3. PREPARAR EDIÇÃO (Preenche o formulário)
function prepararEdicao(id, nome, preco, imagem) {
  inputId.value = id;
  inputTitulo.value = nome;
  inputPreco.value = preco;
  inputImagem.value = imagem === 'https://via.placeholder.com/150' ? '' : imagem;

  btnSalvar.textContent = 'Salvar Alterações';
  btnCancelar.style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' }); // Sobe a tela até o formulário
}



// Cancelar edição e voltar ao modo de cadastro
btnCancelar.addEventListener('click', resetarFormulario);

function resetarFormulario() {
  form.reset();
  inputId.value = '';
  btnSalvar.textContent = 'Adicionar ao Catálogo';
  btnCancelar.style.display = 'none';
}



// 4. DELETE - Excluir produto
async function deletarProduto(id) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;

  try {
    const resposta = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!resposta.ok) throw new Error(`Erro ao excluir: ${resposta.status}`);

    await carregarCatalogo(); // Atualiza a tela

  } catch (erro) {
    console.error('Erro ao excluir:', erro);
    alert('Não foi possível excluir o item.');
  }
}

// Inicializa o sistema ao abrir a página
carregarCatalogo();