function BD ()
{
	process.env.ORA_SDTZ = 'UTC-3';
	
	this.getConexao = async function ()
	{
		if (global.conexao)
			return global.conexao;

        const oracledb = require('oracledb');
        const dbConfig = require('./dbconfig.js');
        
        try
        {

			// global.conexao = await oracledb.getConnection(dbConfig);
		    global.conexao = await oracledb.getConnection({
				  user          : "SYS",
				  password      : "admin",
				  connectString : "localhost/xe",
				  privilege		: 2 // 2 -> SYSDBA
			});
			console.log ('Conexão realizada com sucesso');
		}
		catch (erro)
		{	
			console.log(erro);
			console.log ('A conexão com o banco de dados não foi possível. ');
			
			process.exit(1);
		}

		return global.conexao;
	}

	this.estrutureSe = async function ()
	{
		try
		{
			const conexao = await this.getConexao();
			const sql     = 'CREATE TABLE BILHETE (CODIGO INTEGER PRIMARY KEY, '+
			                'DATAGERADO DATE NOT NULL);';
					
			await conexao.execute(sql);
		}
		catch (erro)
		{
			//caso ja tenha sido gerado, faça nada
		} 
	}
}

function Bilhetes (bd)
{
	this.bd = bd;
	
	this.inclua = async function (bilhete)
	{
		const conexao = await this.bd.getConexao();
		
		const sql1 = "INSERT INTO BILHETE (CODIGO, DATAGERADO) VALUES (:0,current_date)";
		const dados = [bilhete.codigo];

		console.log(sql1, dados);

		await conexao.execute(sql1,dados);
		
		const sql2 = 'COMMIT';
		await conexao.execute(sql2);	

		const sql = "SELECT CODIGO,TO_CHAR(DATAGERADO, 'YYYY-MM-DD HH24:MI:SS') "+
		            "FROM BILHETE WHERE CODIGO=:0";
		const dadosb = [bilhete.codigo];

		ret =  await conexao.execute(sql,dadosb);

		
		console.log (ret.rows);
		
		return ret.rows;
	}	

	this.pesquisa = async function(cod)
	{
		const conexao2 = await this.bd.getConexao();

		const sql3 = "SELECT CODIGO "+
		            "FROM BILHETE WHERE CODIGO=:0";
		const dadosb = [cod];

		ret =  await conexao2.execute(sql3,dadosb);

		console.log (ret.rows);
		try
		{
			console.log	(ret.rows[0][0]);
			return ret.rows[0][0];
		}
		catch(erro){
			const retornaerro = ""
			return retornaerro;
		}

	}
	
	this.recarga = async function(cod)
	{
		const conexao = await this.bd.getConexao();
		
		const sql4 = "INSERT INTO RECARGA (CODIGO_BILHETE, DATA_RECARGA, RESTANTE) VALUES (:0,current_timestamp,1)";
		const dados4 = [cod];

		console.log(sql4, dados4);

		await conexao.execute(sql4,dados4);
		
		const sql5 = 'COMMIT';
		await conexao.execute(sql5);	

		const sql = "SELECT CODIGO_BILHETE, TIPO, TO_CHAR(DATA_RECARGA, 'YYYY-MM-DD HH24:MI:SS') "+
		            "FROM RECARGA WHERE CODIGO_BILHETE=:0";
		const dadosb = [cod];

		ret =  await conexao.execute(sql,dadosb);

		
		console.log (ret.rows);
		
		return ret.rows;
	}

	this.recarrega = async function(tipo)
	{
		const conexao_recarrega = await this.bd.getConexao();

		const sql10 = "SELECT data_recarga "+
		            "FROM RECARGA ORDER BY DATA_RECARGA DESC";

		ret =  await conexao_recarrega.execute(sql10);

		console.log	(ret.rows[0][0]);
		const data_rec =  ret.rows[0][0];
		
		const sql11 = "UPDATE RECARGA SET TIPO = :0 WHERE DATA_RECARGA = :1";
		const dados11 = [tipo, data_rec];

		console.log(sql11, dados11);

		ret2 = await conexao.execute(sql11,dados11);
		
		const sql12 = 'COMMIT';
		await conexao_recarrega.execute(sql12);

		return ret.rows;


	}

	this.utiliza = async function(cod){
		const conexao_recarrega = await this.bd.getConexao();

		// const sql10 = "SELECT TIPO "+
		//             "FROM RECARGA WHERE CODIGO_BILHETE = :0 and TIPO IS NOT NULL";
		// const dados10 = [cod];

		// ret =  await conexao_recarrega.execute(sql10,dados10);
		// console.log(ret.rows[0][0]);
		// if (ret.rows[0][0] !== ''){
	


			
		// 	const sql11 = "UPDATE RECARGA SET TIPO = TIPO-1 WHERE CODIGO_BILHETE = :0 AND TIPO > 0";
		// 	const dados11 = [cod];

		// 	console.log(sql11, dados11);

		// 	ret2 = await conexao.execute(sql11,dados11);
			
		// 	const sql12 = 'COMMIT';
		// 	await conexao_recarrega.execute(sql12);
			
		// 	return ret2.rows;
		// }
		// return ret.rows;
		



		const sql15 = "UPDATE RECARGA SET RESTANTE = 0 WHERE TIPO- (CURRENT_DATE - CAST(DATA_RECARGA AS DATE)) <= 0 ";
		// " UPDATE RECARGA SET RESTANTE = 1 WHERE ROUND(TIPO- (CURRENT_DATE - CAST(DATA_RECARGA AS DATE))) > 0 and codigo_bilhete = :0 ";
		// const dados = [cod];

		// console.log(sql15);

		ret4 = await conexao.execute(sql15);
		const sql16 = 'COMMIT';
		await conexao_recarrega.execute(sql16);



		const sql10 = "SELECT coalesce(sum(TIPO- (CURRENT_DATE - CAST(DATA_RECARGA AS DATE))),0) FROM RECARGA " +
		"WHERE CODIGO_BILHETE = :0 "; //and restante = 1 ";

		const dados10 = [cod];

		ret =  await conexao_recarrega.execute(sql10,dados10);
		console.log(ret.rows[0][0]);
		if (ret.rows[0][0] > 0 ){

			const sql_util = "INSERT INTO UTILIZACAO(CODIGO_BILHETE, DATA_UTILIZACAO) VALUES (:0,current_timestamp) ";
			const dados_util = [cod];

			console.log(sql_util, dados_util);

			ret3 = await conexao.execute(sql_util,dados_util);
			
			const sql_util1 = 'COMMIT';
			await conexao_recarrega.execute(sql_util1);

			return ("1");
		}
		else{
			return ("2");
		}


	}

	this.relatorio_uso = async function(cod){
		const conexao = await this.bd.getConexao();

		const sql = "SELECT TO_CHAR(a.datagerado,'DD/MM/YYYY HH24:MI:SS'), TO_CHAR(b.data_recarga,'DD/MM/YYYY HH24:MI:SS'), "+ 
					"coalesce((SELECT sum((R.TIPO- (CURRENT_DATE - CAST(R.DATA_RECARGA AS DATE)))) FROM RECARGA R WHERE R.CODIGO_BILHETE = :0 and restante = 1 ),0 )as RESTANTE, "+
					"TO_CHAR(c.data_utilizacao,'DD/MM/YYYY HH24:MI:SS')  "+  //tipo é o restante
		            "FROM BILHETE A LEFT JOIN RECARGA B ON A.codigo = B.CODIGO_BILHETE "+    
					"LEFT JOIN UTILIZACAO C on A.CODIGO = C.CODIGO_BILHETE WHERE A.codigo = :0 "+
					"ORDER BY a.datagerado, b.DATA_RECARGA, c.data_utilizacao desc";

		dados = [cod];
		ret =  await conexao.execute(sql,dados);
		console.log(ret.rows); //12 RECARGA

		if (ret.rows[0][0] !== ""){
			return ret.rows;

		}else{

			return ("Não encontrado bilhete!");
		}

	}

}

