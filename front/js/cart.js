//-------------- API, récupération et sauvegarde du panier, tableaux  --------------//
//----------------------------------------------------------------------------------//

// Fonction pour récupérer la fiche produit avec l'ID correspondant 
async function getObjectWithId(id) {
  return await fetch(`http://localhost:3000/api/products/${id}`)
    .then((response) => response.json())
    .catch((error) => console.log(error))
}

// Récupération de mon panier depuis le localStorage, au cas où il existe
let basket = JSON.parse(window.localStorage.getItem("basket"))

// Fonction de sauvegarde du panier
function saveBasket(basket) {
  window.localStorage.setItem("basket", JSON.stringify(basket))
}

// Je convertis mon objet basket en tableau, pour pouvoir loop à l'intérieur
let productArray = []
for (let elem of Object.keys(basket)) {
  productArray.push(basket[elem])
}

// Création d'un tableau avec les ID pour récupérer les informations de l'API
// Objects.keys me permets de récupérer les propriétés propres à mon objet basket
let idArray = Object.keys(basket)

//----- Construction du DOM avec les infos croisées de l'API et du localStorage ----//
//----------------------------------------------------------------------------------//

// Déclaration de mon parent dans une constante pour construire mon DOM
const sectionCart = document.getElementById('cart__items')

// Création de l'article
function createNewArticle(product, color, quantity) {
  let sectionArticle = document.createElement('article')                
  sectionArticle.className = "cart__item"
  sectionArticle.setAttribute("data-id", product._id)
  sectionArticle.setAttribute("data-color", color)
  return sectionArticle
}

// Création de la div qui accueille l'image + Affichage de l'image et de son alt depuis l'API
function createDivImg(product) {
  const divImgCart = document.createElement('div')
  divImgCart.className = "cart__item__img"

  const imgCart = document.createElement('img')
  divImgCart.appendChild(imgCart)
  imgCart.src = product.imageUrl
  imgCart.alt = product.altTxt
  
  return divImgCart
}

// Création de la div "cart__item__content" + Appel des éléments à afficher
function createDivCartContent(parent, product, color, quantity) {
  const divCartContent = document.createElement('div')
  parent.appendChild(divCartContent)
  divCartContent.className = "cart__item__content"
  divCartContentDescription(divCartContent, product, color)
  divCartContentSettings(divCartContent, quantity)
}

// Création de la div "cart__item__content__titlePrice" + Appel des éléments à afficher
function divCartContentDescription(parent, product, color) {
  const cartContentDescription = document.createElement('div')
  parent.appendChild(cartContentDescription)
  cartContentDescription.className = "cart__item__content__titlePrice"
  fillDescriptionOfProduct(product, color, cartContentDescription)
  createPriceProduct(product, cartContentDescription)
}

// Affichage du nom du produit depuis l'API + Affichage de la couleur choisie depuis le localStorage
function fillDescriptionOfProduct(product, color, parent) {
  const nameOfProduct = document.createElement('h2')
  parent.appendChild(nameOfProduct)
  nameOfProduct.innerText = product.name

  const colorOfProduct = document.createElement('p')
  parent.appendChild(colorOfProduct)
  colorOfProduct.innerText = color
}

// Affichage du prix du produit depuis l'API
function createPriceProduct(product, parent) {
  const priceOfProduct = document.createElement('p')
  parent.appendChild(priceOfProduct)
  priceOfProduct.innerText = product.price + " €"
}

// Création de la div "cart__item__content__settings" + Appel des éléments à afficher
function divCartContentSettings(parent, quantity) {
  const cartContentSettings = document.createElement('div')
  parent.appendChild(cartContentSettings)
  cartContentSettings.className = "cart__item__content__settings"
  createProductQuantity(cartContentSettings, quantity)
  divDeleteItem(cartContentSettings)
}

// Création de la div + Affichage de la quantité voulue depuis le localStorage
function createProductQuantity(parent, quantity) {
  const divProductQuantity = document.createElement('div')
  parent.appendChild(divProductQuantity)
  divProductQuantity.className = "cart__item__content__settings__quantity"

  const quantityTitle = document.createElement('p')
  divProductQuantity.appendChild(quantityTitle)
  quantityTitle.innerText = "Quantité :"

  let input = createQuantityInput(quantity)

  divProductQuantity.appendChild(input)
}

// Création de l'input Quantité et de ses paramètres
function createQuantityInput(quantity) {
  const inputQuantity = document.createElement('input')
  inputQuantity.type ="number"
  inputQuantity.className = "itemQuantity"
  inputQuantity.name = "itemQuantity"
  inputQuantity.min = "1"
  inputQuantity.max = "100"
  inputQuantity.value = quantity

  return inputQuantity
}

function divDeleteItem(parent) {
  const divDelete = document.createElement('div')
  divDelete.className = "cart__item__content__settings__delete"
  parent.appendChild(divDelete)
  deleteItem(divDelete)
}

