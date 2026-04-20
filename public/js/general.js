$(() => {
  $('.tooltipped').tooltip({ delay: 50 })
  $('.modal').modal()

  const firebaseEstaInicializado = () =>
    typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length

  // Evento boton inicio sesion
  $('#btnInicioSesion').click(() => {
    if (!firebaseEstaInicializado()) {
      $('#emailSesion').val('')
      $('#passwordSesion').val('')
      $('#modalSesion').modal('open')
      Materialize.toast('Firebase aun no esta configurado en esta pagina', 4000)
      return
    }

    const user = firebase.auth().currentUser
    if (user) {
      $('#btnInicioSesion').text('Iniciar Sesión')
      return firebase
        .auth()
        .signOut()
        .then(() => {
          $('#avatar').attr('src', 'imagenes/usuario.png')
          Materialize.toast(`SignOut Correcto`, 4000)
        })
        .catch(error => {
          Materialize.toast(`Error al realizar SignOut => ${error}`, 4000)
        })
    }

    $('#emailSesion').val('')
    $('#passwordSesion').val('')
    $('#modalSesion').modal('open')
  })

  $('#avatar').click(() => {
    if (!firebaseEstaInicializado()) {
      Materialize.toast('Firebase aun no esta configurado en esta pagina', 4000)
      return
    }

    firebase
      .auth()
      .signOut()
      .then(() => {
        $('#avatar').attr('src', 'imagenes/usuario.png')
        Materialize.toast(`SignOut correcto`, 4000)
      })
      .catch(error => {
        Materialize.toast(`Error al realizar SignOut ${error}`, 4000)
      })
  })

  $('#btnTodoPost').click(() => {
    $('#tituloPost').text('Posts de la Comunidad')

    if (!firebaseEstaInicializado()) {
      Materialize.toast('Firebase aun no esta configurado en esta pagina', 4000)
      return
    }

    const post = new Post()
    post.consultarTodosPost()
  })

  $('#btnMisPost').click(() => {
    if (!firebaseEstaInicializado()) {
      Materialize.toast('Firebase aun no esta configurado en esta pagina', 4000)
      return
    }

    const user = firebase.auth().currentUser
    if (user) {
      const post = new Post()
      post.consultarPostxUsuario(user.email)
      $('#tituloPost').text('Mis Posts')
    } else {
      Materialize.toast(`Debes estar autenticado para ver tus posts`, 4000)
    }
  })

  if (!firebaseEstaInicializado()) {
    console.error('Firebase no esta inicializado. Revisa js/config/ConfigFirebase.js')
    return
  }

  // Se registra el service worker
  const messagingEstaDisponible =
    firebase.messaging &&
    (!firebase.messaging.isSupported || firebase.messaging.isSupported())

  if ('serviceWorker' in navigator && messagingEstaDisponible) {
    navigator.serviceWorker
      .register('notificaciones-sw.js')
      .then(registro => {
        console.log('service worker registrado')
        firebase.messaging().useServiceWorker(registro)
      })
      .catch(error => {
        console.error(`Error al registrar el service worker => ${error}`)
      })

    const messaging = firebase.messaging()
    const guardarToken = token => {
      const user = firebase.auth().currentUser

      if (!user) {
        console.log('Token no guardado porque no hay usuario autenticado')
        return
      }

      firebase
        .firestore()
        .collection('tokens')
        .doc(token)
        .set({
          token: token,
          uid: user.uid,
          email: user.email
        })
        .catch(error => {
          console.error(`Error al insertar el token en la BD => ${error}`)
        })
    }

    // Registrar credenciales web
    messaging.usePublicVapidKey(
      'BNXFobbKFCs-uAVxoPSqtgtm9GrVypZwx9n2PdS6GCqynO48xgPL0vUhX5hd9xgawFTRFzvfyYe0tt8f_IcL_-w'
    )

    // Solicitar permisos para las notificaciones
    messaging
      .requestPermission()
      .then(() => {
        console.log('permiso otorgado')
        return messaging.getToken()
      })
      .then(token => {
        console.log('token')
        console.log(token)
        guardarToken(token)
      })
      .catch(error => {
        console.error(`Permiso no otorgado => ${error}`)
      })

    // Obtener el token cuando se refresca
    messaging.onTokenRefresh(() => {
      messaging.getToken().then(token => {
        console.log('token se ha renovado')
        guardarToken(token)
      })
    })

    // Recibir las notificaciones cuando el usuario esta foreground
    messaging.onMessage(payload => {
      console.log('mensaje en foreground')
      Materialize.toast(
        `Ya tenemos un nuevo post. Revísalo, se llama ${payload.data.titulo}`,
        6000
      )
    })
  }

  const post = new Post()
  post.consultarTodosPost()

  // Firebase observador del cambio de estado de auth
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      $('#btnInicioSesion').text('Salir')
      if (user.photoURL) {
        $('#avatar').attr('src', user.photoURL)
      } else {
        $('#avatar').attr('src', 'imagenes/usuario_auth.png')
      }
    } else {
      $('#btnInicioSesion').text('Iniciar Sesión')
      $('#avatar').attr('src', 'imagenes/usuario.png')
    }
  })
})
