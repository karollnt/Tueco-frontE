const User = (function () {
  const checkSession = function (currentUser) {
    $(document).on('submit', '.js-forgot-password', sendForgotPasswordForm);
    if (currentUser == null) {
      app.loadRegisterDepartments();
      setTimeout(function () {
        $('.js-open-login').trigger('click');
      }, 500);
      return;
    }
    $('.js-main-view').removeClass('display-none');
    if (typeof currentUser.nombre === 'undefined') {
      getUserData(currentUser.id);
      return;
    }
    setUserDataStrings(currentUser);
    if (typeof isUserDetailsPage !== 'undefined' && isUserDetailsPage) {
      setDetailsEvents();
      loadDepartment('.js-edit-user-department');
      $('.js-edit-password-id').val(currentUser.id);
    }
  };

  const checkLoginForm = function (ev) {
    ev.preventDefault();
    let form = $(ev.target);
    let request = $.ajax({
      url: Variables.backendURL + 'user/login',
      method: 'POST',
      data: form.serialize()
    });
    request.done(function (data) {
      if (data.valid == false) {
        $('.js-login-error').html('Por favor revise la informaci&oacute;n ingresada');
        return;
      } else if (data.valid == true) {
        const user = {id: data.id};
        const userString = JSON.stringify(user);
        app.user = JSON.parse(userString);
        window.localStorage.setItem('user', userString);
        location.reload();
      }
    })
    .fail(function (data) {
      if (data.valid == false) {
        $('.js-login-error').html('Por favor revise la informaci&oacute;n ingresada');
      }
    });
    return false;
  };

  const getUserData = function (id) {
    let request = $.ajax({
      url: Variables.backendURL + 'user/get_user_data',
      method: 'GET',
      data: {id: id}
    });
    request.done(function (data) {
      if (data.length === 0) {
        return;
      }
      const userString = JSON.stringify(data);
      app.user = JSON.parse(userString);
      window.localStorage.setItem('user', userString);
      setUserDataStrings(app.user);
    });
  };

  const setUserDataStrings = function (user) {
    $('.js-user-name-tag').html(user.nombre);
    if (user.foto != '') {
      $('.js-user-image').prop('src', user.foto);
    }
    if (typeof isUserDetailsPage !== 'undefined' && isUserDetailsPage) {
      $('.js-user-data-name').html(user.nombre + ' ' + user.apellido);
      $('.js-user-data-address').html(user.direccion + (', ' + user.ciudad + ', ' + user.departamento));
      $('.js-user-data-phone').html(user.telefono);

      $('.js-edit-user-name').val(user.nombre);
      $('.js-edit-user-surname').val(user.apellido);
      $('.js-edit-user-identity').val(user.identificacion);
      $('.js-edit-user-phone').val(user.telefono);
      $('.js-edit-user-address').val(user.direccion);
      $('.js-edit-data-user-id').val(user.id);
      $('.js-edit-photo-user-id').val(user.id);
    }
  };

  const logout = function (ev) {
    ev.preventDefault();
    app.user = null;
    window.localStorage.removeItem('user');
    const link = ev.currentTarget || ev.target;
    location.href = link.getAttribute('href');
    return false;
  };

  const checkRegisterForm = function (ev) {
    ev.preventDefault();
    let form = $(ev.target);
    let request = $.ajax({
      url: Variables.backendURL + 'user/create_user',
      method: 'POST',
      data: form.serialize()
    });
    request.done(function (data) {
      if (data.valid == true) {
        const user = { id: data.id };
        const userString = JSON.stringify(user);
        app.user = JSON.parse(userString);
        window.localStorage.setItem('user', userString);
        location.reload();
        return;
      }
    });
  };

  const setDetailsEvents = function () {
    $(document)
      .on('click', '.js-show-edit-form', showEditDataForm)
      .on('click', '.js-show-update-pass', showEditDataForm)
      .on('change', '.js-edit-user-department', app.fillCitiesSelect)
      .on('submit', '.js-edit-user-pass-form', sendUpdatePasswordForm)
      .on('submit', '.js-edit-user-data-form', sendEditDataForm)
      .on('submit', '.js-edit-user-photo-form', checkEditPhoto);
  };

  const showEditDataForm = function (ev) {
    ev.preventDefault();
    const button = ev.target;
    const selector = button.getAttribute('data-target');
    $('.js-user-data').addClass('display-none');
    $(selector).removeClass('display-none');
  };

  const loadDepartment = function (inputSelector) {
    let request = $.ajax({
      url: Variables.backendURL + 'department/list_departments',
      method: 'GET'
    });
    request.done(function (data) {
      const html = data.reduce(function (prev, current) {
        const selected = app.user.id_departamento == current.id ? ' selected' : '';
        return prev + '<option value="' + current.id + '"' + selected + '>' + current.nombre + '</option>';
      }, '<option value="">Departamento</option>');
      $(inputSelector).html(html).trigger('change');
    });
  };

  const sendEditDataForm = function (ev) {
    ev.preventDefault();
    let form = $(ev.target);
    let request = $.ajax({
      url: Variables.backendURL + 'user/edit_data',
      method: 'POST',
      data: form.serialize()
    });
    request.done(function (data) {
      if (data.valid == true) {
        getUserData(app.user.id);
        setTimeout(() => {
          location.reload();
        }, 500);
        return;
      }
    });
  };

  const sendUpdatePasswordForm = function (ev) {
    let messageContainer = $('.js-update-pass-message');
    messageContainer.html('...');
    ev.preventDefault();
    const pass1 = document.querySelector('.js-edit-user-pass-1').value;
    const pass2 = document.querySelector('.js-edit-user-pass-2').value;
    if (pass1 != pass2) {
      messageContainer.html('Las claves no coinciden, por favor verifique');
      return;
    }
    let form = $(ev.target);
    let request = $.ajax({
      url: Variables.backendURL + 'user/update_password',
      method: 'POST',
      data: form.serialize()
    });
    request.done(function (data) {
      if (data.valid == true) {
        location.reload();
        return;
      }
      messageContainer.html('Ocurri&oacute; un problema, intente de nuevo m&aacute;s tarde');
    }).fail(function () {
      messageContainer.html('Ocurri&oacute; un problema, intente de nuevo m&aacute;s tarde');
    });
  };

  const checkEditPhoto = function (ev) {
    ev.preventDefault();
    let messageContainer = $('.js-update-photo-message');
    messageContainer.html('...');
    const formData = new FormData(ev.target);
    let request = $.ajax({
      async: false,
      cache: false,
      contentType: false,
      url: Variables.backendURL + 'user/update_image',
      method: 'POST',
      processData: false,
      data: formData
    });
    request.done(function (data) {
      if (data.valid == true) {
        location.reload();
        return;
      }
      messageContainer.html('Ocurri&oacute; un problema, intente de nuevo m&aacute;s tarde');
    }).fail(function () {
      messageContainer.html('Ocurri&oacute; un problema, intente de nuevo m&aacute;s tarde');
    });
  };

  const sendForgotPasswordForm = function (ev) {
    ev.preventDefault();
    let form = $(ev.target);
    let request = $.ajax({
      url: Variables.backendURL + 'user/process_forgot_email',
      method: 'POST',
      data: form.serialize()
    });
    request.done(function (data) {
      if (data.valid == true) {
        location.reload();
        return;
      }
      alert('Ocurri&oacute; un problema, intente de nuevo m&aacute;s tarde');
    });
  };

  return {
    checkRegisterForm: checkRegisterForm,
    checkLoginForm: checkLoginForm,
    checkSession: checkSession,
    logout: logout
  };
})();