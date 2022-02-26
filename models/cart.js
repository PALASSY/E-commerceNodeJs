/**************************Mongoose bcrypt-nodejs**********************************************/
//Inclure mangoose(connexion entre node et mangoDB)
var mongoose = require('mongoose');


/*******************************Utilisation de mangoose et node***************************/
//methode mangoose Schema  permet de connecter node et mangooDB(avec methode plus simple) c'est une passerelle
var Schema = mongoose.Schema;
//Création du modèle(class) pour Catégorie
var CartSchema = new Schema({
  //Que contient le panier :
  //le propriaitaire
  owner : {
              type: Schema.Types.ObjectId,
              ref:'User'
            },
  //la totalité du panier
  total : {
            type: Number,
            default: 0
          },
  //les élémnts qui composent le panier
  items : [{
              item : {
                        type: Schema.Types.ObjectId,
                        ref: 'Product'
                     },
              quantity : {
                            type : Number,
                            default : 1
                          },
              price : {
                        type: Number,
                        default: 0
                      }
              }]
});




/**********************************Exportation des données***********************************************************/
/////////////////////////////Exporter ces codes(mangoose et Node) pour réutiliser dans une autre page/////////////////////////
//Exporter le module(toutes les données)
//On le nommera: model
//1er param c'est la collection(Cart) utilisé dans BDD
//2em param c'est le model panier(ce tout ce qui se trouve dans la collection)
module.exports = mongoose.model('Cart', CartSchema);
