$(document).ready(function () {

    function limpa_formulário_cep() {
        // Limpa valores do formulário de cep.
        var rua = $("#rua").val('');
        var bairro = $("#bairro").val('');
        var cidade = $("#cidade").val('');
        var uf = $("#uf").val('');

        rua.removeAttr('readonly', 'readonly');
        bairro.removeAttr("readonly", "readonly");
        cidade.removeAttr("readonly", "readonly");
        uf.removeAttr("readonly", "readonly");
    }

    //Quando o campo cep perde o foco.
    $("#cep").blur(function () {

        //Nova variável "cep" somente com dígitos.
        var cep = $(this).val().replace(/\D/g, '');

        //Verifica se campo cep possui valor informado.
        if (cep != "") {

            //Expressão regular para validar o CEP.
            var validacep = /^[0-9]{8}$/;

            //Valida o formato do CEP.
            if (validacep.test(cep)) {

                //Preenche os campos com "..." enquanto consulta webservice.
                $("#rua").val("...");
                $("#bairro").val("...");
                $("#cidade").val("...");
                $("#uf").val("...");

                //Consulta o webservice viacep.com.br/
                $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function (dados) {

                    if (!("erro" in dados)) {
                        //Atualiza os campos com os valores da consulta.
                        var rua = $("#rua").val(dados.logradouro);
                        var bairro = $("#bairro").val(dados.bairro);
                        var cidade = $("#cidade").val(dados.localidade);
                        var uf = $("#uf").val(dados.uf);

                        rua.attr('readonly', 'readonly');
                        bairro.attr('readonly', 'readonly');
                        cidade.attr('readonly', 'readonly');
                        uf.attr('readonly', 'readonly');

                    } //end if.
                    else {
                        //CEP pesquisado não foi encontrado.
                        limpa_formulário_cep();
                        alert("CEP não encontrado.");
                    }
                });
            } //end if.
            else {
                //cep é inválido.
                limpa_formulário_cep();
                alert("Formato de CEP inválido.");
            }
        } //end if.
        else {
            //cep sem valor, limpa formulário.
            limpa_formulário_cep();
        }
    });
});

