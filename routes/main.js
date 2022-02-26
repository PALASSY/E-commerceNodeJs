/****************************************Itinéraires*///////////////////////////////////
//Inclure l'itinéraire à partir de la librairies et express
var router = require('express').Router();
//Inclure la page User/Product/Cart(qui contient toutes les données de utilisateur/produit/panier)
//Utilisation de majuscule parceque c'est une class
var User = require('../models/user');
var Product = require('../models/product');
var Cart = require('../models/cart');
//Inclure asynch(pour faire une waterfall)
var async = require('async');
//Inclure stripe
//Adjoindre la clé Server(back-end)Stripe = secretKey(sk_test)
let stripe = require('stripe')('sk_test_51IDsHsApMe34QWSxRKGcNsHuiTXBsHvXBYZEY0ftDybG49uCQdLDnssYtsBlWysf4GWe40kPpL30wqGVmlqkzEPD00bFd664Me');
//Inclure la date en nodejs
let moment = require('moment');

/*************************************lancer le serveur(localhost:3000) avec la metohde get() grâce au moteur du template(ejs ejs-mate) et le router***********************************/
///////////////////////////////page home/////////////////////////////////////////////////
//Création d'un chemin et de URL de la page d'accueil(Ecommerce) avec la methode get()
//1er param c'est URL
//2em param c'est une call back(1er par c'est la requete/2em param c'est la reponse)
router.get('/', function(request,response){
  //On ouvre la page d'accueil dans views avec render() sans l'extension ejs
  response.render('main/home');
});
////////////////////////////////////page about////////////////////////////////
//Création d'un chemin et de URL de la page about(Ecommerce) avec la methode get()
//1er param c'est URL
//2em param c'est une call back(1er par c'est la requete/2em param c'est la reponse)
router.get('/about', function(request,response){
  //On ouvre la page apropos dansle views avec render() sans l'extension ejs
  response.render('main/about');
});


/**********page url PRODUCTS pour afficher les produits***********************************/
/////////////////////////////////////lancer le serveur(localhost:3000) avec la metohde get() grâce au moteur du template/////////////////////////////////////
//1er param c'est l'URL(views/product) suivi de l'URL(qui comporte le nom du produit)
//2em param c'est une function qui contient(la requete/l'action/callback)
router.get('/products/:id',function(request,response,next){
  //////////////////Recherche le champ dans le fichier Category dans la BDD////////////////////
  //param c'est la comparaison du champ category(dans l'Objet Product de la BDD) au paramètre(id) qu'on trouve sur l'Url
  //populate permet de peupler le Product de la category(Objet)
  //Puis executer une fonction qui porte(err/produits)
  Product.find({category:request.params.id}).populate('category').exec(function(err,products){
    if(err) return next(err);
    //Rendre l'élémént sur DOM (redefinir la clé du message flash)
    //1er param On ouvre la page category(DOM)
    //2èm param c'est l'élémént à rendre (redefinir la clé des produits pour être réutiliser dans le DOM)
    response.render('./main/category',{products:products});
  });
});


/****************************************page url PRODUCT pour afficher un produit***********************************/
/////////////////////////////////////lancer le serveur(localhost:3000) avec la metohde get() grâce au moteur du template/////////////////////////////////////
//1er param c'est l'URL(views/product) suivi de l'URL(qui comporte le nom du produit)
//2em param c'est une function qui contient(la requete/l'action/callback)
router.get('/product/:id',function(request,response,next){
  //////////////////Recherche le champ selon son ID dans le fichier Product dans la BDD////////////////////
  //1er param c'est la comparaison du champ id(dans l'Objet Product de la BDD) au paramètre(id) qu'on trouve sur l'Url
  //2em param c'est une function qui porte(erreur,product)
  //populate permet d'accéder aux données de l'Objet Product dans BDD
  //Puis executer une fonction(err/produits)
  Product.findById({_id:request.params.id},function(err,product){
    if(err) return next(err);
    //Si la requête s'est bien passé,rendre l'élémént sur DOM (redefinir la clé du produit)
    //1er param On ouvre la page category(DOM)
    //2èm param c'est l'élémént à rendre (redefinir la clé du produit pour être réutiliser dans le DOM)
    response.render('./main/product',{product:product});
  });
});
////////////////////////Créer une route pour transmettre les données(formulaire) via la methode post() dans URL///////////////////////////
//1er param c'est URL
//2è param c'est la function qui contient(le nom de notre stratégie(d'identification))
router.post('/product/:product_id',function(request,response,next){
  ////////////////////////Chercher le panier de l'utilisateur////////////////////////////:
  //Recherche un seul champ dans le fichier Cart dans la BDD
  //1er param c'est le champ à chercher(owner de la Cart dans BDD) correspond à l'Id(user)
  //2em param c'est une function qui porte(erreur,panier)
  Cart.findOne({owner:request.user._id},function(err,cart){
    //Ajout le produit au panier (les éléments qui composent le panier)
    cart.items.push({
                      // item (l'un des éléments qui composent le panier) sera égal aux données récupérées dans le champs(item)grâce à bodyparser
                      item:request.body.product_id,
                      // quantity (l'un des éléments qui composent le panier) sera égal aux données récupérées dans le champs(quantity)grâce à bodyparser
                      quantity:parseInt(request.body.quantity),
                      // price (l'un des éléments qui composent le panier) sera égal aux données récupérées dans le champs(priceValue)grâce à bodyparser
                      price:parseFloat(request.body.priceValue)
                    });
   //Modification de total(Cart) aussi (total + prix ajàuté)
   cart.total = (cart.total + parseFloat(request.body.priceValue)).toFixed(2);
   //On sauvegarde les données dans la BDD(mongoDB)
   //param function(err)
   cart.save(function(err){
     if(err) return next(err);
     //Si pas d'erreur de sauvegarde, on fait une action, rediriger l'user vers son panier
     return response.redirect('/cart');
 });
  });
});


