$(() => {
  $('#btnModalPost').click(() => {
    $('#tituloNewPost').val('')
    $('#descripcionNewPost').val('')
    $('#linkVideoNewPost').val('')
    $('#btnUploadFile').val('')
    $('.determinate').attr('style', `width: 0%`)
    sessionStorage.setItem('imgNewPost', null)

    const user = firebase.auth().currentUser

    if (user == null) {
      Materialize.toast(`Para crear el post debes estar autenticado`, 4000)
      return
    }    

    $('#modalPost').modal('open')
  })

  $('#btnRegistroPost').click(() => {
    const post = new Post()
    const user = firebase.auth().currentUser

    if (user == null) {
      Materialize.toast(`Para crear el post debes estar autenticado`, 4000)
      return
    }

    const titulo = $('#tituloNewPost').val()
    const descripcion = $('#descripcionNewPost').val()
    const videoLink = $('#linkVideoNewPost').val()
    const imagenLink = sessionStorage.getItem('imgNewPost') == 'null'
      ? null
      : sessionStorage.getItem('imgNewPost')

    if (!titulo || !descripcion || !videoLink) {
      Materialize.toast(`Completa titulo, descripcion y enlace del video`, 4000)
      return
    }

    post
      .crearPost(
        user.uid,
        user.email,
        titulo,
        descripcion,
        imagenLink,
        videoLink
      )
      .then(resp => {
        Materialize.toast(`Post creado correctamente`, 4000)
        $('.modal').modal('close')
      })
      .catch(err => {
        console.error(err)
        Materialize.toast(`Error creando post => ${err.message}`, 5000)
      })
  })

  $('#btnUploadFile').on('change', e => {
    const file = e.target.files[0]
    const user = firebase.auth().currentUser

    if (user == null) {
      Materialize.toast(`Para subir imagen debes estar autenticado`, 4000)
      $('#btnUploadFile').val('')
      return
    }

    if (!file) {
      return
    }

    const post = new Post()
    post.subirImagenPost(file, user.uid)
  })
})
