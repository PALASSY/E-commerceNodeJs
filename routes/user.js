/****************************************Itinéraires*****************************************/
//Inclure l'itinéraire à partir de la librairies
var router = require('express').Router();
//Inclure la page user/cart(qui contient toutes les données de user/cart)
//Utilisation de majuscule parceque c'est une class
var User = require('../models/user');
var Cart = require('../models/cart');
//Inclure la passerelle pour se connecter à node (de node => à bdd)
var passport = require('passport');
//Inclure la page authentification de l'user
var passportConf = require('../config/passport');
//Inclure asynch(pour faire une waterfall)
var async = require('async');
//Inclure stripe
//Adjoindre la clé Server(back-end)Stripe = secretKey(sk_test)
let stripe = require('stripe')('sk_test_51IDsHsApMe34QWSxRKGcNsHuiTXBsHvXBYZEY0ftDybG49uCQdLDnssYtsBlWysf4GWe40kPpL30wqGVmlqkzEPD00bFd664Me');

/****************************************page url LOGIN***********************************/
/////////////////////////////////////lancer le serveur(localhost:3000) avec la metohde get() grâce au moteur du template/////////////////////////////////////
//1er param c'est URL
//2em param c'est une function qui contient(la requete/l'action)
router.get('/login',function(request,response){
  //Si notre requête trouve l'user(dans l'Url) on fait une redirection vers la page d'acceuil)
  if(request.user){return response.redirect('/');}
  //Sinon on rend l'élémént sur DOM (redefinir la clé du message flash)
  //1er param On ouvre la page signup(DOM)
  //2èm param c'est l'élémént à rendre (redefinir la clé du message flash pour être réutiliser dans le DOM)
  response.render('./account/login',{message : request.flash('loginMessage')});
});
////////////////////////Créer une route pour transmettre les données(formulaire) via la methode post() dans URL///////////////////////////
//1er param c'est URL
//2è param c'est l'authentification de demande(le nom de notre stratégie(d'identification)dans(config/passport.js))
router.post('/login',passport.authenticate('local-login',{
  //On fait la redirection grâce au methode(passport) en cas de success ou en cas de failure
  //Envoyer un messageFlash en cas de failure
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));

/******************************************page url PROFILE***************************************/
/////////////////////////////////////lancer le serveur(localhost:3000) avec la metohde get() grâce au moteur du template/////////////////////////////////////
//1er param c'est URL
//2em param c'est une function qui contient(la requete/la reponse)
router.get('/profile',function(request,response){
  //////////////////Recherche un seul champ dans le fichier utilisateur dans la BDD////////////////////
  //1er param c'est le champ à chercher(Id de l'utilisateur dans BDD) est c'est l'Id qu'on trouve sur l'Url
  //2em param c'est une function qui porte(erreur,utlisateur)
  User.findOne({ _id : request.user._id},function(err,user){
    if(err) return next(err);
    //Sinon on rendre l'élément sur DOM (redefinir la clé de la methode utilisateur)
    response.render('account/profile',{user:user});
  });
});


/*******************************************page url SIGN-UP****************************************************/
/////////////////////////////////////lancer le serveur(localhost:3000) avec la metohde get() grâce au moteur du template/////////////////////////////////////
//1er param c'est URL
//2em param c'est une function qui contient(la requete/le callback())
router.get('/signup', function(request,response){
  //////////////////////////on fait l'action(Rendre un élémént dans un noeud DOM)/////////////////////////////
  //1er param On ouvre la page signup(DOM)
  //2èm param c'est l'élémént à rendre sur DOM (redefinir la clé du message flash pour être réutiliser dans le DOM)
  response.render('./account/signup',{errors : request.flash('errors')});
});
////////////////////////Créer une route pour transmettre les données(formulaire) via la methode post() dans URL///////////////////////////
//1er param c'est URL
//2em param c'est une function qui contient(la requete/l'action/callback())
router.post('/signup', function(request,response,next){
  //Récupérer les données à condition si les données existent
  //la chute d'eau exécute l'autre à condition si l'un est true
  async.waterfall([
                      //param c'est une function(callback)
                      function(callback){
                                          /////////////////////////////Instancier un nouvel Objet(utilisateur)///////////////////////////////
                                          var user = new User();
                                          //Récupère le name(dans profile de l'Objet User()) et il sera égal aux données récupérées dans le champs(name)grâce à bodyparser
                                          user.profile.name = request.body.name;
                                          //Récupère l'email(dans email de l'Objet User()) et il sera égal aux données récupérées dans le champs(email)grâce à bodyparser
                                          user.email = request.body.email;
                                          //Récupère le mot de pass(dans password de l'Objet User()) et il sera égal aux données récupérées dans le champs(password)grâce à bodyparser
                                          user.password = request.body.password;
                                          //Récupère l'avatar(dans picture de l'Objet User()) et il sera égal à la methode(gravatar) crée dans page user.ejs
                                          user.profile.picture = user.gravatar();
                                          //////////////////////////Vérifier dans la BDD(mongoDB) si il y a un seul et unique email///////////////////////////
                                          //findOne() c'est une methode de mongoose
                                          //param email === email dans le champs(email)
                                          //2em param c'est la function(err, methode(l'user exist))
                                          User.findOne({email:request.body.email},function(err,existingUser){
                                            //Commencer par vérifier l'user s'il existe
                                            if(existingUser){
                                              //Si oui veut dire email existe aussi, Envoyer un message flash(mail exist)
                                              //1er param cest a clé du message
                                              //2èm param c'est le message
                                              request.flash('errors','Cet email existe dans notre BDD');
                                              //Puis on retourne l'action (le rediriger directement dans l'url SIGNUP(page) pour se réinscrire)
                                              return response.redirect('/signup');
                                            }else{
                                              //Si email n'existe pas, on sauvegarde le nouvel Objet dans la BDD(mongoDB)
                                              //param function(err)
                                              user.save(function(err){
                                                if(err) return next(err);
                                                //Si pas d'erreur de sauvegarde, on récupérer le l'Objet User(BDD)
                                                //1er param c'est null
                                                //2èm param c'est l'User
                                                callback(null,user);
                                            });
                                          }
                                        });
                                        },
                      //Si la précédente function est true alors: On va créer un nouvel Objet Cart
                      //1er param c'est l'Objet User(BDD) qui a été renvoyé par le callback précédemment
                      //2èm param c'est le callback
                      function(user,callback){
                                                //Instancier un nouvel Objet Cart
                                                var cart = new Cart();
                                                //Le propriaitaire de la Cart est la User(id)qui se trouve dans BDD
                                                cart.owner = user._id;
                                                //On sauvegarde les données(de nouvel OBLJET Cart) dans la BDD(mongoDB)
                                                cart.save(function(err){
                                                  if(err) return next(err);
                                                  //Si la sauvegarde des données dans BDD est réussie, on fait une requête pour se connecter
                                                  //grâce à passport on peut utiliser une methode logIn(sans passer par la case login)
                                                  //1er param c'est l'utilisateur
                                                  //2èm param une fonction qui contient(erreur)
                                                  request.logIn(user,function(err){
                                                    if(err) return next(err);
                                                    //Si login s'est bien fait, on fait l'action(le redirige vers la page profile)
                                                    response.redirect('/profile');
                                                  });
                                                });
                                              }
                  ]);

});



/*******************************************page url LOGOUT****************************************************/
/////////////////////////////////////lancer le serveur(localhost:3000) avec la metohde get() grâce au moteur du template/////////////////////////////////////
//1er param c'est URL
//2em param c'est une function qui contient(la requete/l'action/callback())
router.get('/logout',function(request,response,next){
  //Faire la requête pour se deconnecter
  //grâce à passport on peut utiliser une methode logout
  request.logout();
  //on fait l'action(Rediriger l'utilisateur vers la page d'accueil)
  response.redirect('/');
});


/*******************************page url modification de PROFILE****************************************************/
/////////////////////////////////////lancer le serveur(localhost:3000) avec la metohde get() grâce au moteur du template/////////////////////////////////////
//1er param c'est URL
//2em param c'est une function qui contient(la requete/l'action/callback())
router.get('/edit-profile',function(request,response,next){
  //////////////////Recherche un seul champ dans le fichier utilisateur dans la BDD////////////////////
  //1er param c'est le champ à chercher(Id de l'utilisateur dans BDD) et comme celui qui se trouve sur l'Url
  //2em param c'est une function qui porte(erreur,utlisateur)
  User.findOne({ _id : request.user._id},function(err,user){
    //Si le requête echoue on retourne un callback(l'erreur)
    if(err) return next(err);
    //Si la requête aboutie, on rend l'élément sur DOM (redefinir la clé de la methode utilisateur/message de success)
    response.render('account/edit-profile',{user:user,message:request.flash('success')});
  });
});
////////////////////////Créer une route pour transmettre les données(formulaire) via la methode post() dans URL///////////////////////////
//1er param c'est URL
//2em param c'est une function qui contient(la requete/l'action/callback())
router.post('/edit-profile',function(request,response,next){
  //////////////////Recherche un seul champ dans le fichier utilisateur dans la BDD////////////////////
  //1er param c'est le champ à chercher(Id de l'utilisateur dans BDD)
  //2em param c'est une function qui porte(erreur,utlisateur)
  User.findOne({ _id : request.user._id},function(err,user){
    //Si l'erreur existe on retourne un callback(l'erreur)
    if(err) return next(err);
    //Si on accède aux données récupérées dans le champs(name)grâce à bodyparser
    //On récupère le name(dans profile de l'Objet User()) et il sera égal aux données récupérées dans le champs(name)
    if(request.body.name) user.profile.name = request.body.name;
    //Si on accède aux données récupérées dans le champs(adresse)grâce à bodyparser
    //On récupère l'adresse(dans profile de l'Objet User()) et il sera égal aux données récupérées dans le champs(adresse)
    if(request.body.address) user.address = request.body.address;
    //on sauvegarde les données dans la BDD(mongoDB)
    //param function(err)
    user.save(function(err){
      //Si il y a une erreur de sauvegarde, on affiche l'erreur
      if(err) return next(err);
      //Si le sauvegarde c'est bien passé,on fait une requête de flash pour(afficher un message success)
      request.flash('success','Vos informations ont été mises à jour');
      //On fait une action pour rediriger l'utilisateur vers la page profile
      return response.redirect('/edit-profile');
    });
    });
});


/**********************************Exportation des données***********************************************************/
/////////////////////////////Exporter le router(express et Router()) pour réutiliser dans server.js/////////////////////////
module.exports = router;
