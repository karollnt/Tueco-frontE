/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
  user: window.localStorage.getItem('user') ? JSON.parse(window.localStorage.getItem('user')) : null,
  setEvents: function () {
    $(document)
      .on('click', '.js-logout', User.logout)
      .on('change', '.js-register-department', this.fillCitiesSelect)
      .on('submit', '.js-register-user', User.checkRegisterForm)
      .on('submit', '.js-login-form', User.checkLoginForm);
  },

  // Application Constructor
  initialize: function() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    User.checkSession(this.user);
    this.setEvents();
  },

  // deviceready Event Handler
  //
  // Bind any cordova events here. Common events are:
  // 'pause', 'resume', etc.
  onDeviceReady: function() {
    this.receivedEvent('deviceready');
  },

  // Update DOM on a Received Event
  receivedEvent: function(id) {
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');

    console.log('Received Event: ' + id);
  },

  loadRegisterDepartments: function () {
    let request = $.ajax({
      url: Variables.backendURL + 'department/list_departments',
      method: 'GET'
    });
    request.done(function (data) {
      const html = data.reduce(function (prev, current) {
        return prev + '<option value="' + current.id + '">' + current.nombre + '</option>';
      }, '<option value="">Departamento</option>');
      $('.js-register-department').html(html);
    });
  },

  fillCitiesSelect: function (ev) {
    const select = ev.target;
    const targetSelector = select.getAttribute('data-target');
    if (select.value == '') {
      $(targetSelector).html('<option value="" selected>Ciudad</option>');
    }
    let request = $.ajax({
      url: Variables.backendURL + 'department/get_department_cities',
      method: 'GET',
      data: {id: select.value}
    });
    request.done(function (data) {
      const html = data.reduce(function (prev, current) {
        const selected = (app.user != null && app.user.id_ciudad == current.id) ? ' selected' : '';
        return prev + '<option value="' + current.id + '"' + selected + '>' + current.nombre + '</option>';
      }, '<option value="">Ciudad</option>');
      $(targetSelector).html(html);
    })
    .fail(function () {
      $(targetSelector).html('<option value="" selected>Ciudad</option>');
    });
  }
};

app.initialize();