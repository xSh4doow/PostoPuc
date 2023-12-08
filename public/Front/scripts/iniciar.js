// Importa a biblioteca de alertas (SweetAlert)
import swal from 'https://cdn.jsdelivr.net/npm/sweetalert@2.1.2/+esm'

// Criação de Constantes
const cartaoDiv = document.querySelector(".cartao");
const comprarDiv = document.querySelector(".comprar");
const relatoriosDiv = document.querySelector(".relatorios");

const cartaoBtn = document.getElementById("cartao-btn");
const comprarBtn = document.getElementById("comprar-btn");
const relatoriosBtn = document.getElementById("relatorios-btn");
const btnCartao = document.getElementById("show2");
const btnComprar = document.getElementById("comprar-btn2");

const botaoValidar = document.getElementById("botaoValidar1");
const imagemParaSumir1 = document.getElementById("hidden1");
const imagemParaSumir2 = document.getElementById("hidden2");
const imagemParaSumir3 = document.getElementById("hidden3");
const imagemParaSumir4 = document.getElementById("hidden4");

const imagemParaAparecer1 = document.getElementById("show1");
const imagemParaAparecer2 = document.getElementById("show2");
const imagemParaAparecer3 = document.getElementById("show3");
const imagemParaAparecer4 = document.getElementById("show4");
const tabelas = document.getElementById("tabelas");



const produtos = [
    { nome: "Gasolina", imagem: "http://localhost:3000/static/Front/media/li-gas.png" },
    { nome: "Óleo Motor", imagem: "http://localhost:3000/static/Front/media/li-oil.png" },
    { nome: "Óleo Cambio", imagem: "http://localhost:3000/static/Front/media/li-oil.png" },
    { nome: "Aditivos Radiador", imagem: "http://localhost:3000/static/Front/media/li-oil.png" },
    { nome: "Lavagem", imagem: "http://localhost:3000/static/Front/media/li-carwashing.png" },
    { nome: "Calibrar Pneu", imagem: "http://localhost:3000/static/Front/media/li-carwashing.png" },
    { nome: "Polimento", imagem: "http://localhost:3000/static/Front/media/li-carwashing.png" },
    { nome: "Filtro de Ar", imagem: "http://localhost:3000/static/Front/media/li-filter.png" },
    { nome: "Filtro de Óleo", imagem: "http://localhost:3000/static/Front/media/li-filter.png" },
    { nome: "Filtro de Combustível", imagem: "http://localhost:3000/static/Front/media/li-filter.png" },
    { nome: "Baterias", imagem: "http://localhost:3000/static/Front/media/li-battery.png" },
    { nome: "Kit Óleo", imagem: "http://localhost:3000/static/Front/media/teste45.png" },
    { nome: "Kit Filtro", imagem: "http://localhost:3000/static/Front/media/teste45.png" },
    { nome: "Kit Lavagem", imagem: "http://localhost:3000/static/Front/media/teste45.png" }
];




// Função para criar a lista de produtos
function criarListaProdutos() {
    const produtosList = document.getElementById("produtos-list");

    produtos.forEach((produto, index) => {
        const li = document.createElement("li");
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        const img = document.createElement("img");
        const textoProduto = document.createTextNode(produto.nome);

        checkbox.type = "checkbox";
        checkbox.value = produto.nome;
        checkbox.className = "checkbox-grande";

        img.className = "li-img";
        img.src = produto.imagem;
        img.alt = produto.nome;

        label.appendChild(checkbox);
        label.appendChild(img);
        label.appendChild(textoProduto);

        li.appendChild(label);

        produtosList.appendChild(li);
    });
}

document.addEventListener("DOMContentLoaded", function() {
    cartaoBtn.addEventListener("click", function() {
        // Mostra o conteúdo da aba "Cartão" e oculta as outras
        cartaoDiv.style.display = "block";
        comprarDiv.style.display = "none";
        relatoriosDiv.style.display = "none";
        
        const h2 = cartaoDiv.querySelector("h2")
        h2.classList.add("card-title")

        const gerarCartaoDiv = document.querySelector(".gerarCartaoDiv");
        gerarCartaoDiv.style.display = "flex"
        // Esconde o botão "Cartão" e a imagem associada
        cartaoBtn.style.display = "none";
        imagemParaSumir1.style.display = "none";

        // Mostra as imagens associadas às outras abas
        imagemParaAparecer1.style.display = "flex";
        imagemParaAparecer2.style.display = "flex";
    });

    comprarBtn.addEventListener("click", function() {
        // Mostra o conteúdo da aba "Comprar" e oculta as outras
        cartaoDiv.style.display = "none";
        comprarDiv.style.display = "block";
        relatoriosDiv.style.display = "none";

        
        const comprarProdutos = document.querySelector(".comprar-produtos");
        comprarProdutos.style.display = "block"
        
        // Esconde o botão "Comprar" e a imagem associada
        comprarBtn.style.display = "none";
        imagemParaSumir2.style.display = "none";
        document.getElementById("title").style.display = "none"

        // Mostra a imagem associada à aba "Comprar" e cria a lista de produtos
        imagemParaAparecer3.style.display = "initial";
        criarListaProdutos();
    });
    relatoriosBtn.addEventListener("click", function() {

        // Mostra o conteúdo da aba "Relatórios" e oculta as outras
        cartaoDiv.style.display = "none";
        comprarDiv.style.display = "none";
        relatoriosDiv.style.display = "block";

        // Esconde o botão "Relatórios" e a imagem associada
        relatoriosBtn.style.display = "none";
        imagemParaSumir3.style.display = "none";
        imagemParaSumir4.style.display = "block";
        imagemParaAparecer4.style.display = "flex";
    });
    botaoValidar.addEventListener("click", function() {
        // Mostra o conteúdo da aba "Relatórios" e oculta as outras
        cartaoDiv.style.display = "none";
        comprarDiv.style.display = "none";
        relatoriosDiv.style.display = "block";
        relatoriosDiv.style.height = "auto";

        // Esconde o botão "Relatórios" e a imagem associada
        relatoriosBtn.style.display = "none";
        imagemParaSumir3.style.display = "none";
        imagemParaAparecer4.style.display = "none";
        tabelas.style.display = "flex"
    });
});

