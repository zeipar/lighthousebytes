$(() => {
  window.onscroll = () => makeSideSticky();

  const sideBar = $('#cart');
  // height of current navBar = 62px + margin around 28px;
  const sticky = sideBar[0].offsetTop - 90;

  const makeSideSticky = () => {
    if (window.pageYOffset >= sticky) {
      sideBar.addClass('sticky');
    } else {
      sideBar.removeClass('sticky');
    }
  };

  const addItem = (itemId, name, qty, price) => {
    const $cartItem = $('<div>').addClass('row');
    $cartItem.attr('id', `cart-${itemId}`);

    // item name
    const $itemName = $('<div>').addClass('col-5');
    $itemName.append(name);

    // item quantity
    const $itemQty = $('<div>').addClass('col-3');
    $itemQty.append(`Qty: ${qty}`);

    // item quantity for form input
    const $itemQtyInput = $('<input>').attr({
      type: 'hidden',
      value: qty,
      name: `qty${itemId}`,
      id: `qty${itemId}`
    });

    // item price
    const $itemPrice = $('<div>').addClass('col-3 sum-price');
    $itemPrice.append(`$${(price / 100 * qty).toFixed(2)}`);

    // hidden item price
    const $itemPriceHidden = $('<div>').addClass('sum-price-hidden hidden');
    $itemPriceHidden.append(`${price * qty}`);

    // remove button
    const $removeButton = $('<div>').addClass('col-1 rmv-btn hidden');
    const $removeIcon = $('<i>').addClass('far fa-trash-alt');
    $removeButton.append($removeIcon);

    // append name, quantity, price to $cartItem
    $cartItem.append($itemName, $itemQty, $itemPrice, $itemPriceHidden, $removeButton, $itemQtyInput);

    return $cartItem;
  };
  const getSumPrice = () => {
    let sumPrice = 0;
    $('.sum-price-hidden').each(function () {
      sumPrice += Number(this.innerHTML);
    });
    $('.total-price').empty();
    return `$${(sumPrice / 100).toFixed(2)}`;
  };

  $('.counterBox button').click(function () {
    let qty = this.parentNode.childNodes[3].value;

    if (this.className.indexOf('up_count') !== -1) {
      qty = Number(qty) + 1;
    } else {
      qty = Number(qty) - 1;
    };
    qty = qty < 0 ? 0 : qty;
    this.parentNode.childNodes[3].value = qty;
  });
  $('.counter').click(function () {
    $(this).focus().select();
  });

  // event bindig on dynamic elements
  $('body').on('click', '.rmv-btn', function () {
    $(this).parent().remove();

    // update total price
    $('.total-price').append(getSumPrice());

    if ($('.row').length === 0) {
      $('.cart-checkout').prop('disabled', true);
      // hide total price
      $('.cart-total-wrapper').addClass('hidden');
    }

  });

  $('.add-cart').click(function () {
    const currentNodes = this.parentNode.childNodes[1];
    const itemId = currentNodes.childNodes[7].id;
    const qty = currentNodes.childNodes[3].value
    const price = currentNodes.childNodes[9].value;
    const name = this.parentNode.parentNode.childNodes[1].innerHTML;

    if (Number(qty) !== 0) {
      const $itemData = addItem(itemId, name, qty, price);
      $('.cart-body-wrapper').append($itemData);

      // enable checkout button if more than item
      if ($('.row').length > 0) {
        $('.cart-checkout').prop('disabled', false);
      }

      // show total price
      $('.cart-total-wrapper').removeClass('hidden');


      // update total price
      $('.total-price').append(getSumPrice());


    } else {
      console.log('Please specify a nubmer of items you want');
    }
  });


  // toggleClass on dynamically generated elements
  $('body').on('mouseenter', '.row', function() { $(this.childNodes[4]).toggleClass('hidden') });
  $('body').on('mouseleave', '.row', function() { $(this.childNodes[4]).toggleClass('hidden') });

  // stop sumbit behavior

  $('.cart-checkout').click((e) => {
    e.preventDefault();
    const $data = $('#orderForm').serialize();
    console.log($data)

    $.post('/order', $data)
    .done(() => {
      // modal to show order is successfully placed
      // redirect to orders/:id or users/:id
    })
    .catch((err) =>{
      console.error(err);
    });
  });



});