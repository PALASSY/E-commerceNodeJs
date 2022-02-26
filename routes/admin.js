/****************************************Itinéraires*****************************************/
//Inclure l'itinéraire à partir de la librairies
var router = require('express').Router();
//Inclure la page category(qui contient toutes les données categories)
//Utilisation de majuscule parceque c'est une class
var Category = require('../models/category');


/****************************************page url ADD-CATEGORY***********************************/
/////////////////////////////////////lancer le serveur(localhost:3000) avec la metohde get() grâce au moteur du template/////////////////////////////////////
//1er param c'est URL
//2em param c'est une function qui contient(la requete/l'action/callback)
router.get('/add-category',function(request,response,next){
  //On fait l'action rendre l'élémént sur DOM (redefinir la clé du message flash)
  //1er param On ouvre la page signup(DOM)
  //2èm param c'est l'élémént à rendre (redefinir la clé du message flash pour être réutiliser dans le DOM)
  response.render('./admin/add-category',{message : request.flash('success')});
});
////////////////////////Créer une route pour transmettre les données(formulaire) via la methode post() dans URL///////////////////////////
//1er param c'est URL
//2em param c'est une function qui contient(la requete/l'action/callback())
router.post('/add-category',function(request,response,next){
  /////////////////////////////Instancier un nouvel Objet(category)///////////////////////////////
  var category = new Category();
  //Récupère le name(dans name de l'Objet Category()) et il sera égal aux données récupérées dans le champs(name) grâce à bodyparser
  category.name = request.body.name;
  //on sauvegarde les données dans la BDD(mongoDB)
  //param function(err)
  category.save(function(err){
    //Si il y a une erreur de sauvegarde, on affiche l'erreur
    if(err) return next(err);
    //Si le sauvegarde c'est bien passé,on fait une requête de flash pour(afficher un message success)
    request.flash('success','La catégorie ' + request.body.name +' est ajouté dans BDD');
    //On fait une action pour rediriger l'utilisateur vers la page add-category
    return response.redirect('/add-category');
  });
});







/**********************************Exportation des données***********************************************************/
/////////////////////////////Exporter le router(express et Router()) pour réutiliser dans server.js/////////////////////////
module.exports = router;
