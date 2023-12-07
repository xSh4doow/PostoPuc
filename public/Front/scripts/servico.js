async function fetchRota(rota) {
    const response = await fetch(rota);
    return await response.json();
}

// Função para manipular o JSON de Recompensas recebido e adaptá-lo
async function manipularJSONR() {
    let data = await fetchRota('/informacoes-recompensas')
    const manipulado = data.informacoesRecompensas.map(recompensa => ({
        tdHead: 'RECOMPENSAS',
        tps: 'Recompensa',
        content: [
            {
                typs: 'Recompensa',
                model: recompensa.nomeRecompensa,
                qtd: recompensa.quantidadeTotal,
                qtdnut: recompensa.quantidadeUsada
            }
        ]
    }));
    console.log(manipulado);
    return manipulado;
}

// Função para manipular o JSON de Serviços recebido e adaptá-lo
async function manipularJSONS() {
    let data = await fetchRota('/informacoes-produtos')
    const manipulado = data.informacoesProdutos.map(servico => ({
        tdHead: 'SERVIÇO',
        tps: 'Serviço',
        content: [
            {
                typs: 'Serviço',
                model: servico.nomeProduto,
                qtd: servico.quantidadeTotal,
                qtdnut: servico.quantidadeUsada
            }
        ]
    }));
    console.log(manipulado);
    return manipulado;
}



/*navegaÇÃOde tela de serviços */

let dados_V = document.querySelector (".dv");
let dados_DR = document.querySelector(".dr");
let dados_d_v = document.querySelector ("#tela1");
let dados_d_S_R = document.querySelector("#tela3");

function clear_dados(){
    dados_V.classList.remove("ctr");
    dados_DR.classList.remove("ctr");
    dados_d_v.style.display = "none";
    dados_d_S_R.style.display = "none";
}

function Tela_body (name){
    name.classList.add('ctr');
}


// tabela
function creatTabel (db,telaTb) {

    let tab = telaTb ;


    db.forEach((item) =>{
        let Lbl = document.createElement('label');
        let Lbl_h1 = document.createElement('h1');

        Lbl_h1.classList.add('title');
        Lbl_h1.appendChild(document.createTextNode(item.tdHead));
        Lbl.appendChild(Lbl_h1);

        let tabela = document.createElement('table');
        tabela.classList.add('tabela');
        let cabecario = document.createElement('thead');
        let corpo = document.createElement('tbody');
        let tr = document.createElement('tr');
        let tdElement1 = document.createElement('td');
        let tdElement2 = document.createElement('td');
        let tdElement3 = document.createElement('td');



        tdElement1.innerHTML = item.tps;
        tdElement2.innerHTML = 'Quandidade Vendida';
        tdElement3.innerHTML = 'Quandidade Não Utilizada';
        tr.appendChild(tdElement1);
        tr.appendChild(tdElement2);
        tr.appendChild(tdElement3);
        cabecario.appendChild(tr);
        tabela.appendChild(cabecario);

        let textBox = document.createElement("div")
        textBox.classList.add("tabs")
        textBox.appendChild(Lbl);
        for(let it of item.content){
            corpo.innerHTML += `
      <tr>
        <td>${it.model}</td>
        <td>${it.qtd}</td>
        <td>${it.qtdnut}</td>
      </tr>
      `;
            tabela.appendChild(corpo);
            textBox.appendChild(tabela);

            tab.appendChild(textBox);

        }
    })


}

document.addEventListener("DOMContentLoaded", async function () {
// Evento de mudar a tabela do corpo
    let servicos = await manipularJSONS();
    let recompensas = await manipularJSONR();
    creatTabel(servicos, dados_d_v)
    creatTabel(recompensas, dados_d_S_R)
    dados_V.addEventListener("click", () => {
        clear_dados();
        Tela_body(dados_V);
        dados_d_v.style.display = "flex";
    });
    dados_DR.addEventListener("click", () => {
        clear_dados();
        Tela_body(dados_DR);
        dados_d_S_R.style.display = "flex";
    });
});


