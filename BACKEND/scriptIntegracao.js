

function gerarBilhete() {
   
    let objetobilhete = {
        codigo: undefined, 
        datagerado: ""
    }
    let url = `http://localhost:3000/bilhete`

    let res = axios.post(url, objetobilhete)
    .then(response => {
        if (response.data) {
            const msg = new Comunicado (response.data.codigo, 
                                        response.data.mensagem);
                                        document.getElementById("copia").innerHTML = "" + response.data.codigo + "<br>" + response.data.mensagem;
            // alert(msg.get());
        }
    })
    .catch(error  =>  {
        
        if (error.response) {
            const msg = new Comunicado (error.response.data.codigo, 
                                        error.response.data.mensagem, 
                                        error.response.data.descricao);
            alert(msg.get());
            console.log(error)
        }
    })
};

function guardaBilhete(){ // Verifica se o bilhete é válido para fazer a recarga

	let codigo = document.getElementById("numbilhete").value;
   
    if(codigo !== ''){
        let url = `http://localhost:3000/Pesquisa/${codigo}`

        axios.get(url)
        .then(response => {
            if(response.data !== "2") { //2 SIGNIGICA QUE NÃO EXISTE BILHETE
                window.location.href="../FRONTEND/pagCompras.html";
            }
            else{
                document.getElementById("help").innerHTML = "Insira um cartão cadastrado.";
            }
        
        })
        .catch(error  =>  {
            if (error.response) {
                const msg = new Comunicado (error.response.data.codigo, 
                                            error.response.data.mensagem, 
                                            error.response.data.descricao);
                alert(msg.get());
                console.log(error)
            }	
        })

        event.preventDefault()

        
    }
    else{
        document.getElementById("help").innerHTML = "Insira seu bilhete abaixo.";
    }
  
};

function RecargaBilhete(tipo){
    let url2 = `http://localhost:3000/recarga/${tipo}`;

    try{
        axios.get(url2)
        .then(response => {
            // alert(response.data);

        })
        .catch(error  =>  {
            
            if (error.response) {
                const msg = new Comunicado (error.response.data.codigo, 
                                            error.response.data.mensagem, 
                                            error.response.data.descricao);
                // alert(msg.get());
                console.log(error);  
            }
        })
    }
    catch(erro){
        alert(erro);
    }

    document.getElementById("compra-msg").innerHTML = "Bilhete adicionado ao carrinho com sucesso.";
};


function Utilizar(){
    let codigo = document.getElementById("numero-cartao").value;
    if(codigo !== ''){
        let url = `http://localhost:3000/Utilizar/${codigo}`

        axios.get(url)
        .then(response => {
            if (response.data[0][0] == '1'){
                Relatorio();
                document.getElementById("status-bilhete").innerHTML = "Você utilizou seu bilhete.";
            }else{
                document.getElementById("status-bilhete").innerHTML = "Bilhete não possui recarga";
                document.getElementById("info-bilhete").innerHTML = " ";

            }
        })
        .catch(error  =>  {
            if (error.response) {
                document.getElementById("status-bilhete").innerHTML = "Digite um bilhete válido";
                console.log(error)
            }	
        })

        event.preventDefault()

        
    }
    else{
        document.getElementById("status-bilhete").innerHTML = "Insira seu bilhete acima.";
    }

}

function Relatorio(){

 
    let codigo = document.getElementById("numero-cartao").value;
    if(codigo !== ''){
        let url = `http://localhost:3000/Relatorio/${codigo}`
        try{
        axios.get(url)
        .then(response => {
                if (response.data[0][2] < 1){
                    var resposta = response.data[0][2] * 1440;
                    var tempo = " minutos";
               
                }
                else{
                    var resposta = response.data[0][2];
                    var tempo = " dias";
                }
                document.getElementById("info-bilhete").innerHTML = "<strong> DATA GERADA </strong>" + response.data[0][0] + "<br><strong>DATA RECARGA </strong>" + response.data[0][1]  + 
                " <br><strong>DATA DE UTILIZAÇÃO </strong>" + response.data[0][3] + " <br><strong>RESTANTE </strong>" + parseFloat(resposta.toFixed(2)) + tempo;
            })
        .catch(error  =>  {
            if (error.response) {
                alert('Digite um bilhete válido');
                console.log(error)
            }	
        })

        event.preventDefault()
    }
    catch(erro){
        alert(erro);
    }
        
    }
    else{
        alert("Digite o seu bilhete!");
    }

}


function Comunicado (codigo,mensagem)
{
	this.codigo    = codigo;
	this.mensagem  = mensagem;
	
	this.get = function ()
	{
		return (this.codigo   + " \n " + 
		        this.mensagem);

	}
}

 
    