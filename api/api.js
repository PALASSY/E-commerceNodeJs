/****************************************Itinéraires*****************************************/
//Inclure l'itinéraire à partir de la librairies
var router = require('express').Router();
//Inclure l'asynchrone
var async = require('async');
//Inclure le faker
var faker = require('faker');
//Inclure la page category  et product(qui contient toutes les données categories/product)
//Utilisation de majuscule parceque c'est une class
var Category = require('../models/category');
var Product = require('../models/product');




/****************************************page url API cration de  produit par catégorie***********************************/
/////////////////////////////////////lancer le serveur(localhost:3000) avec la metohde get() grâce au moteur du template/////////////////////////////////////
//Création à partir d'un nom de catégorie pour aller consulter les produits
//1er param c'est URL(qui comporte le nom de la categorie)
//2em param c'est une function qui contient(la requete/l'action)
router.get('/:name',function(request,response,next){
  //Récupérer les données à condition si les données existent
  //la chute d'eau exécute l'autre à condition si l'un est true
  async.waterfall([
                    //param c'est une function(callback)
                    function(callback){
                      //////////////////Recherche un seul champ dans le fichier Category dans la BDD////////////////////
                      //1er param c'est la comparaison(name de Category dans BDD) au paramètre(name) qu'on trouve sur l'Url
                      //2em param c'est une function qui porte(erreur,categorie)
                      Category.findOne({name:request.params.name},function(err,category){
                        if(err) return next(err);
                        //Si pas d'erreur de comparaison, on récupérer le l'Objet category(BDD)
                        //1er param c'est null
                        //2èm param c'est la catégorie
                        callback(null,category);
                      });
                    },
                    //Si la précédente function est true alors:
                    //1er param c'est l'Objet category(BDD) qui a été renvoyé par le callback précédemment
                    //2èm param c'est le callback
                    function(category,callback){
                      //Boucle: tant que la condition n'est pas fausse, on incrémente de 1
                      for(var i = 0; i < 15; i++){
                        //Instancier un nouvel Objet Product
                        var product = new Product();
                        //La categorie du produit est la category(id)qui se trouve dans BDD
                        product.category = category._id;
                        //Le nom du produit est le nom(produit(methode) de commerce) dans faker
                        product.name = faker.commerce.productName();
                        //Le prix du produit est le prix(price(methode) de commerce) dans faker
                        product.price = faker.commerce.price();
                        //L'image du produit est l'image(image(methode) de image) dans faker
                        product.image = faker.image.image();
                        //On sauvegarde les données(de nouvel OBLJET product) dans la BDD(mongoDB)
                        product.save();
                      }
                    }
                  ]);
                  //Faire une action envoyé en mode json un message de success
                  response.json({message:'success'});
});




/**********************************Exportation des données***********************************************************/
/////////////////////////////Exporter le router(express et Router()) pour réutiliser dans server.js/////////////////////////
module.exports = router;
