//Inclure la page Cart(qui contient toutes les données de Cart)
//Utilisation de majuscule parceque c'est une class
var Cart = require('../models/cart');

/**********************************Exportation des données***********************************************************/
//Exporter les données grace à une function(requête/action/callback)
module.exports = function(request,response,next){
  ////////////////////////vérifié si l'utilisateur existe (faire une requête)//////////////////////////////:
  if(request.user){
    //Initialiser une variable
    var total = 0;
    ////////////////////////Chercher son panier(le panier de user)////////////////////////////:
    //Recherche un seul champ dans le fichier Cart dans la BDD
    //1er param c'est le champ à chercher(owner de la Cart dans BDD) correspond à l'Id(user)
    //2em param c'est une function qui porte(erreur,panier)
    Cart.findOne({owner:request.user._id},function(err,cart){
      ////////////////////Si on trouve le panier, on fait une boucle de ce panier///////////////////////
      if(cart){
        //Tant que l'index(les éléments qui composent le panier) < à la longeur les élémnts qui composent le panier , on increment de 1-->
        for(var i = 0; i < cart.items.length; i++){
          // Rajouter le variable à la quantité de ces éléments qui composent le panier
          total += cart.items[i].quantity;
          }
          //l'action envoyer à toutes les pages le param Cart = la variable total
          response.locals.cart = total;

      }else{
        ///////////////////////Si on ne trouve pas le panier://///////////////////////////
        //l'action envoyer à toutes les pages le param Cart = 0
        response.locals.cart = 0;
      }
      ////////////////////Qu'on trouve ou pas le panier, on fait un callback(passe au code suivant)////////////////////////
      next();
    });
  }else{
    ////////////////////////Si l'utilisateur n'existe pas:on fait un callback(passe au code suivant)//////////////////////////////:
    next();
  }
}
