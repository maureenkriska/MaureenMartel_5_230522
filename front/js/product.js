//----------------------------------------------------------------------------------//
//---------------------------- Afficher la page produit ----------------------------//
//----------------------------------------------------------------------------------//

// --- Rechercher l'URL du produit avec son ID
function getUrlParamsId() {
  const urlRequest = window.location.search
  const urlParameters = new URLSearchParams(urlRequest)
  const id = urlParameters.get('id')
  return id
}

// --- Constante pour stocker le résultat de l'appel à l'API
const id = getUrlParamsId()

// --- Fonction pour récupérer la fiche produit avec l'ID correspondant
async function getObjectWithId() {
  return await fetch(`http://localhost:3000/api/products/${id}`)
    .then((response) => response.json())
    .catch((error) => console.log(error))
}

// --- Fonction pour créer une image (src + alt)
function createNewImage(product) {
  let newImage = document.createElement('img')
  newImage.src = product.imageUrl
  newImage.alt = product.altTxt
  document.querySelector(".item__img").appendChild(newImage)
}

// --- Fonction pour modifier le contenu de l'id "title"
function fillNewTitle(product) {
  let newTitle = document.getElementById('title')
  newTitle.innerText = product.name
}

// --- Fonction pour modifier le contenu de l'id "price"
function fillNewPrice(product) {
  let newPrice = document.getElementById('price')
  newPrice.innerText = product.price
}

// --- Fonction pour modifier le contenu de l'id "description"
function fillNewDescription(product) {
  let newDescription = document.getElementById('description')
  newDescription.innerText = product.description
}

// --- Fonction pour créer une option (choix des coloris)
function createNewOption(color) {
  let newOption = document.createElement('option')
  newOption.setAttribute("value", color)
  newOption.value = color
  newOption.innerText = color
  return newOption
}

// --- Fonction pour ajouter les coloris disponibles des différents articles
function fillColors(product) {
  for (let color of product.colors) {
    let newColor = createNewOption(color)
    document.getElementById('colors').appendChild(newColor)
  }
}

// --- Fonction qui attends le résultat de getObjectWithId -> product, pour modifier le contenu de la page produit
async function fillProductPage() {
  const product = await getObjectWithId()
  createNewImage(product)
  fillNewTitle(product)
  fillNewPrice(product)
  fillNewDescription(product)
  fillColors(product)
}

fillProductPage()

//----------------------------------------------------------------------------------//
//-------------------------- Ajout des produits au panier --------------------------//
//----------------------------------------------------------------------------------//

// --- Fonction pour stocker un item dans le localStorage (+ Evite de me répéter et limite les erreurs de synthaxe)
function saveBasket(basket) {
  window.localStorage.setItem("basket", JSON.stringify(basket))
}

// --- Vérifier la sélection d'une couleur
function checkColor() {
  let selectedColor = document.getElementById('colors').value
  if (selectedColor !== "" ) {
    return document.getElementById('colors').value
  } else {
    return undefined
  }
}

// --- Vérifier la sélection d'une quantité
function checkQuantity() {
  let definedQuantity = document.getElementById('quantity').value
  if (definedQuantity >= 1 && definedQuantity <= 100) {
    return document.getElementById('quantity').value
  } else {
    return undefined
  }
}

// --- Création d'un objet pour stocker la couleur et la quantité et l'ajouter au tableau idProduct
function pushNewObject(array, newColorAdded, newQuantityAdded) { 
  let newObject = {
    //Seront configurés lors de l'appel de la fonction dans mon eventListener
    color : newColorAdded,                  
    quantity : Number(newQuantityAdded)     
  }
  array.push(newObject)
}

// --- Création d'une nouvelle propriété pour push la couleur et la quantité dans mon tableau basket[id]
function createIdProperty(basket, selectedColor, quantitySelected) { 
  basket[id] = []
  pushNewObject(basket[id], selectedColor, quantitySelected)
}

// --- Vérifie si la couleur selectionnée n'est pas déjà présente dans le panier (basket)
function colorAlreadySelected(array, colorFound) {
  for (let object of array) {
    if (object.color == colorFound) {
      return true
    //} else {
    //  return false
    }
  }
  return false //replacement de la vérification négative au bon endroit.
}

//----------------------------------------------------------------------------------//
//------------------ EventListener de bouton "Ajouter au panier" -------------------//
//----------------------------------------------------------------------------------//

function addToCartEventListener() {
  let button = document.getElementById('addToCart')
    button.addEventListener("click", () => {
      let selectedColor = checkColor()
      let quantitySelected = checkQuantity()
      if ((checkColor() && checkQuantity()) !== undefined) {                    
        // Cas n°1 : Mon panier n'existe pas
        if (!window.localStorage.getItem("basket")) {                           
          let basket = {}                                                                     
          createIdProperty(basket, selectedColor, quantitySelected)             
          saveBasket(basket)                                                    
          popupConfirmation()
        } else {
          let basket = JSON.parse(window.localStorage.getItem("basket"))        
          // Cas n°2 : Mon panier ne contient pas de propriété avec le bon id
          if (!basket.hasOwnProperty(id)) {                                     
            createIdProperty(basket, selectedColor, quantitySelected)
            saveBasket(basket)
            popupConfirmation()
          } else {
            // Cas n°3 : Mon ID est présent mais la couleur non
            if (!colorAlreadySelected(basket[id], selectedColor)) {             
              pushNewObject(basket[id], selectedColor, quantitySelected)        
              saveBasket(basket)
              popupConfirmation()
            } else {
              // Cas n° 4 : Ajout d'un article dont la couleur est déjà présente dans le panier
              for (let object of basket[id]) {                                  
                if (object.color === selectedColor) {                           
                  object.quantity = object.quantity += Number(quantitySelected) 
                  // Je limite ma quantité storée à 100 articles
                  if (object.quantity > 100)  {                                 
                    object.quantity = 100                                       
                  }
                  saveBasket(basket)
                  popupConfirmation()                                 
              }
            }          
          }
        }
      }
    } else {
      window.alert("Veuillez sélectionner une couleur ainsi que la quantité souhaitée (de 1 à 100) pour votre produit.")
    }
  })
}
addToCartEventListener()

//----------------------------------------------------------------------------------//
//------------- Création d'une pop-up de confirmation d'ajout au panier ------------//
//----------------------------------------------------------------------------------//

function popupConfirmation() {
  if (window.confirm(`Le produit a bien été ajouté à votre panier. Pour consulter le panier, cliquez sur "OK". Pour continuer vos achats, cliquez sur "ANNULER"`)) {
    window.location.href = "cart.html"
  } else {
    window.location.href = "index.html"
  }
}



















