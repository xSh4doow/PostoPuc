// Importa a biblioteca de alertas (SweetAlert)
import swal from 'https://cdn.jsdelivr.net/npm/sweetalert@2.1.2/+esm';

// Obtém referências aos elementos do DOM
const buscarBtn = document.getElementById("buscar-btn");
const realizarBtn = document.getElementById("realizarBtn");
const idCartao = document.getElementById("cartaoNumero");
const recompensaBtn = document.getElementById("usarRecompensaBtn");

// Função assíncrona para mostrar a lista de produtos não utilizados
async function mostrarListaProdutos(idCartao) {
    try {
        // Fetch para obter os produtos não utilizados
        fetch(`/produtos-nao-utilizados/${idCartao}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Obtem a lista de produtos não utilizados
                    const produtosNaoUtilizados = data.produtosNaoUtilizados;

                    console.log('Produtos não utilizados:', produtosNaoUtilizados);

                    if (produtosNaoUtilizados.length > 0) {
                        const listaProdutosDiv = document.getElementById("listaProdutos");

                        // Limpa o conteúdo atual da div
                        listaProdutosDiv.innerHTML = "";

                        // Cria checkboxes dinâmicos para cada produto
                        produtosNaoUtilizados.forEach(produto => {
                            const checkbox = document.createElement("input");
                            checkbox.type = "checkbox";
                            checkbox.value = produto.nomeDoProduto;
                            checkbox.classList.add("produto"); // Adiciona a classe "produto"

                            const label = document.createElement("label");
                            label.appendChild(checkbox);
                            label.appendChild(document.createTextNode(produto.nomeDoProduto));

                            listaProdutosDiv.appendChild(label);
                            listaProdutosDiv.appendChild(document.createElement("br")); // Adiciona uma quebra de linha
                        });
                    }
                }
            })
            .catch(error => {
                console.error('Erro ao obter produtos não utilizados:', error);
            });
    } catch (error) {
        console.error('Erro na função mostrarListaProdutos:', error);
    }
}

// Função assíncrona para realizar o serviço
async function realizarServico() {
    try {
        // Captura todas as checkboxes de produtos marcadas
        const checkboxesProdutosMarcadas = document.querySelectorAll('input[type="checkbox"].produto:checked');
        const quantidadeCompras = checkboxesProdutosMarcadas.length;

        // Obtém o valor do idCartao
        const idCartaoValue = idCartao.value;

        // Obtém os nomes dos produtos marcados
        const produtosMarcados = Array.from(checkboxesProdutosMarcadas).map(checkbox => checkbox.value);

        // Envia as informações para o backend
        const response = await fetch('/marcar-como-usados', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idCartao: idCartaoValue, produtos: produtosMarcados }),
        });

        const data = await response.json();

        // Exibe o resultado usando SweetAlert
        if (data.success && quantidadeCompras > 0) {
            swal('Sucesso', 'Produtos marcados como usados!', 'success');
            await mostrarListaProdutos(idCartaoValue);
        } else {
            swal('Erro', 'Erro ao marcar produtos como usados.', 'error');
        }
    } catch (error) {
        console.error('Erro na função realizarServico:', error);
    }
}

// Função assíncrona para verificar e criar recompensas
async function verificarCriarRecompensas(idCartao) {
    try {
        // Captura todas as checkboxes de produtos marcadas
        const checkboxesProdutosMarcadas = document.querySelectorAll('input[type="checkbox"].produto:checked');
        const quantidadeCompras = checkboxesProdutosMarcadas.length;

        if (quantidadeCompras >= 3) {
            let idRecompensa;

            // Define o idRecompensa com base na quantidade de compras
            if (quantidadeCompras === 3) {
                idRecompensa = 2; // Calibrar Pneu
            } else if (quantidadeCompras === 4) {
                idRecompensa = 1; // Gasolina
            } else {
                idRecompensa = 3; // Polimento
            }

            // Utiliza o fetch para verificar se já existe uma recompensa não usada
            const temRecompensaNaoUsada = await fetch(`/verificar-recompensa/${idCartao}`);
            const { temRecompensa } = await temRecompensaNaoUsada.json();

            if (!temRecompensa) {
                // Cria a recompensa apenas se não houver uma não usada
                await fetch('/criar-recompensa', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ idCartao, idRecompensa }),
                });

                swal('Recompensas Criadas', 'As recompensas foram criadas e poderão ser usadas na próxima utilização do serviço.', 'success');
            } else {
                swal('Erro', 'Já existe uma recompensa não usada para esse cartão.', 'error');
            }
        }
    } catch (error) {
        console.error('Erro na função verificarCriarRecompensas:', error);
    }
}

// Função assíncrona para exibir as recompensas como checkboxes
async function exibirRecompensas(idCartao) {
    try {
        // Chama a função para obter os nomes das recompensas não utilizadas
        const recompensasNaoUsadas = await fetch(`/recompensas-nao-usadas/${idCartao}`);
        const { recompensas } = await recompensasNaoUsadas.json();

        const listaRecompensasDiv = document.getElementById("listaRecompensas");

        // Limpa o conteúdo atual da div
        listaRecompensasDiv.innerHTML = "";

        // Cria checkboxes dinâmicos para cada recompensa não utilizada
        recompensas.forEach(nomeRecompensa => {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = nomeRecompensa;
            checkbox.classList.add("recompensa"); // Adiciona a classe "recompensa"

            const label = document.createElement("label");
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(`Recompensa: ${nomeRecompensa}`));

            listaRecompensasDiv.appendChild(label);
            listaRecompensasDiv.appendChild(document.createElement("br")); // Adiciona uma quebra de linha
        });
    } catch (error) {
        console.error('Erro na função exibirRecompensas:', error);
    }
}

// Função assíncrona para usar recompensa
async function usarRecompensa() {
    try {
        // Captura a checkbox de recompensa marcada
        const checkboxRecompensaMarcada = document.querySelector('input[type="checkbox"].recompensa:checked');

        if (checkboxRecompensaMarcada) {
            // Obtém o valor do idCartao
            const idCartaoValue = idCartao.value;

            // Obtém o nome da recompensa marcada
            const nomeRecompensa = checkboxRecompensaMarcada.value;

            // Envia as informações para o backend
            const response = await fetch('/usar-recompensa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idCartao: idCartaoValue, nomeRecompensa }),
            });

            const data = await response.json();

            // Exibe o resultado usando SweetAlert
            if (data.success) {
                swal('Sucesso', 'Recompensa utilizada!', 'success');
                // Atualiza a lista de recompensas após usar
                await exibirRecompensas(idCartao.value);
            } else {
                swal('Erro', 'Erro ao utilizar a recompensa.', 'error');
            }
        } else {
            swal('Erro', 'Selecione uma recompensa para utilizar.', 'error');
        }
    } catch (error) {
        console.error('Erro na função usarRecompensa:', error);
    }
}

// Evento disparado quando o DOM é carregado
document.addEventListener("DOMContentLoaded", function () {
    // Evento ao clicar no botão de realizar serviço
    realizarBtn.addEventListener("click", async function () {
        await realizarServico();
        // Chama a função para verificar e criar recompensas
        await verificarCriarRecompensas(idCartao.value);
    });

    // Evento ao clicar no botão de buscar
    buscarBtn.addEventListener("click", async function () {
        // Chama a função para validar o cartão e exibir produtos não utilizados
        await mostrarListaProdutos(idCartao.value);
        // Mostra a seção de realizar serviços e recompensas
        document.getElementById("realizarServicos").style.display = "block";
        document.getElementById("recompensas").style.display = "block";
        // Exibe as recompensas disponíveis para o cartão
        await exibirRecompensas(idCartao.value);
    });

    // Evento ao clicar no botão de usar recompensa
    recompensaBtn.addEventListener("click", async function () {
        await usarRecompensa();
    });
});
