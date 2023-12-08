// Importa as bibliotecas necessárias do Sequelize
const Sequelize = require("sequelize");
const {QueryTypes} = require("sequelize");

// Cria uma instância do Sequelize para se conectar ao banco de dados MySQL
const db = new Sequelize("heroku_44f6983cc34c2f8", "b6340d84628fe2", "993dd2ea", {
    host: "us-cdbr-east-06.cleardb.net",
    dialect: "mysql",
    logging: false
});

// Autentica a conexão com o banco de dados e trata erros
db.authenticate()
    .then(() => {
        console.log("Conectado!");
    })
    .catch((erro) => {
        console.log(erro);
    });

// Define modelos de dados usando Sequelize para as tabelas do banco
const Cartoes = db.define('cartoes', {
    idCartao: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: false
    }
}, {
    updatedAt: false
});

const Produtos = db.define('produtos', {
    idProdutos: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nomeProduto: {
        type: Sequelize.STRING(255),
    },
}, {
    timestamps: false
});

const Compras = db.define('compras', {
    idCompra: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    idCartao: {
        type: Sequelize.INTEGER,
    },
}, {
    timestamps: false
});

const conteudoCompra = db.define('conteudoCompra', {
    idCompra: {
        type: Sequelize.INTEGER,
    },
    idProduto: {
        type: Sequelize.INTEGER,
    },
    usou: {
        type: Sequelize.BOOLEAN,
    },
}, {
    createdAt: false
});

const Recompensas = db.define('Recompensas', {
    idRecompensa: {
        type: Sequelize.INTEGER,
        primaryKey: true,
    },
    nomeRecompensa: {
        type: Sequelize.STRING(45),
        allowNull: false,
    },
}, {
    timestamps: false
});

const TemRecompensa = db.define('TemRecompensa', {
    usou: {
        type: Sequelize.BOOLEAN,
        defaultValue: null,
    },
}, {
    timestamps: false
});

// Define relacionamentos entre os modelos
Compras.belongsTo(Cartoes, { foreignKey: 'idCartao' });
conteudoCompra.belongsTo(Compras, { foreignKey: 'idCompra' });
conteudoCompra.belongsTo(Produtos, { foreignKey: 'idProduto' });
TemRecompensa.belongsTo(Cartoes, { foreignKey: 'idCartao' });
TemRecompensa.belongsTo(Recompensas, { foreignKey: 'idRecompensa' });

// Sincroniza os modelos com o banco de dados - CREATE IF NOT EXISTS
Cartoes.sync();
Produtos.sync();
Compras.sync();
conteudoCompra.sync();
TemRecompensa.sync();
Recompensas.sync();

// Gera um número de seis dígitos aleatório
function gerarNumeroDeSeisDigitos() {
    // Gera um número aleatório entre 100000 e 999999
    return Math.floor(Math.random() * 900000) + 100000;
}

// Verifica se um código existe no banco de dados
async function verificarCodigo(codigo) {
    try {
        const { count, rows } = await Cartoes.findAndCountAll({
            where: {
                idCartao: codigo
            }
        });
        return count; // retorna 0 ou 1
    } catch (error) {
        console.error('Erro ao verificar o código:', error);
        throw error;
    }
}

// Adiciona um novo cartão ao banco de dados
async function addNoBanco() {
    while (true) {
        const codigo = gerarNumeroDeSeisDigitos();

        if (await verificarCodigo(codigo) === 0) {
            console.log("O código não existe, adicionando no banco", codigo);
            await Cartoes.create({ idCartao: codigo });
            return parseInt(codigo, 10);
        } else {
            console.log("O código existe, não adicionando no banco");
        }
    }
}

