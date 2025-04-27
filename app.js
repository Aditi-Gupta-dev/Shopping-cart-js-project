const cartBtn = document.querySelector(".cart-btn");
const cartItems = document.querySelector(".cart-items");
const cartOverlay = document.querySelector(".cart-overlay");
const cartDOM = document.querySelector(".cart");
const cartContent = document.querySelector(".cart-content");
const clearCartBtn = document.querySelector(".clear-cart ");
const closeCartBtn = document.querySelector(".close-cart ");
const cartTotal = document.querySelector(".cart-total ");
const productDOM = document.querySelector(".product-center ");

/* --trying to get bag-btns before rndering them
const bagBtns = document.querySelectorAll(".bag-btn");
console.log(bagBtns); 
gives
NodeList[]
length:0
*/

//cart
let cart = [];
// getting products from class

let buttonsDOM = [];
class Products {
  // --- function to fetch products from json file --
  async getproducts() {
    try {
      const result = await fetch("products.json");
      //return result;  // this gives hard coded result its better to convert in into json

      const data = await result.json();
      //   return data;
      // by this i m getting an array of objects , but it has many values and i nedd some vallue to be displayed in the product-item card, its better to further destructure it using map();

      //taking products array of data.items
      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };

        /*this return ::
         0: {title: 'queen panel bed', price: 10.99, id: '1', image: './images/product-1.jpeg'}
         1: {title: 'king panel bed', price: 12.99, id: '2', image: './images/product-2.jpeg'}
         2: {title: 'single panel bed', price: 12.99, id: '3', image: './images/product-3.jpeg'}
         3:{title: 'twin panel bed', price: 22.99, id: '4', image: './images/product-4.jpeg'}
         4: {title: 'fridge', price: 88.99, id: '5', image: './images/product-5.jpeg'}
         5: {title: 'dresser', price: 32.99, id: '6', image: './images/product-6.jpeg'}
         6: {title: 'couch', price: 45.99, id: '7', image: './images/product-7.jpeg'}
         7: {title: 'table', price: 33.99, id: '8', image: './images/product-8.jpeg'}
         length: 8
*/
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

//Ui class to display products
class UI {
  //home page me product list show krne ke lia ,ye method hai jo call hoga to products array le har item ke lia ek product-card generate krega or innerHtml me add krega
  displayProducts(products) {
    console.log("Tis is the product array", products);
    let result = "";

    products.forEach((proitem) => {
      result += `<article class="product">
          <div class="img-container">
            <img
              class="product-img"
              src="${proitem.image}"
              alt="product 1"
            />
            <button class="bag-btn" data-id=${proitem.id}>
              <i class="fa-solid fa-bag-shopping"></i>Add to cart
            </button>
          </div>
          <h3 class="title">${proitem.title}</h3>
          <h4>$${proitem.price}</h4>
        </article>`;
    });
    // console.log("this is the result string which we are addint to productDOM",result);
    productDOM.innerHTML = result;
  }
  getBagBtn = () => {
    const bagBtns = [...document.querySelectorAll(".bag-btn")];
    //nodelist to array converion using spread operator
    console.log(bagBtns);
    buttonsDOM = bagBtns; //storing bagbtns for future use

    // sare buttons ka access lenge or modify krenge according to event
    bagBtns.forEach((button) => {
      let id = button.dataset.id;
      let InCart = cart.find((item) => item.id === id);
      //product to add to cart kr dia to wapas add nhi kr skte isilia cart check with id matching
      if (InCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", (e) => {
        e.target.innerText = "In Cart";
        e.target.disabled = true;
        //get product from products -> local storage se uthao or amount set kro 1
        let cartItem = { ...Storage.getProducts(id), amount: 1 };
        // console.log(cartItem);

        //add product to the cart array ( this cart array is for storage purpose)
        cart = [...cart, cartItem];
        //save cart in local storage
        Storage.saveCart(cart);
        //set cart values
        this.setCartValues(cart);
        //display cart item in the cart-overlay
        this.addCartItem(cartItem);
        //show cart overlay
        this.showCart(cart);
      });
    });
  };
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;

    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartItems.innerText = itemsTotal;
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    console.log(cartItems, cartTotal);
  }

