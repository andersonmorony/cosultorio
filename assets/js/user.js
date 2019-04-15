
var config = {
  apiKey: "AIzaSyBY8HhWyh040tX1E2NLYDL57ZlYNjv3Gik",
  authDomain: "consultoriokyra.firebaseapp.com",
  databaseURL: "https://consultoriokyra.firebaseio.com",
  projectId: "consultoriokyra",
  storageBucket: "consultoriokyra.appspot.com",
  messagingSenderId: "258998917952"
};




firebase.initializeApp(config);

$('#btn-login').click(function () {

    var email = $('#email').val();
    var senha = $("#senha").val();

    try {
        if (email == "" || senha == '') {
            throw ('Erro campo individamente preenhido');
        }
        login(email, senha);
    } catch (error) {
        console.log(error);
    }


});
$('#btn-cadastro').click(function(){

    var nome = $("#name").val();    
    var email = $('#email').val();    
    var senha = $("#senha").val();    
    var termo = $("#customCheckRegister").is(':checked');    

    try{
        if (email == "" || senha == '' || termo == false) {
            throw('Erro campo individamente preenhido');
        }
        cadastro(email, senha, nome);
    }catch(error)
    {
        $("#senhafraca").html(
          '<small><span id="senhafraca" class="text-danger font-weight-700">Error: </span>' +
            error +
            " </small>"
        );
    }
    

});
$(".btn-logout").click(function(){
    logout();
});
$('#btn-recuperar').click(function(){

    var email = $('#email').val();
    console.log(email)
    try{
        recuperarSenha(email);

    }catch(e){
        $("#senhafraca").html(
            '<small><span id="senhafraca" class="text-danger font-weight-700">Error: </span>' +
            e +
            " </small>"
        );
    }

});

function login(email, senha ){
    firebase.auth().signInWithEmailAndPassword(email, senha).then(function(user){
       verificarUser();
    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        if (errorMessage != '') {
            $("#error").html('<div class="alert alert-danger" role="alert">' + errorMessage +'</div >' );
        } else {
            $("#error").html("");            
            statusUser();
        }

        console.log(error);
    });
}

function cadastro(email, senha, nome){
    firebase.auth().createUserWithEmailAndPassword(email, senha).then(function(){

        addNameUser(nome);

    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;

        if(errorMessage != ''){
            $("#senhafraca").html(
              '<small><span id="senhafraca" class="text-danger font-weight-700">Error: </span>' +
                errorMessage +
                " </small>"
            );
        }

        // ...
    });
}

function statusUser(){
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            var providerData = user.providerData;
            
            $("#profile-name").html(displayName);
            $('.profile-img').html('<img alt="Image placeholder" id="profile-img" src="'+ photoURL +'">');

           

            // ...
        } else {
            if (origin == 'http://127.0.0.1:5500')
            {
                window.location.href = origin + "/public/login.html";
            }else{
                window.location.href = origin + "/login.html";
            }

        }
    });
}

function verificarUser() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {

            window.location.href = "index.html";

            // ...
        } else {
            if (origin == 'http://127.0.0.1:5500') {
                window.location.href = origin + "/public/login.html";
            } else {
                window.location.href = origin + "/login.html";
            }

        }
    });
}

function logout(){
    firebase.auth().signOut().then(function () {

        window.location.href = "login.html";

    }).catch(function (error) {
        console.log(error);
    });
}

function addNameUser(nome){

    var user = firebase.auth().currentUser;

    user.updateProfile({
        displayName: nome,
        photoURL: "https://img.icons8.com/color/50/000000/circled-user-male-skin-type-4.png"
    }).then(function () {
        verificarUser();        
    }).catch(function (error) {
        console.log('Erro');
    });
}

function recuperarSenha(email){

    var auth = firebase.auth();
    // var emailAddress = dadosUsuario.email;

    auth.sendPasswordResetEmail(email).then(function () {
        swal(
          "Enviado!",
          "Um email foi enviado para a sua caixa de email para recuperar a senha",
          "success"
        );
    }).catch(function (error) {
        swal(
            "Falha!",
            error,
            "error"
        );
    });

}
