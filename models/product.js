/**************************Mongoose bcrypt-nodejs**********************************************/
//Inclure mangoose(connexion entre node et mangoDB)
var mongoose = require('mongoose');


/*******************************Utilisation de mangoose et node***************************/
//methode mangoose Schema  permet de connecter node et mangooDB(avec methode plus simple) c'est une passerelle
var Schema = mongoose.Schema;
//Création du modèle(class) pour Produit
var ProductSchema = new Schema({
  //Pour créer l'utilisateur il faut:
  //JS n'est pas typé on va préciser le type
  category: {
              type:Schema.Types.ObjectId,
              ref:'Category'
            },
  name:String,
  price: Number,
  image: String
});


/**********************************Exportation des données***********************************************************/
/////////////////////////////Exporter ces codes(mangoose et Node) pour réutiliser dans une autre page/////////////////////////
//Exporter le module(toutes les données)
//On le nommera: model
//1er param c'est la collection(User) utilisé dans BDD
//2em param c'est le model utilisateur(ce tout ce qui se trouve dans la collection)
module.exports = mongoose.model('Product', ProductSchema);
