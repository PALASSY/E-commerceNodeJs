$(function(){

  //Declarer la clé Front(front-end)Stripe = secretKey
  //pk_test
  //Stripe rélié avec Js(footer)
  Stripe.setPublishableKey('pk_test_51IDsHsApMe34QWSx4mqk4VD22Nd3Vt9OhW3Dtklo8VUZmQykrvC2CHmzEwrSPdkjWkz78YWppA9GUt4DWLPLbXpK00UeEwjIXk');
  //Puis quand on soumet le formulaire(<form action="/payment" id="payment-form" method="post">)dans VIEW/main/cart.ejs, on execute ce code
  $('#payment-form').submit(function(e){
    e.preventDefault();
    //Ajout d'attribut (Desactiver) au bouton de ce formulaire
    //1er param c'est le nom de l'attribut
    //2em param c'est la valeur
    $('#submit-button').attr('disabled','disabled');
    //convertir les informations collectées de CB et les envoyé au serveur
    //1er argument récupération des infos grâce à createToken()
    //2èm argument c'est un rappel(stripeResponseHandler) pour gérer la reponse de Stripe
    Stripe.card.createToken({
                        name:$('#name-cart').val(),
                        number:$('#cart-number').val(),
                        cvc:$('#card-cvc').val(),
                        exp_month:$('#card-expiry-month').val(),
                        exp_year:$('#card-expiry-year').val()
                      },stripeResponseHandler);
  });
/**********************************function()********************************************************************/
//1er param c'est le code d'etat(200/400/401/402/403/404/409/500/502/503/504) codes de réponse HTTP conventionnels
//2em param ce sont les infos(id,name,adress...) envoyé par Stripe ou bien error
function stripeResponseHandler(status,response){
  if(response.error){
    //si il y a erreur on l'envoye à notre page (VIEW/main/cart.ejs)
    //error: message: "Your card's expiration year is invalid.", // Description of the error
    //response.error.message  = 'La carte d\'expriration est invalide';
    $('#payement-errors').html('<div class="alert alert-danger">' + response.error.message  + '</div>');
    //Suppression de l'attribut (Desactiver) au bouton pour pouvoir finir le payement
    //1er param c'est le nom de l'attribut à supprimer
    $('#submit-button').removeAttr('disabled');
  }else{
    var token = response['id'];
    var name = response.card.name;
    alert(name);
    var form = $('#payment-form');
    form.append('<input type="hidden" name="stripeToken" value="'+ token +'">');
    form.append('<input type="hidden" name="stripeTokenName" value="'+ name +'">');
    //On va soummettre le <form>
    form.get(0).submit();
  }
}



/************************************button plus***********************************/
//Quand le document est prêt et quand on click sur le boutton plus
//On lance une fonction comme param event
$(document).on('click','#plus',function(e){
  e.preventDefault();
  //On récupère les valeur des champs (prix/quantity(hidden))
  var priceValue = parseFloat($('#priceValue').val());
  var quantity = parseInt($('#quantity').val());
  //MAJ le prix de départ
  priceValue  += parseFloat($('#priceHidden').val());
  //Puis on incrémente de 1 la quantité(hidden)
  quantity ++;
  //Attribuer à la fin les nouvelles valeurs(quatity/price/total)
  $('#quantity').val(quantity);
  $('#priceValue').val(priceValue.toFixed(2));
  //Comme la quantity était hidden,maintenant on l'affiche sur total
  $('#total').html(quantity);
})


/************************************button minus************************************/
//Quand le document est prêt et quand on click sur le boutton minus
//On lance une fonction comme param event
$(document).on('click','#minus',function(e){
  e.preventDefault();
  //On récupère les valeur des champs (prix/quantity(hidden))
  var priceValue = parseFloat($('#priceValue').val());
  var quantity = parseInt($('#quantity').val());
  //Faire une condition que la quantité et la valeur ne descent pas en dessous de 1
  if(quantity === 1){
    quantity = 1;
    priceValue = $('#priceHidden').val();
  }else {
    //MAJ le prix de départ
    priceValue  -= parseFloat($('#priceHidden').val());
    //Puis on incrémente de 1 la quantité(hidden)
    quantity --;
  }
  //Attribuer à la fin les nouvelles valeurs(quatity/price/total)
  $('#quantity').val(quantity);
  $('#priceValue').val(priceValue.toFixed(2));
  //Comme la quantity était hidden,maintenant on l'affiche sur total
  $('#total').html(quantity);
});

});