// Obtém o ID da compra mais recente
async function getIdCompraMaisRecente() {
    try {
        const compraMaisRecente = await Compras.findOne({
            order: [['idCompra', 'DESC']],
        });

        if (compraMaisRecente) {
            return compraMaisRecente.idCompra;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Erro ao obter idCompra mais recente:', error);
        throw error;
    }
}

// Obtém o ID de um produto pelo nome
async function getIdProdutoPorNome(nomeProduto) {
    try {
        const produto = await Produtos.findOne({
            where: {
                nomeProduto: nomeProduto,
            },
        });

        if (produto) {
            return produto.idProdutos;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Erro ao obter idProduto por nomeProduto:', error);
        throw error;
    }
}

// Adiciona compras com base no cartão e na lista de itens
async function addCompras(card, itens) {
    if (await verificarCodigo(card) === 1) {
        console.log("Esse cartão existe");
        await Compras.create({ idCartao: card });
        const idCompra = await getIdCompraMaisRecente();
        for (let i = 0; i < itens.length; i++) {
            const idProduto = await getIdProdutoPorNome(itens[i]);
            await conteudoCompra.create({ idCompra: idCompra, idProduto: idProduto, usou: false });
            console.log("added", itens[i], idProduto);
        }
        console.log(idCompra);
        return 1;
    } else {
        console.log("O código não existe");
        return 0;
    }
}

// Nova função para obter todas as compras de um cartão
async function obterProdutosNaoUtilizados(idCartao) {
    try {
        // Verifica se o idCartao existe
        const codigoExiste = await verificarCodigo(idCartao);

        if (codigoExiste === 0) {
            throw new Error('ID do cartão não encontrado.');
        }

        // Executa a consulta apenas se o idCartao existir
        return await db.query(
            "SELECT c.idCompra, p.nomeProduto AS nomeDoProduto, c.usou, co.idCartao as Cartao\n" +
            "FROM conteudocompras c\n" +
            "INNER JOIN produtos p ON c.idProduto = p.idProdutos\n" +
            "INNER JOIN compras co ON c.idCompra = co.idCompra\n" +
            "WHERE co.idCartao = ? AND c.usou = 0\n" +
            "ORDER BY c.idCompra;",
            {
                replacements: [idCartao],
                type: QueryTypes.SELECT
            }
        );
    } catch (error) {
        console.error('Erro ao obter produtos não utilizados:', error);
        throw error;
    }
}


// Nova função para obter todas as compras de um cartão
async function obterComprasPorCartao(idCartao) {
    try {
        const compras = await Compras.findAll({
            where: {
                idCartao: idCartao,
            },
        });

        return compras;
    } catch (error) {
        console.error('Erro ao obter compras por cartão:', error);
        throw error;
    }
}

// Nova função para marcar produtos como usados
async function marcarProdutosComoUsados(idCartao, produtos) {
    try {
        const idProdutos = [];

        // Obtém os IDs dos produtos pelos nomes
        for (const produtoNome of produtos) {
            const idProduto = await getIdProdutoPorNome(produtoNome);
            if (idProduto) {
                idProdutos.push(idProduto);
            }
        }

        // Obtém todas as compras do cartão
        const compras = await obterComprasPorCartao(idCartao);

        // Atualiza a tabela conteudoCompra marcando os produtos como usados
        for (const compra of compras) {
            await conteudoCompra.update(
                { usou: true },
                {
                    where: {
                        idProduto: idProdutos,
                        idCompra: compra.idCompra,
                    },
                }
            );
        }

        return true;
    } catch (error) {
        console.error('Erro ao marcar produtos como usados:', error);
        throw error;
    }
}


// Nova função para criar uma recompensa
async function criarRecompensa(idCartao, idRecompensa) {
    try {
        await TemRecompensa.create({ idCartao: idCartao, idRecompensa: idRecompensa, usou: 0 });
    } catch (error) {
        console.error('Erro ao criar recompensa:', error);
        throw error;
    }
}

// Nova função para verificar recompensas disponíveis para um cartão
async function verificarRecompensa(idCartao) {
    try {
        const temRecompensa = await TemRecompensa.findOne({
            where: {
                idCartao: idCartao,
                usou: 0
            },
        });

        return temRecompensa ? 1 : 0;
    } catch (error) {
        console.error('Erro ao verificar recompensa:', error);
        throw error;
    }
}

// Função para obter recompensas não usadas por um cartão
async function obterRecompensasNaoUsadas(idCartao) {
    try {
        const recompensas = await TemRecompensa.findAll({
            where: {
                idCartao: idCartao,
                usou: 0,
            },
            include: [
                {
                    model: Recompensas,
                    attributes: ['nomeRecompensa'],
                },
            ],
        });

        return recompensas.map(recompensa => recompensa.Recompensa.nomeRecompensa);
    } catch (error) {
        console.error('Erro ao obter recompensas não utilizadas:', error);
        throw error;
    }
}

// Função para usar a recompensa
async function usarRecompensa(idCartao, nomeRecompensa) {
    try {
        // Verifica se o idCartao existe
        const codigoExiste = await verificarCodigo(idCartao);

        if (codigoExiste === 0) {
            return { success: false, message: 'ID do cartão não encontrado.' };
        }

        // Obtém o idRecompensa pelo nome
        const recompensa = await Recompensas.findOne({
            where: {
                nomeRecompensa: nomeRecompensa,
            },
        });

        if (recompensa) {
            // Atualiza a recompensa para usada (usou = 1)
            await TemRecompensa.update({ usou: 1 }, {
                where: {
                    idCartao: idCartao,
                    idRecompensa: recompensa.idRecompensa,
                },
            });

            return { success: true, message: 'Recompensa utilizada com sucesso.' };
        } else {
            return { success: false, message: 'Recompensa não encontrada.' };
        }
    } catch (error) {
        console.error('Erro ao usar a recompensa:', error);
        return { success: false, message: 'Erro ao utilizar a recompensa.' };
    }
}

// Função para obter informações sobre um cartão, incluindo recompensas e serviços
async function obterInformacoesPorCartao(idCartao) {
    try {
        // Verifica se o idCartao existe
        const codigoExiste = await verificarCodigo(idCartao);

        if (codigoExiste === 0) {
            throw new Error('ID do cartão não encontrado.');
        }

        // Consulta para obter informações sobre recompensas
        const informacoesRecompensas = await db.query(`
            SELECT r.nomeRecompensa, COUNT(tr.idRecompensa) AS quantidade
            FROM Recompensas r
            LEFT JOIN TemRecompensas tr ON r.idRecompensa = tr.idRecompensa
            WHERE tr.idCartao = :idCartao
            GROUP BY r.idRecompensa, tr.usou;
        `, {
            replacements: { idCartao },
            type: QueryTypes.SELECT,
        });

        // Consulta para obter informações sobre serviços
        const informacoesServicos = await db.query(`
            SELECT p.nomeProduto AS nomeServico, COUNT(cc.idProduto) AS quantidade, MAX(cc.updatedAt) AS ultimaUtilizacao
            FROM Produtos p
            LEFT JOIN conteudocompras cc ON p.idProdutos = cc.idProduto
            LEFT JOIN Compras co ON cc.idCompra = co.idCompra
            WHERE co.idCartao = :idCartao
            GROUP BY p.idProdutos, cc.usou;
        `, {
            replacements: { idCartao },
            type: QueryTypes.SELECT,
        });

        return { informacoesRecompensas, informacoesServicos };
    } catch (error) {
        console.error('Erro ao obter informações por cartão:', error);
        throw error;
    }
}

// Função para obter informações sobre produtos vendidos
async function obterInformacoesProdutosVendidos() {
    try {
        const produtosVendidos = await db.query(`
            SELECT p.nomeProduto, COUNT(cc.idProduto) AS quantidadeTotal,
                SUM(CASE WHEN cc.usou = 1 THEN 1 ELSE 0 END) AS quantidadeUsada
            FROM Produtos p
            LEFT JOIN conteudocompras cc ON p.idProdutos = cc.idProduto
            GROUP BY p.idProdutos;
        `, {
            type: QueryTypes.SELECT,
        });

        return produtosVendidos;
    } catch (error) {
        console.error('Erro ao obter informações de produtos vendidos:', error);
        throw error;
    }
}

// Função para obter informações sobre recompensas utilizadas
async function obterInformacoesRecompensasUtilizadas() {
    try {
        const recompensasUtilizadas = await db.query(`
            SELECT r.nomeRecompensa, COUNT(tr.idRecompensa) AS quantidadeTotal,
                SUM(tr.usou) AS quantidadeUsada
            FROM Recompensas r
            LEFT JOIN TemRecompensas tr ON r.idRecompensa = tr.idRecompensa
            GROUP BY r.idRecompensa;
        `, {
            type: QueryTypes.SELECT,
        });

        return recompensasUtilizadas;
    } catch (error) {
        console.error('Erro ao obter informações de recompensas utilizadas:', error);
        throw error;
    }
}

// Exporta as funções
module.exports = { addNoBanco, addCompras, obterProdutosNaoUtilizados, marcarProdutosComoUsados,
    criarRecompensa, usarRecompensa, verificarRecompensa, obterRecompensasNaoUsadas, obterInformacoesPorCartao,
    obterInformacoesRecompensasUtilizadas, obterInformacoesProdutosVendidos};