/****************************************page url CART pour afficher un panier***********************************/
/////////////////////////////////////lancer le serveur(localhost:3000) avec la metohde get() grâce au moteur du template/////////////////////////////////////
//1er param c'est l'URL(views/product) suivi de l'URL(qui comporte le nom du produit)
//2em param c'est une function qui contient(la requete/l'action/callback)
router.get('/cart',function(request,response,next){
  //////////////////Recherche le champ dans le fichier Cart dans la BDD////////////////////
  //param c'est la comparaison du champ owner(dans l'Objet Cart de la BDD) au paramètre(id) qu'on trouve sur l'Url
  //populate permet de pleupler la Cart du (Product(items.item de la Cart))Objet
  //Puis executer une fonction qui porte(err/panier)
  Cart.findOne({owner:request.user._id}).populate('items.item').exec(function(err,foundCart){
    if(err) return next(err);
    //Rendre l'élémént sur DOM (redefinir la clé du panier)
    //1er param On ouvre la page cart(VIEW)
    //2èm param c'est l'élémént à rendre (redefinir la clé d'un panier au panier trouvé pour réutiliser dans le DOM)
    //et redefinir la clé du message flash pour être réutiliser dans le DOM)
    response.render('./main/cart',{foundCart:foundCart,message:request.flash('remove')});
  });
});

/****************************************page url CART pour supprimer le produit dans le panier***********************************/
//Suppression du produit dans panier et le faire  directement de la BDD
//1er param c'est URL
//2è param c'est la function qui contient(le nom de notre stratégie(d'identification))
router.post('/remove',function(request,response,next){
  //////////////////////////Identifier l'utilisateur du panier////////////////////////////:
  //Recherche un seul champ dans le fichier Cart dans la BDD
  //1er param c'est le champ à chercher(owner de la Cart dans BDD) correspond à l'Id(user) qu'on trouve sur l'Url
  //2em param c'est une function qui porte(erreur,panier)
  Cart.findOne({owner:request.user._id},function(err,foundCart){
    ////////////////////Supprimer de la liste/////////////////////////////
    //Récupère les éléments qui composent le panier(dans l'Objet cart()) et on supprime les données récupérées dans le champs(item)grâce à bodyparser
    foundCart.items.pull(String(request.body.item));
    ////////////////////MAJ du la totalité du panier/////////////////////
    //Récupère la totalité du panier(dans l'Objet cart())
    // et sera égal à la totalité du panier moins les données récupérées dans le champs(price)grâce à bodyparser(nombre à virgule)
    foundCart.total = (foundCart.total - parseFloat(request.body.price)).toFixed(2);
    //On sauvegarde les données dans la BDD(mongoDB)
    //param function(err)
    foundCart.save(function(err,found){
      if(err) return next(err);
      //Si le sauvegarde c'est bien passé,on fait une requête de flash pour(afficher un message suppresssion)
      request.flash('remove','Le produit a bien été supprimé');
      //On fait une action pour rediriger l'utilisateur vers la page add-category
      return response.redirect('/cart');
    });
  });
});

