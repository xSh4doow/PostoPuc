// Importa a biblioteca de alertas (SweetAlert)
import swal from "https://cdn.jsdelivr.net/npm/sweetalert@2.1.2/+esm";

const buscarBtn = document.getElementById("buscar-btn");
const idCartao = document.getElementById("cartaoNumero");

function realizarClick(elemento) {
  return elemento.addEventListener("click", async function () {
    console.log("hello");
    const numServicos = await realizarServico();
    // Chama a função para verificar e criar recompensas
    await verificarCriarRecompensas(idCartao.value);

    // if (numServicos >= 3) location.reload();

    // await exibirRecompensas(idCartao.value);
  });
}

function recompensaClick(elemento) {
  return elemento.addEventListener("click", async function () {
    await usarRecompensa();
  });
}

async function mostrarListaProdutos(idCartao) {
  // Fetch para obter os produtos não utilizados
  fetch(`/produtos-nao-utilizados/${idCartao}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const produtosNaoUtilizados = data.produtosNaoUtilizados;

        if (produtosNaoUtilizados.length > 0) {
          const listaProdutosDiv = document.getElementById("lista-servicos");
          listaProdutosDiv.classList.add("lista-servicos");

          // Limpa o conteúdo atual da div
          listaProdutosDiv.innerHTML = "";

          // Cria checkboxes dinâmicos para cada produto
          produtosNaoUtilizados.forEach((produto) => {
            const div = document.createElement("div");

            const label = document.createElement("label");
            label.textContent = produto.nomeDoProduto;
            label.classList.add("nomeServico");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = produto.nomeDoProduto;
            checkbox.classList.add("checkbox");
            checkbox.classList.add("produto");

            const span = document.createElement("span");
            span.classList.add("checkmark");

            label.appendChild(checkbox);
            label.appendChild(span);
            div.appendChild(label);
            listaProdutosDiv.appendChild(div);
          });

          const botao = document.createElement("button");
          botao.type = "button";
          botao.id = "realizarBtn";
          botao.textContent = "Realizar";
          botao.classList.add("botao");
          botao.classList.add("botao-posicao");
          listaProdutosDiv.appendChild(botao);

          realizarClick(botao);

          listaProdutosDiv.style.display = "flex";
        } else {
          swal(
            "Erro",
            "Nâo existe nenhum serviço vinculado a este cartão",
            "error"
          );
        }
      } else {
        swal("Erro", "Número do cartão inválido", "error");
      }
    })
    .catch((error) => {
      console.error("Erro ao obter produtos não utilizados:", error);
    });
}

async function realizarServico() {
  // Captura todas as checkboxes de produtos marcadas
  const checkboxesProdutosMarcadas = document.querySelectorAll(
    'input[type="checkbox"].produto:checked'
  );
  console.log(checkboxesProdutosMarcadas);
  const quantidadeCompras = checkboxesProdutosMarcadas.length;

  // Obtém o valor do idCartao
  const idCartaoValue = idCartao.value;

  // Obtém os nomes dos produtos marcados
  const produtosMarcados = Array.from(checkboxesProdutosMarcadas).map(
    (checkbox) => checkbox.value
  );

  // Envia as informações para o backend
  const response = await fetch("/marcar-como-usados", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idCartao: idCartaoValue,
      produtos: produtosMarcados,
    }),
  });

  const data = await response.json();

  // Exibe o resultado usando SweetAlert
  if (data.success && quantidadeCompras > 0) {
    swal("Sucesso", "Produtos marcados como usados!", "success");
    await mostrarListaProdutos(idCartaoValue);
  } else {
    swal("Erro", "Erro ao marcar produtos como usados.", "error");
  }
  return produtosMarcados.length;
}

// Função para verificar quantos serviços estão sendo realizados e criar recompensas
async function verificarCriarRecompensas(idCartao) {
  try {
    // Captura todas as checkboxes de produtos marcadas
    const checkboxesProdutosMarcadas = document.querySelectorAll(
      'input[type="checkbox"].produto:checked'
    );
    const quantidadeCompras = checkboxesProdutosMarcadas.length;

    if (quantidadeCompras >= 3) {
      let idRecompensa;

      if (quantidadeCompras === 3) {
        idRecompensa = 2; // Calibrar Pneu
      } else if (quantidadeCompras === 4) {
        idRecompensa = 1; // Gasolina
      } else {
        idRecompensa = 3; // Polimento
      }

      // Utiliza o fetch para criar a recompensa apenas se não houver uma não usada
      const temRecompensaNaoUsada = await fetch(
        `/verificar-recompensa/${idCartao}`
      );
      const { temRecompensa } = await temRecompensaNaoUsada.json(); // {temRecompensa: ... }

      if (!temRecompensa) {
        await fetch("/criar-recompensa", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idCartao, idRecompensa }),
        });

        swal(
          "Recompensas Criadas",
          "As recompensas foram criadas e poderão ser usadas na próxima utilização do serviço.",
          "success"
        );
      } else {
        swal(
          "Erro",
          "Já existe uma recompensa não usada para esse cartão.",
          "error"
        );
      }
    }
  } catch (error) {
    console.error("Erro ao verificar e criar recompensas:", error);
  }
}

// Função para exibir as recompensas como checkboxes
async function exibirRecompensas(idCartao) {
  try {
    // Chama a função para obter os nomes das recompensas não utilizadas
    const recompensasNaoUsadas = await fetch(
      `/recompensas-nao-usadas/${idCartao}`
    );
    const { recompensas } = await recompensasNaoUsadas.json();

    if (recompensas.length !== 0) {
      document.getElementById("recompensas").style.display = "block";
      const listaRecompensasDiv = document.getElementById("listaRecompensas");

      // Limpa o conteúdo atual da div
      listaRecompensasDiv.innerHTML = "";

      // Cria checkboxes dinâmicos para cada recompensa não utilizada
      recompensas.forEach((nomeRecompensa) => {
        const div = document.createElement("div");

        const label = document.createElement("label");
        label.textContent = nomeRecompensa;
        label.classList.add("nomeServico");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = nomeRecompensa;
        checkbox.classList.add("checkbox");
        checkbox.classList.add("produto");
        checkbox.classList.add("recompensa");

        const span = document.createElement("span");
        span.classList.add("checkmark");

        label.appendChild(checkbox);
        label.appendChild(span);
        div.appendChild(label);
        listaRecompensasDiv.appendChild(div);
      });

      const botao = document.createElement("button");
      botao.type = "button";
      botao.id = "usarRecompensaBtn";
      botao.textContent = "Usar Recompensa";
      botao.classList.add("botao-posicao");
      botao.classList.add("botao");
      listaRecompensasDiv.appendChild(botao);

      recompensaClick(botao);
    } else {
      document.getElementById("recompensas").style.display = "none";
    }
  } catch (error) {
    console.error("Erro ao exibir recompensas:", error);
  }
}

// Função para usar Recompensa
async function usarRecompensa() {
  try {
    // Captura a checkbox de recompensa marcada
    const checkboxRecompensaMarcada = document.querySelector(
      'input[type="checkbox"].recompensa:checked'
    );
    console.log(checkboxRecompensaMarcada);

    if (checkboxRecompensaMarcada) {
      // Obtém o valor do idCartao
      const idCartaoValue = idCartao.value;

      // Obtém o nome da recompensa marcada
      const nomeRecompensa = checkboxRecompensaMarcada.value;

      // Envia as informações para o backend
      const response = await fetch("/usar-recompensa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idCartao: idCartaoValue, nomeRecompensa }),
      });

      const data = await response.json();

      // Exibe o resultado usando SweetAlert
      if (data.success) {
        swal("Sucesso", "Recompensa utilizada!", "success");
        // Atualiza a lista de recompensas após usar
        await exibirRecompensas(idCartao.value);
      } else {
        swal("Erro", "Erro ao utilizar a recompensa.", "error");
      }
    } else {
      swal("Erro", "Selecione uma recompensa para utilizar.", "error");
    }
  } catch (error) {
    console.error("Erro ao utilizar a recompensa:", error);
  }
}

buscarBtn.addEventListener("click", async function () {
  // Chama a função para validar o cartão e exibir produtos não utilizados
  await mostrarListaProdutos(idCartao.value);

  // Exibe as recompensas disponíveis para o cartão
  await exibirRecompensas(idCartao.value);

  // Mostra a seção de realizar serviços e recompensas
  document.getElementById("secao").style.display = "block";
});