function Bilhete (codigo,datagerado)
{
	    this.codigo = codigo;
	    this.datagerado  = datagerado;
}


function Relatorio(data_geracao, restante, data_utilizacao, data_recarga){
	this.data = data;
	this.restante = restante;
	this.data_utilizacao = data_utilizacao;
	this.data_recarga = data_recarga;

}

function Comunicado (codigo,mensagem)
{
	this.codigo    = codigo;
	this.mensagem  = mensagem;
}

function middleWareGlobal (req, res, next)
{
    console.time('Requisição'); // marca o início da requisição
    console.log('Método: '+req.method+'; URL: '+req.url); // retorna qual o método e url foi chamada

    next(); // função que chama as próximas ações

    console.log('Finalizou'); // será chamado após a requisição ser concluída

    console.timeEnd('Requisição'); // marca o fim da requisição
}


// CREATE
async function inclusao (req, res)
{
	const codigo = Math.floor(100000 + Math.random() * 900000); 
	console.log(codigo);
    const bilhete = new Bilhete (codigo);

    try
    {
       	const resposta =  await  global.bilhetes.inclua(bilhete);
        const  sucesso = new Comunicado (
						"Número bilhete: " + bilhete.codigo,
		                "Bilhete gerado com sucesso!");
        return res.status(201).json(sucesso);
	}
	catch (erro)
	{
		console.log(erro);
		const  erro2 = new Comunicado (erro,'Código informado já contém bilhete existente');
        return res.status(409).json(erro2);
    }
}