// Função para gerar um cartão
function gerarCartao() {
    fetch('/gerar-cartao')
        .then(response => response.json())
        .then(data => {
            const resp = parseInt(data.informacao); // Converte para um número inteiro
            console.log('Informação recebida:', resp);

            // Verifica se resp é um número válido
            if (!isNaN(resp)) {
                swal("Cartão Gerado!", "Não se esqueça de anotar seu código! \n O Código do seu cartão é: " + resp, "success");
            } else {
                swal("Erro", "O servidor não retornou um valor válido.", "error");
            }
        })
        .catch(error => {
            console.error('Erro ao obter a informação:', error);
            swal("Erro", "Ocorreu um erro ao obter a informação do servidor.", "error");
        });
}

// Função para comprar produtos
function comprarProdutos() {
    const produtosSelecionados = [];
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const Card = document.getElementById("cartaoNumero");
    const valCard = Card.value;

    checkboxes.forEach((checkbox) => {
        produtosSelecionados.push(checkbox.value);
    });

    fetch('/comprar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ produtos: produtosSelecionados, cartao: valCard }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success === true) {
                swal("Compra realizada com sucesso!", "Seus itens foram adicionados ao seu cartão!", "success");
            } else {
                swal("Erro", "Erro na compra. Tente novamente.", "error");
            }
        })
        .catch((error) => {
            console.error('Erro na solicitação:', error);
        });
}

// Adiciona um evento de clique para o botão "Gerar Cartão"
btnCartao.addEventListener("click", function () {
    gerarCartao();
});

// Adiciona um evento de clique para o botão "Comprar"
btnComprar.addEventListener("click", function () {
    comprarProdutos();
});


//Função da Parte de Relatório
// Função para atualizar a tabela de relatórios
function atualizarRelatorio(numeroCartao) {
    const tabelaRecompensas = document.querySelector("#tabela-recompensas tbody");
    const tabelaServicos = document.querySelector("#tabela-servicos tbody");

    // Limpa o corpo das tabelas
    tabelaRecompensas.innerHTML = '';
    tabelaServicos.innerHTML = '';

    // Obtém as informações do relatório
    fetch(`/obter-informacoes-relatorio/${numeroCartao}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const informacoes = data.informacoes;

                // Adiciona os dados da tabela de recompensas
                informacoes.informacoesRecompensas.forEach(recompensa => {
                    const linha = document.createElement("tr");

                    const colunaNome = document.createElement("td");
                    colunaNome.textContent = recompensa.nomeRecompensa;

                    const colunaQuantidade = document.createElement("td");
                    colunaQuantidade.textContent = recompensa.quantidade;

                    linha.appendChild(colunaNome);
                    linha.appendChild(colunaQuantidade);

                    tabelaRecompensas.appendChild(linha);
                });

                // Adiciona os dados da tabela de serviços
                informacoes.informacoesServicos.forEach(servico => {
                    const linha = document.createElement("tr");

                    const colunaNome = document.createElement("td");
                    colunaNome.textContent = servico.nomeServico;

                    const colunaQuantidade = document.createElement("td");
                    colunaQuantidade.textContent = servico.quantidade;

                    const colunaUltimaUtilizacao = document.createElement("td");
                    colunaUltimaUtilizacao.textContent = new Date(servico.ultimaUtilizacao).toLocaleString();

                    linha.appendChild(colunaNome);
                    linha.appendChild(colunaQuantidade);
                    linha.appendChild(colunaUltimaUtilizacao);

                    tabelaServicos.appendChild(linha);
                });
            } else {
                swal("Erro", "Ocorreu um erro ao obter informações do relatório.", "error");
            }
        })
        .catch(error => {
            console.error('Erro ao obter informações do relatório:', error);
            swal("Erro", "Ocorreu um erro ao obter informações do relatório do servidor.", "error");
        });
}

// Evento de clique no botão "Gerar" na seção de relatórios
document.getElementById("botaoValidar1").addEventListener("click", function () {
    const Card = document.getElementById("cartaoNumeroRelatorio");
    const valCard = Card.value;
    console.log(valCard)
    if (valCard) {
        atualizarRelatorio(valCard);
    } else {
        swal("Erro", "Digite o número do cartão.", "error");
    }
});