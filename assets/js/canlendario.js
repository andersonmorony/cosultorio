$(document).ready(function() {
  // page is now ready, initialize the calendar...
    var db = firebase.firestore();
  
    var consultas = [];

    try{
         db.collection("consulta")
            .where("Cancelado", "==", false)
            .onSnapshot(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    var paciente;
                    var medico;
                    // Add consultas no Array
                    consultas.push({
                        title: doc.data().Procedimento,
                        start: doc.data().Data + 'T' + doc.data().Hora,
                        color: "#5e72e4",
                        textColor: "#fff",
                        dados: doc.data()
                    });
                });
                $("#calendar").fullCalendar({
                    monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
                    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                    header: {
                        left:  'month,agendaWeek',
                        center: "title",
                        right: "prev,next"
                    },
                    eventClick: function (calEvent, jsEvent, view) {

                        db.collection("paciente")
                          .doc(calEvent.dados.Nome)
                          .onSnapshot(function(query) {
                              $("#td-nome").text(query.data().Nome);
                          });

                        db.collection("medico")
                          .doc(calEvent.dados.Medico)
                          .onSnapshot(function(m) {
                            $("#td-medico").text(m.data().Nome);
                          });

                        $("#modalCalender").modal("show");
                        $("#td-proc").text(calEvent.dados.Procedimento);
                        $("#td-data").text(calEvent.dados.Data);
                        $("#td-hora").text(calEvent.dados.Hora);
                    },
                    themeSystem: 'bootstrap4',
                    events: consultas,
                    eventLimit: 3
                });
            });
    // JSON.parse(consultas);
    }catch(e)
    {
        console.log(e);
    }

 
});