/****************************************page url PAIEMENT AVEC STRIPE***********************************/
/////////////////////////////////////lancer le serveur(localhost:3000) avec la metohde get() grâce au moteur du template/////////////////////////////////////
//1er param c'est l'URL(paiementOk)
//2em param c'est une function qui contient(la requete/l'action)
router.get('/paymentOk',function(request,response){
  //Rendre l'élémént sur DOM )
  //1er param On ouvre la page category(DOM)
  //2èm param c'est l'élémént à rendre (redefinir la clé du produit pour être réutiliser dans le DOM)
  response.render('main/paymentOk');
});
////////////////////////Créer une route pour transmettre les données(formulaire) via la methode post() dans URL///////////////////////////
//1er param c'est URL
//2è param c'est la function qui contient(la requete/l'action)
router.post('/payment',function(request,response){
  //////////////////////////Identifier le panier de l'utilisateur////////////////////////////:
  //Recherche un seul champ dans le fichier Cart dans la BDD
  //1er param c'est le champ à chercher(owner de la Cart dans BDD) correspond à l'Id(user) qu'on trouve sur l'Url
  //2em param c'est une function qui porte(erreur,panier)
  Cart.findOne({owner:request.user._id},function(err,foundCartStripe){
    //Quand on click sur le boutton<form>dans VIEW/main/cart.ejs, cela genère une clé Token(ID) !Très Important
    //Récupérer l'<input> caché (créer par JS/custom.js) par son name dans ce <form>
    var stripMoney = request.body.stripeMoney;
    var stripToken = request.body.stripeToken;
    //Récupération des autres <imput> visible dans ce <form>
    var charge = {
                  amount: stripMoney * 100,
                  currency:'eur',
                  card: stripToken
                };
    //Débiter une carte de crédit
    //1er param ce sont les données récupérées dans les <input> visibles
    //2em param c'est une functon(err/action(!ecrire d'une autre manière))
    stripe.charges.create(charge,function(err,resp){
      if(err){console.log(err);
      }else{
        //Récupérer les données à condition si les données existent
        //la chute d'eau exécute l'autre à condition si l'un est true
        async.waterfall([
                  //param c'est une function(callback)
                  function(callback){
                                      //////////////////Recherche un seul champ dans le fichier utilisateur dans la BDD////////////////////
                                      //1er param c'est le champ à chercher(Id de l'utilisateur dans BDD) est c'est l'Id qu'on trouve sur l'Url
                                      //2em param c'est une function qui porte(erreur,utlisateur)
                                      User.findOne({ _id : request.user._id},function(err,user){
                                        if(err) return next(err);
                                        //Si le paiement est passé
                                        if(resp.paid){
                                          /////////////////////Convertir stripe timestamp to date///////////////////////////
                                          let unix_timestamp = resp.created;
                                          // multiplier chaque seconde(UTC) en millisecond
                                          let date = new Date(unix_timestamp * 1000);
                                          //Date: Multiple Locale Support of moment.js
                                          let formattedTime = Date.parse(date);
                                          //Rajouter le montant/date(dans profile de l'Objet User()) et il sera égal aux données récupérées dans Stripe
                                          user.history.push({paid:resp.amount/100,date:formattedTime});
                                          //On sauvegarde les données dans la BDD(mongoDB)
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
                  function(user,callback){
                                          //Mettre à jour le panier
                                          if(resp.status === "succeeded"){
                                            var owner = 'ok';
                                            //Récupérer le panier et Suppression des produits dans cart
                                            ////////////////////MAJ l'items du panier/////////////////////////////
                                            //Récupère les éléments qui composent le panier(dans l'Objet cart()) et on vide
                                            foundCartStripe.items = [];
                                            ////////////////////MAJ la totalité du panier/////////////////////
                                            //Récupère la totalité du panier(dans l'Objet cart())
                                            // et sera égal à la totalité du panier moins les données récupérées dans le champs(price)grâce à bodyparser(nombre à virgule)
                                            foundCartStripe.total = 0;
                                            //Sauvegarde dans BDD le MAJ
                                            foundCartStripe.save(function(err){
                                              if(err) return next(err);
                                              //Si pas d'erreur de sauvegarde, on récupérer le l'Objet User(BDD)
                                              //1er param c'est null
                                              //2èm param c'est l'User
                                              callback(null,user);
                                            });

                                            //Message
                                            request.flash('success','MERCI ' + user.profile.name +' votre paiement a été validé avec succès!');
                                            //Rendre l'élémént sur DOM
                                            //1er param On ouvre la page category(DOM)
                                            response.render('./main/paymentOk',{date:owner,message:request.flash('success')});
                                          }
                    }]);
      }
    });
  });
});

//app.post();
//app.put();
//app.delete();
//app.set();
//app.use();
//app.get();


/**********************************Exportation des données***********************************************************/
/////////////////////////////Exporter le router(express et Router()) pour réutiliser dans server.js/////////////////////////
module.exports = router;
