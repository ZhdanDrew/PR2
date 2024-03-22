const shopApi = new API("https://fakestoreapi.com/products", {
  "Content-Type": "application/json",
});

const cartApi = new API("https://fakestoreapi.com/carts/1", {
  "Content-Type": "application/json",
});

// if you are getting an error 522
// add your localhost link
// http://127.0.0.1:5501/JS/Shop/

const localCartApi = new API("http://127.0.0.1:5501/JS/Shop/js/cart.json", {
  "Content-Type": "application/json",
});

const localProductsApi = new API(
  "http://127.0.0.1:5501/JS/Shop/js/products.json",
  {
    "Content-Type": "application/json",
  }
);

localCartApi.get("").then((data) => console.log(data, "!!!!!"));
localProductsApi.get("").then((data) => console.log(data, "!!!!!"));

class Cart {
  constructor(cartElements = []) {
    this.cartElements = cartElements;
    this.view = document.querySelector("#cart-items");
    this.totalPriceButton = document.querySelector("#buy-all-btn");
    this.cartElementsCount = document.querySelector("#cart-count");

    this.getInitialCart().then(() => this.render(this.view));
  }

  async getInitialCart() {
    const initialCart = await cartApi.get("/");
    const products = await shopApi.get("/");

    this.cartElements = initialCart.products.map((productData) => {
      const product = products.find((pr) => pr.id === productData.productId);
      return new Item(product, productData.quantity);
    });

    return initialCart;
  }

  calculateTotalElementsQuantity() {
    return this.cartElements.reduce((acc, item) => {
      return acc + item.quantity;
    }, 0);
  }

  calculateTotalPrice() {
    const finalPrice = this.cartElements.reduce((acc, item) => {
      return acc + item.itemData.price * item.quantity;
    }, 0);

    return finalPrice.toFixed(2);
  }

  calculateItemQuantity(item) {
    const cartItem = this.cartElements.find(
      (currentCartItem) => currentCartItem.itemData.id === item.itemData.id
    );

    return !cartItem ? 0 : cartItem.quantity;
  }

  async add(item) {
    const currentItemQuantity = this.calculateItemQuantity(item);
    item.quantity = currentItemQuantity ? currentItemQuantity + 1 : 1;

    if (item.quantity === 1) {
      this.cartElements.push(item);
    } else {
      const cartElement = this.cartElements.find(
        (cartItem) => cartItem.itemData.id === item.itemData.id
      );
      cartElement.quantity = item.quantity;
    }

    const response = await cartApi.patch("", null, {
      userId: 1,
      products: this.cartElements.map((item) => ({
        productId: item.itemData.id,
        quantity: item.quantity,
      })),
    });

    this.render(this.view);

    console.log(response, "response");
    console.log(this.cartElements);
  }

  async remove(item) {
    const currentItemQuantity = this.calculateItemQuantity(item);
    item.quantity = currentItemQuantity === 1 ? 0 : currentItemQuantity - 1;

    if (item.quantity === 0) {
      this.cartElements = this.cartElements.filter(
        (cartItem) => cartItem.itemData.id !== item.itemData.id
      );
    } else {
      const cartElement = this.cartElements.find(
        (cartItem) => cartItem.itemData.id === item.itemData.id
      );

      cartElement.quantity = item.quantity;
    }

    const response = await cartApi.patch("", null, {
      userId: 1,
      products: this.cartElements.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    });

    this.render(this.view);

    console.log(response, "response");
    console.log(this.cartElements);
  }

  async removeAll(item) {
    this.cartElements = this.cartElements.filter(
      (cartItem) => cartItem.itemData.id !== item.itemData.id
    );

    const response = await cartApi.patch("", null, {
      userId: 1,
      products: this.cartElements.map((item) => ({
        productId: item.itemData.id,
        quantity: 0,
      })),
    });
    console.log(response, "response");

    this.render(this.view);
  }

  render(parent) {
    this.totalPriceButton.textContent = `Buy all for: ${this.calculateTotalPrice()} $`;
    this.cartElementsCount.textContent = this.calculateTotalElementsQuantity();

    parent.innerHTML = "";

    this.cartElements.forEach((item) => {
      item.render(parent);
    });
  }
}

const cart = new Cart();

class Catalog {
  constructor(items = []) {
    this.items = items;
    this.view = document.querySelector("#catalog-items");

    this.getCatalogItems().then(() => this.render(this.view));
  }

  async getCatalogItems() {
    const items = await shopApi.get("/");
    this.items = items.map((item) => new Item(item));
    console.log(items);

    return this;
  }

  render(parent) {
    this.items.forEach((item) => {
      item.render(parent);
    });
  }
}

class Item {
  static initialItemData = {
    id: 0,
    title: "",
    category: "",
    description: "",
    image: "",
    price: 0,
    rating: { rate: 0, count: 0 },
  };

  constructor(itemData = Item.initialItemData, quantity = 0) {
    this.itemData = itemData;
    this.quantity = quantity;
  }

  render(parent) {
    const isAddedToCart = cart.cartElements.some(
      (cartElement) => cartElement.itemData.id === this.itemData.id
    );

    parent.innerHTML += `
    <div class="item-card">
        <img src=${this.itemData.image} />
        <article>
            <h3>${this.itemData.title}</h3>
            <p>${this.itemData.description.slice(0, 100)}...</p>
            <p>${this.itemData.category}</p>
            <p>${this.itemData.rating.rate}</p>
        </article>
        ${
          this.quantity
            ? `<h4>Quantity: ${this.quantity}</h4>
              <h4>Price: ${this.itemData.price * this.quantity} $</h4>
              `
            : `<h4>Price: ${this.itemData.price} $</h4>`
        }
        ${
          isAddedToCart
            ? `<div class="buttons-wrapper">
                <button 
                  id="btn-cart-${this.itemData.id}" 
                  class="add-to-cart-btn remove-button" 
                  data-itemId="${this.itemData.id}">Remove one
                </button>
                <button 
                  id="btn-cart-${this.itemData.id}-remove-all"
                  class="remove-all-button"
                  data-itemId="${this.itemData.id}"
                >Remove all items</button>
              </div>`
            : `<button 
            id="btn-catalog-${this.itemData.id}"
            class="add-to-cart-btn" 
            data-itemId="${this.itemData.id}">Add to cart
          </button>`
        }
    </div>
    `;

    // TODO: find better way (CustomHTMLElement)
    setTimeout(() => {
      const catalogButton = document.querySelector(
        `#btn-catalog-${this.itemData.id}`
      );

      const cartButton = document.querySelector(
        `#btn-cart-${this.itemData.id}`
      );

      const removeAllFromCartButton = document.querySelector(
        `#btn-cart-${this.itemData.id}-remove-all`
      );

      catalogButton.onclick = () => {
        cart.add(this);
      };

      cartButton.onclick = () => {
        cart.remove(this);
      };

      removeAllFromCartButton.onclick = () => {
        cart.removeAll(this);
      };
    });
  }
}

const catalog = new Catalog();
