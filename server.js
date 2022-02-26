/**********************Les librairies*******************************/
//Inclure la librairie express=>(ce qu'on a demande dans notre invite commande)
var express = require('express');
//Inclure la librairie morgan pour faire une passerelle
var morgan = require('morgan');
//Inclure mangoose(connexion entre node et mangoDB)
var mongoose = require('mongoose');
//Inclure le template
var ejs = require('ejs');
//Inclure le moteur de template
var engine = require('ejs-mate');
//Inclure le body-parser(pour acquérir les données parsées dans body )
var bodyParser = require('body-parser');
//Inclure express-session
var session = require('express-session');
//Inculre cookie-parser
var cookieParser = require('cookie-parser');
//Inclure express-flash
var flash = require('express-flash');
//Inclure la passerelle pour se connecter à node (de node => à bdd)
var passport = require('passport');
//Inclure le lieu de stockage temporaire(session(id) et cookies)
//Puisque connect-mongo marche de pair avec express-session alors il faut inclure session comme param
//Mais avec la nouvelle version de connect-mongo(V4.4.1) il ne faut plus passer la sesssion comme param dans la Class MongoStore
var MongoStore = require('connect-mongo');


/**********************Intialiser les variables***********************/
//Stocker l'Objet(express) dans une variable courte
var app = express();


/*************************Inclure les fichiers*****************************/
//Récupération des données dans l'Objet Category
var Category = require('./models/category');
//secret.js pour avoir la database/port/secretKey
var secret = require('./config/secret');



/********************************connection à la BDD grâce à mangoose*******************************/
//se connecter à la BDD grâce à mongoose
//1er param ce sont les données(mongodb://uri) il va falloir créer une BDD avec mongoDB
//2èm param c'est (l'utilisation de nouveau Parser)
//3èm param c'est c'est le callback(function(err))
mongoose.connect(secret.database ,{useNewUrlParser: true, useUnifiedTopology: true},function(err){
  if(err){
    console.log(err);
  }else{
    console.log('Connection OK');
  }
});
//////////////////////////////////Dire à mongoose de modifier le ensureIndex()///////////////////////////////////////
//DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
mongoose.set('useCreateIndex', true);


/********************Utilisation des passerelles(middleware)*******************************************************/
//////////////////////////Dire à express d'utiliser les css/js/images///////////////////////////////
//param c'est l'express static(prend le repertoire parent(Ecommerce) et rajouter les éléménts dans le repertoire(public))
app.use(express.static(__dirname + '/public'));
//////////////////////////Dire à express d'utiliser de la librairie morgan//////////////////////////////////
//param c'est
app.use(morgan("dev"));
///////////////////////////////////Dire à express d'utiliser et associé le moteur de template//////////////////////////
//1er param c'est le nom de duplicata
//2èm param c'est le moteur de template
app.engine('ejs',engine);
//////////////////////////////////Dire à express de modifier le template///////////////////////////////////////
//1er param c'est
//2èm param c'est le nom de duplicata(moteur de template)
app.set('view engine','ejs');
//////////////////////////////////Dire à express d'utiliser le body-parser///////////////////////////////////////
//Récupération des données
//param ce sont les données(format json()) de module body-parser
app.use(bodyParser.json());
//Récupération des URL encodés et les étendres
app.use(bodyParser.urlencoded({extended:true}));
//////////////////////////////////Dire à express d'utiliser la librairie cookie-express pour la gestion des cookies///////////////////////////////////////
//AUtilisation des cookie
app.use(cookieParser());
//////////////////////////////////Dire à express d'utiliser la librairie express-session pour la gestion des sessions///////////////////////////////////////
//Et puisque connect-mongo marche de paire avec express-session alors on utilise connect-mongo dans param(session)
//param c'est la session(une session est active ne pas la supprimer,un Objet(pas vide) est stocké dans magasin de session ne le supprime pas,le mot de passe secret,lieu de stockage temporaire(url de tabase/connection automatique))
app.use(session({
                  resave:true,
                  saveUninitialized:true,
                  secret:secret.secretKey,
                  store: MongoStore.create({
                                     mongoUrl:secret.database,
                                     autoReconnect:true
                                    })
                }));
