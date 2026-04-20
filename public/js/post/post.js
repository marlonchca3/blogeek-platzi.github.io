class Post {
  constructor () {
    this.db = firebase.firestore()

    if (!Post.firestoreConfigurado) {
      try {
        this.db.settings({ timestampsInSnapshots: true })
      } catch (error) {
        console.warn(`Firestore ya estaba configurado => ${error.message}`)
      }

      Post.firestoreConfigurado = true
    }
  }

  crearPost (uid, emailUser, titulo, descripcion, imagenLink, videoLink) {
    return this.db
      .collection('posts')
      .add({
        uid: uid,
        autor: emailUser,
        titulo: titulo,
        descripcion: descripcion,
        imagenLink: imagenLink,
        videoLink: videoLink,
        fecha: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(refDoc => {
        console.log(`Id del post => ${refDoc.id}`)
        return refDoc
      })
      .catch(error => {
        console.error(`Error creando el post => ${error}`)
        throw error
      })
  }

  consultarTodosPost () {
    this.db
      .collection('posts')
      .onSnapshot(querySnapshot => {
        this.pintarPosts(querySnapshot)
      }, error => {
        console.error(`Error consultando posts => ${error}`)
        Materialize.toast(`Error consultando posts => ${error.message}`, 5000)
      })
  }

  consultarPostxUsuario (emailUser) {
    this.db
      .collection('posts')
      .where('autor', '==', emailUser)
      .onSnapshot(querySnapshot => {
        this.pintarPosts(querySnapshot)
      }, error => {
        console.error(`Error consultando posts del usuario => ${error}`)
        Materialize.toast(`Error consultando tus posts => ${error.message}`, 5000)
      })
  }

  pintarPosts (querySnapshot) {
    $('#posts').empty()

    if (querySnapshot.empty) {
      $('#posts').append(this.obtenerTemplatePostVacio())
      return
    }

    const posts = []
    querySnapshot.forEach(post => {
      posts.push(post.data())
    })

    posts
      .sort((postA, postB) => {
        const fechaA = this.obtenerTiempoPost(postA.fecha)
        const fechaB = this.obtenerTiempoPost(postB.fecha)

        return fechaB - fechaA
      })
      .forEach(post => {
        const postHtml = this.obtenerPostTemplate(
          post.autor,
          post.titulo,
          post.descripcion,
          post.videoLink,
          post.imagenLink,
          this.obtenerFechaPost(post.fecha)
        )

        $('#posts').append(postHtml)
      })
  }

  obtenerTiempoPost (fecha) {
    if (fecha && fecha.toDate) {
      return fecha.toDate().getTime()
    }

    return 0
  }

  obtenerFechaPost (fecha) {
    if (fecha && fecha.toDate) {
      return Utilidad.obtenerFecha(fecha.toDate())
    }

    return Utilidad.obtenerFecha(new Date())
  }

  obtenerYoutubeEmbedLink (videoLink) {
    if (!videoLink) {
      return ''
    }

    try {
      const url = new URL(videoLink)
      let videoId = ''

      if (url.hostname.includes('youtu.be')) {
        videoId = url.pathname.split('/').filter(Boolean)[0]
      } else if (url.pathname.includes('/embed/')) {
        videoId = url.pathname.split('/embed/')[1].split('/')[0]
      } else if (url.pathname.includes('/shorts/')) {
        videoId = url.pathname.split('/shorts/')[1].split('/')[0]
      } else {
        videoId = url.searchParams.get('v')
      }

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    } catch (error) {
      console.warn(`No se pudo convertir el enlace de video => ${error.message}`)
    }

    return videoLink
  }

  subirImagenPost (file, uid) {
    const refStorage = firebase.storage().ref(`imgsPosts/${uid}/${file.name}`)
    const task = refStorage.put(file)

    task.on(
      'state_changed',
      snapshot => {
        const porcentaje = snapshot.bytesTransferred / snapshot.totalBytes * 100
        $('.determinate').attr('style', `width: ${porcentaje}%`)
      },
      err => {
        Materialize.toast(`Error subiendo archivo = > ${err.message}`, 4000)
      },
      () => {
        task.snapshot.ref
          .getDownloadURL()
          .then(url => {
            console.log(url)
            sessionStorage.setItem('imgNewPost', url)
          })
          .catch(err => {
            Materialize.toast(`Error obteniendo downloadURL = > ${err}`, 4000)
          })
      }
    )
  }

  obtenerTemplatePostVacio () {
    return `<article class="post">
      <div class="post-titulo">
          <h5>Crea el primer Post a la comunidad</h5>
      </div>
      <div class="post-calificacion">
          <a class="post-estrellita-llena" href="*"></a>
          <a class="post-estrellita-llena" href="*"></a>
          <a class="post-estrellita-llena" href="*"></a>
          <a class="post-estrellita-llena" href="*"></a>
          <a class="post-estrellita-vacia" href="*"></a>
      </div>
      <div class="post-video">
          <iframe type="text/html" width="500" height="385" src='https://www.youtube.com/embed/bTSWzddyL7E?ecver=2'
              frameborder="0"></iframe>
          </figure>
      </div>
      <div class="post-videolink">
          Video
      </div>
      <div class="post-descripcion">
          <p>Crea el primer Post a la comunidad</p>
      </div>
      <div class="post-footer container">         
      </div>
  </article>`
  }

  obtenerPostTemplate (
    autor,
    titulo,
    descripcion,
    videoLink,
    imagenLink,
    fecha
  ) {
    const videoEmbedLink = this.obtenerYoutubeEmbedLink(videoLink)

    if (imagenLink) {
      return `<article class="post">
            <div class="post-titulo">
                <h5>${titulo}</h5>
            </div>
            <div class="post-calificacion">
                <a class="post-estrellita-llena" href="*"></a>
                <a class="post-estrellita-llena" href="*"></a>
                <a class="post-estrellita-llena" href="*"></a>
                <a class="post-estrellita-llena" href="*"></a>
                <a class="post-estrellita-vacia" href="*"></a>
            </div>
            <div class="post-video">                
                <img id="imgVideo" src='${imagenLink}' class="post-imagen-video" 
                    alt="Imagen Video">     
            </div>
            <div class="post-videolink">
                <a href="${videoLink}" target="_blank" rel="noopener">Abrir video en YouTube</a>
            </div>
            <div class="post-video">
                <iframe type="text/html" width="500" height="385" src='${videoEmbedLink}'
                    frameborder="0" allowfullscreen></iframe>
            </div>
            <div class="post-descripcion">
                <p>${descripcion}</p>
            </div>
            <div class="post-footer container">
                <div class="row">
                    <div class="col m6">
                        Fecha: ${fecha}
                    </div>
                    <div class="col m6">
                        Autor: ${autor}
                    </div>        
                </div>
            </div>
        </article>`
    }

    return `<article class="post">
                <div class="post-titulo">
                    <h5>${titulo}</h5>
                </div>
                <div class="post-calificacion">
                    <a class="post-estrellita-llena" href="*"></a>
                    <a class="post-estrellita-llena" href="*"></a>
                    <a class="post-estrellita-llena" href="*"></a>
                    <a class="post-estrellita-llena" href="*"></a>
                    <a class="post-estrellita-vacia" href="*"></a>
                </div>
                <div class="post-video">
                    <iframe type="text/html" width="500" height="385" src='${videoEmbedLink}'
                        frameborder="0" allowfullscreen></iframe>
                </div>
                <div class="post-videolink">
                    <a href="${videoLink}" target="_blank" rel="noopener">Abrir video en YouTube</a>
                </div>
                <div class="post-descripcion">
                    <p>${descripcion}</p>
                </div>
                <div class="post-footer container">
                    <div class="row">
                        <div class="col m6">
                            Fecha: ${fecha}
                        </div>
                        <div class="col m6">
                            Autor: ${autor}
                        </div>        
                    </div>
                </div>
            </article>`
  }
}