function deleteItem(parent) {
  const deleteProduct = document.createElement('p')
  deleteProduct.className = "deleteItem"
  parent.appendChild(deleteProduct)
  deleteProduct.innerText = "Supprimer"
}

//Fonction qui récupére les objets d'un tableau de tableau et qui crée mon article
function createArticles(productArray, product, idIndex) {
  for (let array of productArray) {
    // Je store l'index de mon tableau pour m'assurer que les infos correspondent au bon id
    let arrayIndex = productArray.indexOf(array)
    // Si mes deux index correspondent, ma fonction crée un nouvel article            
    if (idIndex === arrayIndex) {  
      for (let object of array) {
        let color = object.color
        let quantity = object.quantity
        let article = createNewArticle(product, color, quantity)
        let divImgCart = createDivImg(product, article)
        article.appendChild(divImgCart)
        createDivCartContent(article, product, color, quantity)
        sectionCart.appendChild(article)
      }
    }
  }
}

//------------ Gestion de la quantité totale et du prix total du panier ------------//
//----------------------------------------------------------------------------------//

// Collecte des données de l'input Quantité
function inputDataQuantity() {
  // Récupération de la NodeList des éléments du document, correspondant au selecteur css ciblé
  let inputsValue = document.querySelectorAll(".itemQuantity")
  let totalQuantity = 0                                         
  for (let input of inputsValue) {
    totalQuantity = totalQuantity += Number(input.value)
    document.getElementById("totalQuantity").innerText = totalQuantity
  }
}

// Pour chaques articles, collecte des données de l'input Quantité et infos du prix depuis l'API
async function getTotalPrice() {
  let allProductInBasket = document.querySelectorAll("article.cart__item")
  let totalPrice = 0
  for (let article of allProductInBasket) {
    let numberOfProducts = Number(article.querySelector(".itemQuantity").value)
    let productsId = article.getAttribute("data-id")
    let product = await getObjectWithId(productsId)
    let itemPrice = product.price
    totalPrice = totalPrice += Number(numberOfProducts *= itemPrice)
    document.getElementById("totalPrice").innerText = totalPrice
  }
}

//-------------- Modification de la quantité et mise à jour du prix ----------------//
//----------------------------------------------------------------------------------//

function quantityChange() {
  //1 Je déclare une variable qui va indiquer sur quel selecteur CSS va s'effectuer le changement
  let quantityInputs = document.querySelectorAll("input.itemQuantity")
  for (let input of quantityInputs) {
    input.addEventListener('change', () => {
      // Mise à jour de la quantité
      inputDataQuantity()
      // Mise à jour du prix
      getTotalPrice()
    })
  }
}

//-------------------------- Suppression d'un article ------------------------------//
//----------------------------------------------------------------------------------//

function removeProductFromBasket() {
  let deleteButtons = document.querySelectorAll("p.deleteItem")
  for (let deleteButton of deleteButtons) {
    deleteButton.addEventListener('click', () => {
      let articleToRemoveTargeted = deleteButton.closest('article.cart__item')
      let articleIdToDelete = articleToRemoveTargeted.getAttribute("data-id")
      let articleColorToDelete = articleToRemoveTargeted.getAttribute("data-color")
      let basket = JSON.parse(window.localStorage.getItem("basket"))
      let targetedProductsToDelete = basket[articleIdToDelete]
      for (let targetedProductToDelete of targetedProductsToDelete) {
        if (targetedProductToDelete.color == articleColorToDelete) {
          let indexOfTargetDelete = targetedProductsToDelete.indexOf(targetedProductToDelete)
          targetedProductsToDelete.splice(indexOfTargetDelete, 1)
          if (targetedProductsToDelete.length == 0) {
            delete basket[`${articleIdToDelete}`]
          }
          window.localStorage.setItem('basket', JSON.stringify(basket))
          articleToRemoveTargeted.parentNode.removeChild(articleToRemoveTargeted)
        }
      }
      inputDataQuantity()
      getTotalPrice()
    })
  }
}

//------------------------------ Gestion du panier ---------------------------------//
//----------------------------------------------------------------------------------//

// Fonction qui vérifie que les indices de mes tableaux correspondent, puis crée mes articles
async function fillProductPage() {
  for (let id of idArray) {
    let idIndex = idArray.indexOf(id)
    let product = await getObjectWithId(id)                   
    createArticles(productArray, product, idIndex)
  }
}

// Fonction qui attend la création de l'article, puis met à jour le panier à chaque modification
async function manageBasket() {
  await fillProductPage()
  inputDataQuantity()
  getTotalPrice()
  quantityChange()
  removeProductFromBasket()
  //saveBasket() après modif du panier et reload de la page ne fonctionne pas
}
manageBasket()

//------------ Mise en place des regex pour la validation de formulaire ------------//
//----------------------------------------------------------------------------------//


//------------------------ Affichage du numéro de commande -------------------------//
//----------------------------------------------------------------------------------//
































