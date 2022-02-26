/**************************Mongoose bcrypt-nodejs**********************************************/
//Inclure mangoose(connexion entre node et mangoDB)
var mongoose = require('mongoose');


/*******************************Utilisation de mangoose et node***************************/
//methode mangoose Schema  permet de connecter node et mangooDB(avec methode plus simple) c'est une passerelle
var Schema = mongoose.Schema;
//Création du modèle(class) pour Catégorie
var CategorySchema = new Schema({
  //Pour créer l'utilisateur il faut:
  //JS n'est pas typé on va préciser le type
  name: {
         type:String,
         unique:true,
         lowercase:true
        }
});


/**********************************Exportation des données(envoyer dans server.js)***********************************************************/
/////////////////////////////Exporter ces codes(mangoose et Node) pour réutiliser dans une autre page/////////////////////////
//Exporter le module(toutes les données)
//On le nommera: model
//1er param c'est la collection(User) utilisé dans BDD
//2em param c'est le model utilisateur(ce tout ce qui se trouve dans la collection)
module.exports = mongoose.model('Category', CategorySchema);
