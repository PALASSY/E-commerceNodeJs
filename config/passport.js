/*************************************Les librairies*********************************************************************/
//Inclure la passerelle pour se connecter à node (de node => à bdd)
var passport = require('passport');
//Inclure la stratégie de passeport pour s'authentifier avec un nom d'utilisateur et un mot de passe.
var PassportLocalStrategy = require('passport-local').Strategy;

/************************************Inclure le fichier user.js pour avoir les données de l'utilisateur*****************************/
//Pour récupérer les données de l'utilisateur
//..sortir du config pour retrouver le models
var User = require('../models/user')


/************************************L'authentifiation**********************************************************************/
//////////////////////////////serialize(instancie la session de connexion)////////////////////////////////
//param c'est une function(utilisateur, callback())
passport.serializeUser(function(user, done) {
  ///////////callback(la récupération de l'Id de session de connexion) a partir de Id de l'user/////////
  done(null, user._id);
});
//////////////////////////////deserialize(enlève l'instanciation de la session de connexion)////////////////////////////
//param c'est une function(id(session de connexion), callback())
passport.deserializeUser(function(id, done) {
  /////////////////recherche l'Id de session et vérifie s'il existe/////////////////
  //1er param c'est Id(session) à chercher
  //2èm param c'est une function(erreur,l'user)
  User.findById(id, function(err, user) {
    ///////////Si l'Id existe on fait callback(affichage de l'erreur par rapport à l'utilisateur)/////////
        done(err, user);
  });
});
/******************************************passerelle****************************************/
///////////////////////////////Vérification d'identité(email/password) dans la BDD/////////////////////////////////////
//1er param c'est le nom de notre stratégie(d'identification)
//2è param c'est la stratégie(nouvelObjet)
//(le paramètrage des infos d'identification(email/password/request sera passé comme premier argument au rappel de vérification) et le function qui contient(le message d'erreur/email/password/callback))
passport.use('local-login',new PassportLocalStrategy({
                                                        usernameField: 'email',
                                                        passwordField: 'password',
                                                        passReqToCallback:true
                                                      },
                                                      //function qui porte(messageFlash,les infos d'identification,callback())
                                                      function(request,email,password,done){
                                                        //////////////////Recherche un seul champ dans le fichier utilisateur dans la BDD////////////////////
                                                        //1er param c'est le champ à chercher
                                                        //2em param c'est une function qui porte(erreur,utlisateur)
                                                        User.findOne({email:email},function(err,user){
                                                            //Si l'erreur existe on retourne un callback(l'erreur)
                                                            if(err){return done(err);}
                                                            //Si on ne trouve pas l'user on retourne un callback(message flash)
                                                            if(!user){return done(null,false,request.flash('loginMessage','Utilisateur introuvable ou non existant'));}
                                                            // Si les mots de passe ne sont pas identiques on retourne un callback(message flash)
                                                            //param c'est le password
                                                            if(!user.comparePassword(password)){return done(null,false,request.flash('loginMessage','Les mots de passes ne sont pas identiques'));}
                                                            //retourne le callback(l'utilisateur) si aucune erreur
                                                            return done(null,user);
                                                        });
                                                      }
));


/***********************************Methode personnalisé pour valider l'authentification(email/password)*****************************************************************/
//param c'est une function qui porte(la requête,redirection,callback())
exports.isAuthenticated = function(request,response,next){
  //si la requête d'identification est accomplie
  if(request.isAuthenticated()){
    //on retourne un callback(continue le code)
    return next();
  }
  //Sinon on redirige l'user à la page loging
  response.redirect('/login');
}
