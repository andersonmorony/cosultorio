$(document).ready(function() {
  var consultas;
  var db = firebase.firestore();
  statusUser();
  addTableConsulta(db, 0);
  atualizarPainel(db);
  carregarCampos(db);

  $(".datepicker").pickadate({
    weekdaysShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"],
    showMonthsShort: true,
    min: new Date(),
    formatSubmit: "yyyy-mm-dd",
    format: "dd/mm/yyyy",
    today: "Hoje",
    clear: "Limpar",
    close: "Cancelar",
    onOpen: function() {
      $(".picker--time").remove();
    },
    onSet: function(context) {
      var data = $("input[name=Data_submit]").val();

      $(".divTime").html(
        '<input type="text" class="form-control time" readonly placeholder="time" id="Hora" name="Hora" required>'
      );
      if (data != "") {
        carregarTimeDisponivel(db, data);
      }
    }
  });

  // Cadastro consulta
  $("#btn-cadastroConsulta").click(function(e) {
    e.preventDefault();
    var consulta = {};

    $.each($("#formConsulta input"), function(i, item) {
      consulta[item.name] = item.value;
    });
    $.each($("#formConsulta select"), function(i, item) {
      consulta[item.name] = item.value;
    });
    consulta.Data = consulta.Data_submit;
    delete consulta.Data_submit;
    consulta.Cancelado = false;

    try {
      validarDados(consulta);
      // Add a new document with a generated id.
      db.collection("consulta")
        .add(consulta)
        .then(function(docRef) {
          swal("Bom Trabalho", "Consulta cadastrada com sucesso!", "success");
          document.getElementById("formConsulta").reset();
          $("#cadastroConsulta").modal("hide");
          $("#alert-erro").html("");
        })
        .catch(function(error) {
          swal(
            "Erro ao cadastrar!",
            "Entre em contato com o administrador do sistema: " + error,
            "error"
          );
        });
    } catch (e) {
      $("#alert-erro").html(
        '<div class="alert alert-danger" role="alert">' + e + "</div >"
      );
    }
  });

  // Cancelar Consulta
  $(document).on("click", ".cancelarConsulta", function() {
    var doc = $(this).data("id");

    swal({
      title: "Você deseja continuar?",
      text: "Uma vez cancelado, você não poderá voltar atrás.",
      icon: "warning",
      buttons: true,
      dangerMode: true
    }).then(willDelete => {
      if (willDelete) {
        cancelarConsulta(db, doc);
      }
    });
  });

  // Get All Consulta
  function addTableConsulta(db, start) {
    var data = getDataAtual();
    db.collection("consulta")
      .where("Data", "==", data)
      .where("Cancelado", "==", false)
      .orderBy("Hora")
      .startAt(start)
      .limit(25)
      .onSnapshot(function(querySnapshot) {
        $("#tbody-consulta").html("");
        querySnapshot.forEach(function(doc) {
          $("#tbody-consulta").append("<tr>");
          $("#tbody-consulta").append("<td>" + doc.data().Hora + "</td>");
          db.collection("paciente")
            .doc(doc.data().Nome)
            .onSnapshot(function(query) {
              $("#" + doc.id + "paciente").text(query.data().Nome);
            });
          $("#tbody-consulta").append("<td id='" + doc.id + "paciente'></td>");
          $("#tbody-consulta").append(
            "<td>" + doc.data().Procedimento + "</td>"
          );
          db.collection("medico")
            .doc(doc.data().Medico)
            .onSnapshot(function(query) {
              $("#" + doc.id + "Medico").text(query.data().Nome);
            });
          $("#tbody-consulta").append("<td id='" + doc.id + "Medico'></td>");
          if (doc.data().Confirmado) {
            $("#tbody-consulta").append(
              '<td><span class="badge badge-pill badge-success">Sim</span></td>'
            );
          } else {
            $("#tbody-consulta").append(
              '<td><span class="badge badge-pill badge-danger">Não</span></td>'
            );
          }
          $("#tbody-consulta").append(
            '<td><button id="" type="button" data-id="' +
              doc.id +
              '" class="cancelarConsulta btn btn-danger btn-sm">Cancelar</button></td>'
          );
          $("#tbody-consulta").append("</tr>");
        });
      });
  }
  function atualizarPainel(db) {
    var qtd = 1;
    var doc1;
    var data = getDataAtual();

    db.collection("consulta")
      .where("Data", "==", data)
      .where("Cancelado", "==", false)
      .orderBy("Hora")
      .limit(25)
      .onSnapshot(function(querySnapshot) {
        var qtdConfirmados = 0;
        var qtdNaoConfirmados = 0;
        querySnapshot.forEach(function(doc) {
          if (qtd == 1) {
            db.collection("paciente")
              .doc(doc.data().Nome)
              .onSnapshot(function(query) {
                $("#proximaConsultaNome").text(query.data().Nome);
              });
            doc1 = doc.data();
          } else if (qtd == 2) {
            db.collection("paciente")
              .doc(doc.data().Nome)
              .onSnapshot(function(query) {
                $("#segundaConsultaNome").text(query.data().Nome);
              });
            varificarTempoLivreConsulta(doc1, doc.data());
          }

          if (doc.data().Confirmado) {
            qtdConfirmados++;
          } else {
            qtdNaoConfirmados++;
          }
          qtd++;
        });
        $("#qtdConfirmado").text(qtdConfirmados);
        $("#qtdNaoConfirmado").text(qtdNaoConfirmados);
      });
  }
  function varificarTempoLivreConsulta(doc1, doc2) {
    var hora1 = parseFloat(doc1.Hora.replace(":", ","));
    var hora2 = parseFloat(doc2.Hora.replace(":", ","));
  }
  function getDataAtual() {
    var data = new Date();
    data =
      data.getFullYear() + "-0" + (data.getMonth() + 1) + "-" + data.getDate();

    return data;
  }
  function validarDados(d) {
    if (d.Medico == "") {
      throw new Error("Campo Medico não foi preenchido");
    } else if (d.Nome == "") {
      throw new Error("Campo Paciente não foi preenchido");
    } else if (d.Procedimento == "") {
      throw new Error("Campo Procedimento não foi preenchido");
    } else if (d.Data == "") {
      throw new Error("Campo Data não foi preenchido");
    } else if (d.Hora == "") {
      throw new Error("Campo Hora não foi preenchido");
    }
  }
  function carregarCampos(db) {
    try {
      db.collection("paciente")
        .orderBy("Nome")
        .onSnapshot(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            $("#paciente").append(new Option(doc.data().Nome, doc.id));
          });
        });
      db.collection("medico")
        .orderBy("Nome")
        .onSnapshot(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            $("#medico").append(new Option(doc.data().Nome, doc.id));
          });
        });
    } catch (e) {
      console.log(e);
    }
  }
  function cancelarConsulta(db, doc) {
    try {
      var docRef = db.collection("consulta").doc(doc);

      return db
        .runTransaction(function(transaction) {
          // This code may get re-run multiple times if there are conflicts.
          return transaction.get(docRef).then(function(sfDoc) {
            if (!sfDoc.exists) {
              throw "Document does not exist!";
            }
            transaction.update(docRef, {
              Cancelado: true
            });
          });
        })
        .then(function() {
          swal("Bom Trabalho", "Consulta cancelada!", "success");
        })
        .catch(function(error) {
          swal("Falha", error, "error");
        });
    } catch (e) {
      console.log(e);
    }
  }
  function carregarTimeDisponivel(db, data) {
    var disabled = [];
    var d, h, m;

    // pega Hora atual para usar como filtro do plugin
    if(getDataAtual() == data)
    {
      d = new Date();
      h = d.getHours();
      if (d.getMinutes() > 30)
      {
        h = h + 1;
        m = 0;
      }else{
        m = 30;
      }
      // m = ;
    }else{
      h = 7;
      m = 0;
    }

 
    // Consulta consultas
    db.collection("consulta")
      .where("Data", "==", data)
      .where("Cancelado", "==", false)
      .orderBy("Hora")
      .limit(25)
      .onSnapshot(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          var hora = doc.data().Hora;
          hora = hora.toString().split(":");
          disabled.push(hora);
        });
        picker = $(".time").pickatime({
          min: [h, m],
          max: [20, 0],
          disable: disabled,
          format: "HH:i",
          clear: "Limpar",
          pick12HourFormat: false
        });
      });
  }
}); // Fim Document ready
