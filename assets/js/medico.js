// Verificar Usuario
statusUser();


var idDocumento;

var db = firebase.firestore();
addTableConsulta(db);

$("#btn-cadastroConsulta").click(function (e) {
    e.preventDefault();
    var dados = $("#formMedico").serializeArray();

    try{

        var dados = {};
        //Get all input dinamic
        $.each($("#formMedico input"), function(i, item) {
          dados[item.name] = item.value;
        });
        dados['Ativo'] = true;
    
        validarDados(dados); 
        
    // Add a new document with a generated id.
    db.collection("medico")
      .add(dados)
      .then(function(docRef) {
        swal("Bom trabalho!", "Paciente cadastrado com sucesso", "success");
        document.getElementById("formMedico").reset();
        $("#cadastroPaciente").modal("hide");
        $("#alert-erro").html("");
      })
      .catch(function(error) {
        swal(
          "Erro ao cadastrar!",
          "Entre em contato com o administrador do sistema" + error,
          "error"
        );
      });
    } catch (e) {
        $('#alert-erro').html('<div class="alert alert-danger" role="alert">'+ e +'</div >');
    }
});

$("#btn-cancelar").click(function() {
    document.getElementById("formPaciente").reset();
    $("#alert-erro").html('');
});

// Cancelar Consulta
$(document).on("click", ".btnDelete", function() {
  var doc = $(this).data("id");

  swal({
    title: "Você deseja continuar?",
    text: "Uma vez Deletado, você não poderá voltar atrás.",
    icon: "warning",
    buttons: true,
    dangerMode: true
  }).then(willDelete => {
    if (willDelete) {
      cancelarConsulta(db, doc);
    }
  });
});

// Editar Item
$(document).on("click", ".btnEdit", function () {
    var doc = $(this).data("id");
    idDocumento = doc;
    var docRef = db.collection("medico").doc(doc);
    docRef.get().then(function (doc, i) {
        if (doc.exists) {

            $.each(doc.data(), function (index, value) {

                $('#formEdit input[name="' + index + '"]').val(value);
            });
        } else {
            console.log("No such document!");
        }
    }).catch(function (error) {
        console.log("Error getting document:", error);
    });
});
$(document).on("click", "#btnSalvarEdicao", function (e) {
    e.preventDefault();
    var doc = idDocumento;
    var dado = {};

    $.each($("#formEdit input"), function(i, item) {
      dado[item.name] = item.value;
    });

    try {
        validarDados(dado);
        AlterarItem(db, "medico", doc, dado);
        $('#alert-erroEdit').html('');
    } catch (e) {
        $('#alert-erroEdit').html('<div class="alert alert-danger" role="alert">' + e + '</div >');
    }
})
function addTableConsulta(db) {
    db.collection("medico")
    .where('Ativo', '==' , true)
      .orderBy("Nome")
      .limit(25)
      .onSnapshot(function(querySnapshot) {
        $("#tbody").html("");
        querySnapshot.forEach(function(doc) {
          $("#tbody").append("<tr>");
          $("#tbody").append("<td>" + doc.data().Nome + "</td>");
          $("#tbody").append("<td>" + doc.data().Crm + "</td>");
          $("#tbody").append("<td>" + doc.data().Celular + "</td>");
          $("#tbody").append("<td>" + doc.data().Email + "</td>");
          $("#tbody").append(
            '<td><button data-toggle="modal" data-id="' +
              doc.id +
              '" data-target="#modelEditar" class="btnEdit btn btn-primary btn-sm" type="button">Editar</button> <button data-id="' +
              doc.id +
              '" class="btnDelete btn btn-danger btn-sm" type="button">Delete</button></td>'
          );
          $("#tbody").append("</tr>");
          
        });
      });
}

function validarDados(d){

    if (d.Nome == "") {
        throw new Error('Campo Nome não foi preenchido');
    }else if(d.Sobrenome == ''){
        throw new Error("Campo Sobrenome não foi preenchido");
    } else if (d.Sexo == '') {
        throw new Error("Campo Sexo não foi preenchido");
    } else if (d.DataNascimento == '') {
        throw new Error("Campo Data Nascimento não foi preenchido");
    } else if (d.CPF == '') {
        throw new Error("Campo CPF não foi preenchido");
    } else if (d.Celular == '') {
        throw new Error("Campo Celular não foi preenchido");
    } else if (d.Email == '') {
        throw new Error("Campo Email não foi preenchido");
    } else if (d.Rua == '') {
        throw new Error("Campo Rua não foi preenchido");
    }



}

function visualizarItem(doc){
    var docRef = db.collection("medico").doc(doc);
    docRef.get().then(function (doc) {
        if (doc.exists) {
            console.log("Document data:", doc.data());
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function (error) {
        console.log("Error getting document:", error);
    });
}

function cancelarConsulta(db, doc) {
    try {
        var docRef = db.collection("medico").doc(doc);

        return db.runTransaction(function (transaction) {
            // This code may get re-run multiple times if there are conflicts.
            return transaction.get(docRef).then(function (sfDoc) {
                if (!sfDoc.exists) {
                    throw "Document does not exist!";
                }
                transaction.update(docRef, {
                    Ativo: false
                });
            });
        }).then(function () {
            swal("Bom Trabalho", "Médico Desativado!", "success");
        }).catch(function (error) {
            swal("Falha", error, "error");
        });

    } catch (e) {
        console.log(e);
    }
}
function AlterarItem(db, collection, idDoc, dados) {
    try {
        var docRef = db.collection(collection).doc(idDoc);
        return db
            .runTransaction(function (transaction) {
                // This code may get re-run multiple times if there are conflicts.
                return transaction.get(docRef).then(function (sfDoc) {
                    if (!sfDoc.exists) {
                        throw "Document does not exist!";
                    }
                    transaction.update(docRef, dados);
                });
            })
            .then(function () {
                $("#modelEditar").modal('hide');
                swal("Bom Trabalho", collection + " Alterado com sucesso!", "success");
            })
            .catch(function (error) {
                swal("Falha", error, "error");
            });
    } catch (e) {
        console.log(e);
    }
}