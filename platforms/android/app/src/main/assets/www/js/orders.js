const Orders = (function () {
  let categories = null;
    let coordinates = {
    latitude: 0,
    longitude: 0
  };
  

  const init = function () {
    if (typeof isCreateOrder !== 'undefined' && isCreateOrder) {
      $('.js-user-id').val(app.user.id);
      getOrderCategories();
      setEvents();
    } else if (typeof isListOrders !== 'undefined' && isListOrders) {
      listUserOrders();
    } else if (typeof isViewOrder !== 'undefined' && isViewOrder) {
      viewOrderDetails();
    }
  };

  const getOrderCategories = function () {
    let ajax = $.ajax({
      method: 'GET',
      url: Variables.backendURL + 'category/get_categories',
      data: { tipo: 2 }
    });
    ajax.done(function (data) {
      if (!data || data.length < 1) {
        return;
      }
      categories = JSON.parse(JSON.stringify(data));
      fillFormCategories();
    });
  };

  const fillFormCategories = function () {
    const html = categories.reduce(function (carry, current) {
      const valueString = current.id + ';' + (current.precio * 1);
      const currentHtml = '<li class="row">' +
        '<div class="col-4">' +
        (current.foto ? '<img src = "' + current.foto + '">' : '') +
          '<label class="label-checkbox item-content" for="category_' + current.id + '">' +
            '<input type="checkbox" id="category_' + current.id + '" name="category" class="js-category-item" value="' + valueString + '" data-id="' + current.id + '"> ' +
            '<span class="item-title">' + current.nombre + '</span>' +
          '</label>' +
        '</div>' +
        '<div class="col-4">' +
          '$ ' + (current.precio * 1) + ' (' + current.medida +')' +
        '</div>' +
        '<div class="col-4">' +
          '<input type="number" name="cantidad_' + current.id + '" class="form_input js-item-quantity-' + current.id + '" value="0">' +
        '</div>' +
      '</li>';
      return carry + currentHtml;
    }, '');
    $('.js-object-list').html(html);
  };

  const setEvents = function () {
    $(document).on('submit', '.js-create-request-form', createOrder);
    if (!navigator.geolocation) {
      geolocateAddress();
      return;
    }
    navigator.geolocation.getCurrentPosition(setCoordinates, locationError, { timeout: 5000 });
  };

  const locationError = function (error) {
    coordinates = {
      latitude: 0,
      longitude: 0
    };
    geolocateAddress();
  };

  const setCoordinates = function (position) {
    coordinates = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };
  };

  const geolocateAddress = function () {
    if (typeof google === 'undefined') {
      return;
    }
    const user = app.user;
    const address = user.departamento + ', ' + user.ciudad + ', ' + user.direccion;
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': address }, function (results, status) {
      if (status == 'OK' && typeof results[0] !== 'undefined') {
        const result = results[0];
        coordinates = {
          latitude: result.geometry.location.lat(),
          longitude: result.geometry.location.lng()
        };
      }
    });
    
  };

  const createOrder = function (ev) {
    $('.js-create-longitude').val(coordinates.longitude);
    $('.js-create-latitude').val(coordinates.latitude);
    ev.preventDefault();
    const categoryCheckboxes = document.querySelectorAll('.js-category-item:checked');
    let categoryValues = '';
    for (let i = 0; i < categoryCheckboxes.length; i++) {
      const element = categoryCheckboxes[i];
      if (categoryValues != '') {
        categoryValues += '|';
      }
      const elementQuantity = document.querySelector('.js-item-quantity-' + element.getAttribute('data-id'));
      categoryValues += element.value + ';' + elementQuantity.value;
    }
    $('.js-request-objects').val(categoryValues);
    let form = $(ev.target);
    let ajax = $.ajax({
      url: Variables.backendURL + 'order/create_order',
      method: 'POST',
      data: form.serialize()
    });
    ajax.done(function (data) {
      if (data.valid == true) {
        location.href = 'success.html';
      }
    });
  };

  const listUserOrders = function () {
    if (app.user == null) {
      return;
    }
    let ajax = $.ajax({
      url: Variables.backendURL + 'order/get_user_orders',
      data: {user_id: app.user.id},
      method: 'GET'
    });
    ajax.done(function (data) {
      if (!data || data.length < 1) {
        return;
      }
      const orderListHtml = data.reduce(function (carry, item) {
        const itemHtml = '<li>'+
          '<p>Fecha para recoger: ' + item.fecha + '</p>' +
          '<p' + (item.fecha_recogida != null && (item.fecha_recogida).indexOf('0000') < 0 ? ' class="color-primary-0"' : '') + '>' +
            'Fecha recogido: ' + (item.fecha_recogida != null ? item.fecha_recogida.split(' ')[0] : 'No recogido') + '</p>' +
          '<div class="row">' +
            '<div class="col-8">' +
              '<p>Ciudad: ' + item.ciudad + '</p>' +
              '<p>Departamento: ' + item.departamento + '</p>' +
            '</div>' +
            '<div class="col-4">' +
              '<a href="detalle-solicitud.html?id=' + item.id + '" class="btn">Ver m&aacute;s</a>' +
            '</div>' +
          '</div>' +
        '</li>';
        return carry + itemHtml;
      }, '');
      $('.js-orders-list').html(orderListHtml);
    });
  };

  const getAllUrlParams = function (url) {
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
    var obj = {};
    if (!queryString) {
      return null;
    }
    queryString = queryString.split('#')[0];
    var arr = queryString.split('&');

    for (var i = 0; i < arr.length; i++) {
      var a = arr[i].split('=');
      var paramName = a[0];
      var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
      paramName = paramName.toLowerCase();
      if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();
      if (paramName.match(/\[(\d+)?\]$/)) {
        var key = paramName.replace(/\[(\d+)?\]/, '');
        if (!obj[key]) obj[key] = [];

        if (paramName.match(/\[\d+\]$/)) {
          var index = /\[(\d+)\]/.exec(paramName)[1];
          obj[key][index] = paramValue;
        } else {
          obj[key].push(paramValue);
        }
      } else {
        if (!obj[paramName]) {
          obj[paramName] = paramValue;
        } else if (obj[paramName] && typeof obj[paramName] === 'string') {
          obj[paramName] = [obj[paramName]];
          obj[paramName].push(paramValue);
        } else {
          obj[paramName].push(paramValue);
        }
      }
    }

    return obj;
  };

  const viewOrderDetails = function () {
    const params = getAllUrlParams();
    if (params == null) {
      return;
    }
    let ajax = $.ajax({
      data: {order_id: params.id},
      method: 'GET',
      url: Variables.backendURL + 'order/get_order_data'
    });
    ajax.done(function (data) {
      const nombre_recicla_tendero = data.nombre_recicla_tendero == null 
        ? 'No asignado' : data.nombre_recicla_tendero + ' ' + data.apellido_recicla_tendero;
      const html = '<div class="col-6">' +
          '<p><b>Fecha para recoger</b><br>' + data.fecha + '</p>' +
        '</div>' +
        '<div class="col-6">' +
          '<p><b>Fecha recogida</b><br>' + (data.fecha_recogida ? data.fecha_recogida : 'No recogido') + '</p>' +
        '</div>' +
        '<div class="col-12">' +
          '<p><b>Nombre cliente</b>: ' + (data.nombre_cliente + ' ' + data.apellido_cliente) + '</p>' +
        '</div>' +
        '<div class="col-6">' +
          '<p><b>Departamento</b>: ' + data.departamento + '</p>' +
          '<p><b>Ciudad</b>: ' + data.ciudad + '</p>' +
          '<p><b>Direcci&oacute;n</b>: ' + data.direccion + '</p>' +
          '<p><b>Comentario</b>: ' + data.comentario + '</p>' +
        '</div>' +
        '<div class="col-6">' +
          '<p><b>Reciclatendero</b>:</p>' +
          '<img src="' + (data.nombre_recicla_tendero == null ? 'images/avatar.jpg' : data.foto) + '">' +
          '<p><b>' + nombre_recicla_tendero + '</b></p>' +
          '<p><b>Placa</b>: ' + data.placa + '</p>' +
        '</div>' +
        '<div class="col-12">' +
          '<p><b>Objetos de la solicitud:</b></p><ul class="js-order-items"></ul>' +
          '<p><b>Total:</b> $<span class="js-total-price"></span></p>' +
        '</div>';
      let detailsAjax = $.ajax({
        data: { order_id: params.id },
        method: 'GET',
        url: Variables.backendURL + 'order/get_order_details'
      });
      $('.js-order-details').html(html);
      detailsAjax.done(function (detailsData) {
        let total = 0;
        const detailsHtml = detailsData.reduce(function (carry, item) {
          const lineItemPrice = item.precio * item.cantidad;
          total += lineItemPrice;
          const detailHtml = '<li><p>- <b>' + item.nombre_categoria + '</b>: $ ' + lineItemPrice + ' - ' +
            item.cantidad + ' ' + item.medida + '(s) -> $' + (item.precio * 1) + ' / ' + item.medida + '</p></li>';
          return carry + detailHtml;
        }, '');
        $('.js-order-items').html(detailsHtml);
        $('.js-total-price').html(total);
      });
    });
  };

  return {
    init: init
  };
})();

Orders.init();