  //function to display items to cart-overlay
  addCartItem(cartItem) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
        <img src="${cartItem.image}" alt="product" />
            <div>
              <h4>${cartItem.title}</h4>
              <h5>$${cartItem.price}</h5>
              <span class="remove-item" data-id=${cartItem.id}>remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id=${cartItem.id}></i>
              <p class="item-amount">${cartItem.amount}</p>
              <i class="fas fa-chevron-down" data-id=${cartItem.id}></i>
            </div>`;
    cartContent.appendChild(div);
    console.log(cartContent);
  }
  showCart(cart) {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  //setting up the application function running after page refresh having all eventlisteners
  setupApp() {
    //   cart will be updated from the local storage
    cart = Storage.getCartOnRefresh();
    this.setCartValues(cart);
    this.addCartItemsOnRefresh(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  //fuction to add saved products from retrived cart(from local storage) back to overlay
  addCartItemsOnRefresh(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }

  //function to cloe the cart
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  //clear the cart
  cartLogic() {
    //only clicking th eclar cart btn
    clearCartBtn.addEventListener("click", () => this.clearCart());
    //Remove incerease and decrease
    cartContent.addEventListener("click", (e) => {
      //   console.log(e.target);

      //agar remove element me click kia to hi remove hoga pura cart-item
      if (e.target.classList.contains("remove-item")) {
        let removeItem = e.target;
        //id slect kro remove hone wlae item ka
        let id = removeItem.dataset.id;

        //   ui se delect kro
        cartContent.removeChild(removeItem.parentElement.parentElement);
        //   localStorage or cart [] se delete kro
        this.removeItem(id);
      } else if (e.target.classList.contains("fa-chevron-up")) {
        // icon ko select kia
        let IncAmount = e.target;
        //product id select kia
        let id = IncAmount.dataset.id;

        //ab cart arry me wo id ka product find kro or amount increase kro
        let selecteditem = cart.find((item) => item.id === id);
        selecteditem.amount += 1;

        // storage me update kro or cartoverlay me values update kro
        Storage.saveCart(cart);
        this.setCartValues(cart);

        //amount number increase kro 1 se 2 se 3....
        IncAmount.nextElementSibling.innerText = selecteditem.amount;
      } else if (e.target.classList.contains("fa-chevron-down")) {
        // icon ko select kia
        let decAmount = e.target;
        //product id select kia
        let id = decAmount.dataset.id;

        //ab cart arry me wo id ka product find kro or amount increase kro
        let selecteditem = cart.find((item) => item.id === id);
        selecteditem.amount -= 1;

        if (selecteditem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          decAmount.previousElementSibling.innerText = selecteditem.amount;
        } else {
          cartContent.removeChild(decAmount.parentElement.parentElement);
          this.removeItem(id);
        }

        // storage me update kro or cartoverlay me values update kro

        //amount number increase kro 1 se 2 se 3....
      }
    });
  }
  clearCart() {
    //   get all cart item ids
    let cartitems = cart.map((item) => item.id);
    console.log(cartitems);
    cartitems.forEach((id) => this.removeItem(id));
    //clear the cart ui
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
  }
  removeItem(id) {
    // jo id ko remove krna hai usko cart se hatao =>filter kro
    cart = cart.filter((item) => item.id !== id);
    //set the cart values
    this.setCartValues(cart);
    //save cart to local storage
    Storage.saveCart(cart);
    //   button ka inner html update kr ke add to cart kro
    let button = this.getSingleBtn(id);
    button.disabled = false;
    button.innerText = `Add to Cart`;
  }
  getSingleBtn(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

//local storage
class Storage {
  //static bana rahe to object insatance ki need nahi direct call kr lenge
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProducts(id) {
    //   geeting the whole product array
    let products = JSON.parse(localStorage.getItem("products"));
    // extracting the item we want matching the id
    return products.find((item) => item.id == id);
  }
  // saving the cart items to the local storage
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCartOnRefresh() {
    if (JSON.parse(localStorage.getItem("cart")).length === 0) {
      return [];
    } else {
      return JSON.parse(localStorage.getItem("cart"));
    }
    // return localStorage.getItem("cart")
    //   ? JSON.parse(localStorage.getItem("art"))
    //   : [];
  }
}
// --LOGIC--
//mujhe sare items chahia wo access krne ke lia sab ka add-item btn access kro q ki usme id hai ...id hai to sara data product ka fetch ho jaega ....to btn ko access krne ke lia global way use krenge to hame ek empty nodelist milegi q ki product data to hm baad me render krwa rahe hai .. display products ke baad btn to access kro...to hm chaining krenge getproducts se hm data render kenge uske baad hi bagBtns access krenge or baki fucntionc krenge
document.addEventListener("DOMContentLoaded", () => {
  const products = new Products();
  const ui = new UI();

  //setup the application after refresing the page before the product loads
  ui.setupApp();
  products
    .getproducts()
    .then((products) => {
      // console.log(products);
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagBtn();
      ui.cartLogic();
    });
});
