/***********************Mongoose bcrypt-nodejs****************************************/
//Inclure mangoose(connexion entre node et mangoDB)
var mongoose = require('mongoose');
//Inclure bcrypt-nodejs pour crypter les mots de passe avant même qu'il soit entrée dans BDD
var bcrypt = require('bcrypt-nodejs');
//Inclure la bibliothèque crypto(présent par défaur dan NodeJs) pour crypter l'avatar afin que chaque utilisateur possède un avatar unique
var crypto = require('crypto');

/*******************************Utilisation de mangoose et node***************************/
//methode mangoose Schema  permet de connecter node et mangooDB(avec methode plus simple) c'est une passerelle
var Schema = mongoose.Schema;
//Création du modèle(class) pour User
var UserSchema = new Schema({
  //Pour créer l'utilisateur il faut:
  //JS n'est pas typé on va préciser le type
  email:{
          type:String,
          unique:true,
          lowercase:true
        },
  password:String,
  profile:{
            name:{type:String,default:""},
            picture:{type:String,default:""}
          },
  address:String,
  history:[{
            date: Date,
            paid:{type:Number,default:0}
          }]
});

/************************Utilisation de bcrypt-nodejs pour le salage et le cryptage de mot de passe***************************/
///////////////////////////////Execution des function l'une après l'autre//////////////////////////////
//pre => les fonctions s'executent l'une après l'autre quand elles appellent le callback(n'arrête pas les code)
//1er param c'est le (sauvegarder à chaque fois) parceque (Mangoose n'et pas self invocking)
//2em param c'est une fonction(callback pour continuer le code)
UserSchema.pre('save',function(next){
  //Stocker l'utilisateur
  var user = this;
  //////////////////////////Si le mot de passe de user n'a pas été modifié,continue le callback////////////////////
  //Seulement crypter le mot de passe s'il a été modifié ou créer
  //pas besoin de faire à chaque fois
  //isModified(methode de bcrypt-nodejs)
  //param c'est le password
  if(!user.isModified('password')) return next();
  ///////////////////////////Si  l'user est modifié on génère le Salt()////////////////////////////////
  //genSalt(methode bcrypt-nodejs qui génère de salt) qui permet de salé le mot de passe
  //1er param c'est la valeur de saltRound(),plus il est élévé plus l'algorythme prend du temps
  //2èm param c'est une fonction(le rappel d'erreur et le sel retourné)
  bcrypt.genSalt(10,function(err,salt){
    //Si il y a une erreur dans la génération de Salt()continue le callback next et next retourne l'erreur(mais on ne casse pas tout ou arrêter le code)
    if(err) return next(err);
    //Sinon on passe au cryptage de mot de passe avec le nouveau Salt()
    //1er param c'est le mot de passe(le mot de passe de l'utilisateur)
    //2em param c'est le noueau Salt()
    //3èm param c'est
    //4ém param c'est un fonction(l'erreur de cryptage,le hachage retourné)
    bcrypt.hash(user.password,salt,null,function(err,hash){
      //Si il y a une erreur, dans le cryptage, on continue le callback next() et il retoune l'erreur(mais on ne casse pas tout ou arrêter le code)
      if(err) return next(err);
      //Si pas d'erreur de cryptage, on hache le mot de passe
      //On affecte le mot de passe de l'user au hachage retourné
      user.password = hash;
      //On ne s'arrête pas là, on passe à autre chose
      next();
    });
  });
});
/////////////////////////////Comparaison de mot de passe présenté par l'user à celui dans BDD/////////////////////////
//Créer une fonction personnalisé avec Mongoose
//Créer une methode qui se nomme: comparePassword (function(mot de passe entrée,la requête))
UserSchema.methods.comparePassword = function(password,request){
  //comparaison des cryptages
  //compareSync => comparer et synchtroniser
  //1er param c'est le mot de passe entrée par l'user
  //2em param c'est le mot de passe dans BDD
  return bcrypt.compareSync(password,this.password);
}


/**********************************AVATAR***********************************************************/
//Créer une fonction personnalisé avec Mongoose
//Créer une methode qui se nomme:gravatar(function(taille de l'image))
UserSchema.methods.gravatar = function(size){
  //////////////////////////Si l'avatar de l'user ne possède pas de taille, on attribut une taille(200)//////////////////////////
  if(!this.size) size=200;
  ///////////////////////////Si l'email ne correspond pas à la page profile,on retourne un avatar aléatoire////////////////////////////
  if(!this.email) return 'https://gravatar.com/avatar/?s=' + size + '&r=pg&d=robohash';
  /////////////////////////Crypter l'avatar afin que chaque utilisateur ait une image unique ////////////////////
  //crypto c'est une librairie qui existe par défaut dans NODEJS, il suffit juste de le déclarer
  //createHash(NodeJs crée le hachage md5 à partir d'une string)
  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  ///////////////////////////retourner l'avatar crypté//////////////////////////////////
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&r=pg&d=robohash';
}





/**********************************Exportation des données***********************************************************/
/////////////////////////////Exporter ces codes(mangoose et Node) pour réutiliser dans une autre page/////////////////////////
//Exporter le module(toutes les données)
//On le nommera: model
//1er param c'est la collection(User) utilisé dans BDD
//2em param c'est le model utilisateur(ce tout ce qui se trouve dans la collection)
module.exports = mongoose.model('User', UserSchema);