//////////////////////////////////Dire à express d'utiliser la librairie express-flash pour la gestion des messages flash///////////////////////////////////////
app.use(flash());
//////////////////////////Dire à express d'attribuer l'Objet(Category) à toutes les routes(les pages) avant l'authentification///////////////////////////////
//param fonction qui contient(la requête,l'action,callback)
app.use(function(request,response,next){
  //Rechercher dans l'Objet Category
  //1er param dans toutes les données de l'Objet(category)
  //2èm param c'est function(erreur/ variable categories)
  Category.find({},function(err,categories){
    if(err) return next(err);
    //l'action =envoyer à toutes les pages le param catégories qui sera stocké dans un tableau
    response.locals.categories = categories;
    //callback(passe au code suivant)
    next();
  });
});
/////////////////////////////////Dire à expresse d'utiliser le passport pour s'authentifier dans notre page signin/////////////////////////////////
//Comme notre appli se base sur Connect/Express et utilise une session persistante alors on doit:
//établir une passerelle pour initialiser le passport
app.use(passport.initialize());
//et une passerelle pour la session persistante
app.use(passport.session());



//////////////////////////Dire à express d'attribuer l'Objet(user) à toutes les routes(les pages) avant l'authentification///////////////////////////////
//param fonction qui contient(la requête,l'action,callback)
app.use(function(request,response,next){
  //l'action envoyer à toutes les pages le param catégories = la requête de l'utilisateur
  response.locals.user = request.user;
  //callback(passe au code suivant)
  next();
});
/*************************************lancer le serveur(localhost:3000) avec la metohde get() grâce au moteur du template(ejs ejs-mate) et le router***********************************/
/////////////////////////////////Importation du router pour lancer la page (middleware(middleware))//////////////////////////////
var middlewareRouter = require('./middleware/middlewares');
//Dire à express d'utiliser le routes pour lancer la page (middleware(middleware)
//param c'est le router
app.use(middlewareRouter);
/////////////////////////////////Importation du router pour lancer les pages principales main (main(home/about))//////////////////////////////
var mainRouter = require('./routes/main');
//Dire à express d'utiliser le routes pour lancer les pages principales(main(home/about))
//param c'est le router
app.use(mainRouter);
/////////////////////////////////Importation du router pour lancer les pages (user(login/profil/signup/logout)//////////////////////////////
var userRouter = require('./routes/user');
//Dire à express d'utiliser le routes pour lancer les pages (user(login/profil/signup/logout)
//param c'est le router
app.use(userRouter);
/////////////////////////////////Importation du router pour lancer les pages (admin(category/product)//////////////////////////////
var adminRouter = require('./routes/admin');
//Dire à express d'utiliser le routes pour lancer les pages (admin(category/product)
//param c'est le router
app.use(adminRouter);
/////////////////////////////////Importation du router pour lancer les pages (api(api)//////////////////////////////
var apiRouter = require('./api/api');
//Dire à express d'utiliser le routes pour lancer les pages (api(api)
//1er param c'est une instruction (d'aller sur ce URL) qui sera précéder du apiRouter(/:name)
//2èm param c'est le router
app.use('/api',apiRouter);




  //app.post();
  //app.put();
  //app.delete();
  //app.set();
  //app.use();
  //app.get();













/***********************************************lancer le serveur localhost:3000 en premier lieu***************************/
//Pour lancer le serveur on va utiliser la methode listen pour dire à express d'écouter le port:3000
//1er param c'est le port
//2èm param c'est un callback
app.listen(secret.port,function(err){
  //Si err existe on va l'attraper
  if(err) throw err;
  //Si pas d'err on lance un message
  console.log('Le serveur est lancé sur le port '  + secret.port);
});