async function guardarecarga(req,res){
	const codigo = req.params.codigo;
	global.codigo = codigo;

	const retorno = await global.bilhetes.pesquisa(codigo);
	if (retorno !== ''){
		try{
			const inclui = await global.bilhetes.recarga(codigo);
		}
		catch(erro){
			console.log(erro)
		}
		return res.status(201).json(retorno);
	}
	else{
		return res.status(201).json("2"); //2 significa que não passou
	}
}

async function recarregaBilhete(req,res){
	const tipo = req.params.tipo;
	global.tipo = tipo;
	try{
		const retorno = await global.bilhetes.recarrega(tipo);
		return res.status(201).json(retorno);
	}
	catch(erro){
		console.log(erro);

	}
}


async function relatoriobilhete(req,res){  //AQUI
	const codigo = req.params.codigo;
	try{
		const resposta = await global.bilhetes.relatorio_uso(codigo);
		
		return res.status(201).json(resposta);
	}
	catch(erro){
		console.log(erro);

	}
}


async function utilizarbilhete(req,res){
	const codigo = req.params.codigo;
	console.log("Passou aqui!");
	try{
		const retorno = await global.bilhetes.utiliza(codigo);
		return res.status(201).json(retorno);
	}
	catch(erro){
		console.log(erro);
		return res.status(409).json('Digite um bilhete válido!')
	}


}


async function ativacaoDoServidor ()
{
    const bd = new BD ();
	await bd.estrutureSe();
    global.bilhetes = new Bilhetes (bd);

    const express = require('express');
    const app     = express();
	const cors    = require('cors')
    
    app.use(express.json());   // faz com que o express consiga processar JSON
	app.use(cors()) //habilitando cors na nossa aplicacao (adicionar essa lib como um middleware da nossa API - todas as requisições passarão antes por essa biblioteca).
    app.use(middleWareGlobal); // app.use cria o middleware global

    app.post  ('/bilhete', inclusao); 
	app.get ('/recarga/:tipo', recarregaBilhete); 
	app.get ('/pesquisa/:codigo', guardarecarga); 
	app.get ('/utilizar/:codigo', utilizarbilhete); 
	app.get ('/Relatorio/:codigo', relatoriobilhete); 
	// app.get   ('/bilhetes/:codigo', recuperacaoDeUm);
    console.log ('Servidor ativo na porta 3000...');
    app.listen(3000);
}


ativacaoDoServidor();
