const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const { addNoBanco, addCompras, obterProdutosNaoUtilizados, marcarProdutosComoUsados, usarRecompensa,
    verificarRecompensa, criarRecompensa, obterRecompensasNaoUsadas, obterInformacoesPorCartao,
    obterInformacoesProdutosVendidos, obterInformacoesRecompensasUtilizadas} = require('./public/Back/scripts/app.js');

// Configuração do servidor Express
// app.use(express.static(path.join(__dirname + "/public")));
app.use(bodyParser.json());
const port = process.env.PORT || 3000
app.use('/static', express.static(path.join(__dirname + "/public")))
// Rota para a página inicial
app.get('/', function (req, res) {
    const htmlPath = path.join(__dirname, 'public', 'html', 'iniciar.html');
    res.sendFile(htmlPath);
});

// Rota para a página de usuário
app.get('/usuario', function (req, res) {
    const htmlPath = path.join(__dirname, 'public', 'html', 'usuario.html');
    res.sendFile(htmlPath);
});

// Rota para a página de colaborador
app.get('/colaborador', function (req, res) {
    const htmlPath = path.join(__dirname, 'public', 'html', 'colaborador.html');
    res.sendFile(htmlPath);
});

// Rota para a página de admin
app.get('/servico', function (req, res) {
    const htmlPath = path.join(__dirname, 'public', 'html', 'servico.html');
    res.sendFile(htmlPath);
});

// Rota para a página de admin
app.get('/servico.html', function (req, res) {
    const htmlPath = path.join(__dirname, 'html', 'servico.html');
    res.sendFile(htmlPath);
});

// Rota para gerar um novo cartão
app.get('/gerar-cartao', async (req, res) => {
    const informacao = await addNoBanco();
    res.json({ informacao });
});

// Rota para processar uma compra
app.post('/comprar', async (req, res) => {
    const produtosSelecionados = req.body.produtos;
    const idCartao = req.body.cartao;

    if (produtosSelecionados.length > 0 && idCartao > 0) {
        console.log(parseInt(idCartao));
        console.log(produtosSelecionados);

        let result = await addCompras(idCartao, produtosSelecionados);

        if (result === 1) {
            res.json({ success: true, message: 'Compra realizada com sucesso!' });
        } else if (result === 0) {
            res.json({ success: false, message: 'Erro na compra. Cartão Inválido.' });
        }
    } else {
        res.json({ success: false, message: 'Erro na compra. Nenhum produto selecionado.' });
    }
});

app.get('/produtos-nao-utilizados/:idCartao', async (req, res) => {
    const idCartao = req.params.idCartao;

    if (idCartao) {
        try {
            const produtosNaoUtilizados = await obterProdutosNaoUtilizados(idCartao);
            res.json({ success: true, produtosNaoUtilizados });
        } catch (error) {
            res.json({ success: false, message: 'Erro ao obter produtos não utilizados.' });
        }
    } else {
        res.json({ success: false, message: 'ID do cartão não fornecido.' });
    }
});

app.post('/marcar-como-usados', async (req, res) => {
    const idCartao = req.body.idCartao;
    const produtos = req.body.produtos;

    try {
        // Chama a função para marcar os produtos como usados
        await marcarProdutosComoUsados(idCartao, produtos);

        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: 'Erro ao marcar produtos como usados.' });
    }
});

// Rota para criar recompensas
app.post('/criar-recompensa', async (req, res) => {
    const idCartao = req.body.idCartao;
    const idRecompensa = req.body.idRecompensa;

    try {
        await criarRecompensa(idCartao, idRecompensa);

        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: 'Erro ao criar recompensa.' });
    }
});

// Rota para usar uma recompensa
app.post('/usar-recompensa', async (req, res) => {
    const idCartao = req.body.idCartao;
    const nomeRecompensa = req.body.nomeRecompensa;

    try {
        // Chama a função de usar a recompensa do app.js
        const result = await usarRecompensa(idCartao, nomeRecompensa);

        if (result.success) {
            res.json({ success: true, message: 'Recompensa utilizada com sucesso.' });
        } else {
            res.json({ success: false, message: 'Erro ao utilizar a recompensa.' });
        }
    } catch (error) {
        console.error('Erro ao usar a recompensa:', error);
        res.json({ success: false, message: 'Erro ao utilizar a recompensa.' });
    }
});

// Rota para verificar recompensa
app.get('/verificar-recompensa/:idCartao', async (req, res) => {
    const idCartao = req.params.idCartao;

    try {
        const result = await verificarRecompensa(idCartao);

        res.json({ success: true, temRecompensa: result });
    } catch (error) {
        res.json({ success: false, message: 'Erro ao verificar recompensa.' });
    }
});

app.get('/recompensas-nao-usadas/:idCartao', async (req, res) => {
    const idCartao = req.params.idCartao;

    try {
        const recompensas = await obterRecompensasNaoUsadas(idCartao);
        res.json({ recompensas });
    } catch (error) {
        res.json({ success: false, message: 'Erro ao obter recompensas não utilizadas.' });
    }
});


// Rota para obter informações por cartão para relatório
app.get('/obter-informacoes-relatorio/:idCartao', async (req, res) => {
    const idCartao = req.params.idCartao;

    if (idCartao) {
        try {
            const informacoes = await obterInformacoesPorCartao(idCartao);
            res.json({ success: true, informacoes });
        } catch (error) {
            res.json({ success: false, message: 'Erro ao obter informações do relatório.' });
        }
    } else {
        res.json({ success: false, message: 'ID do cartão não fornecido.' });
    }
});

// Rota para obter informações sobre recompensas utilizadas
app.get('/informacoes-recompensas', async (req, res) => {
    try {
        const informacoesRecompensas = await obterInformacoesRecompensasUtilizadas();
        res.json({ success: true, informacoesRecompensas });
    } catch (error) {
        res.json({ success: false, message: 'Erro ao obter informações de recompensas utilizadas.' });
    }
});

// Rota para obter informações sobre produtos vendidos
app.get('/informacoes-produtos', async (req, res) => {
    try {
        const informacoesProdutos = await obterInformacoesProdutosVendidos();
        res.json({ success: true, informacoesProdutos });
    } catch (error) {
        res.json({ success: false, message: 'Erro ao obter informações de produtos vendidos.' });
    }
});

// Inicia o servidor na porta do HEROKU ou 3000
app.listen(port, function () {
    console.log('Servidor Rodando!');
});