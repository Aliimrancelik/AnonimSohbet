Anonim sohbet programı

Kullanıcıların birbiri ile anonim bir şekilde sohbet edebileceği uygulamadır.

server.js hakkında

Kullanıcıların birbiri ile bağlantı kurabilmesi için socket.io kütüphanesi kullanılması gerekiyordu. Bu sebepten ötürü bir socket.io sunucusu yazdım. Uygulama kullanılacağı zaman server.js'in açık tutulması gerekiyor. Sunucunun default portunu 3030 olarak ayarladım.

main.js hakkkında

Programın kullanıcı arayüzünü Electron kullanarak yaptım. Bu kodun içinde başlatılacak her bir uygulama için rastgele 64 karakterli kod oluşturdum ve bu kodu arayüz kısmına ilettim. Bu ilettiğim kod ile sunucuya bağlantı isteği yaptım ve sunucunun kullanıcı işlemlerini bu kod ile yapmasını sağladım. Kısacası kullanıcının verilerini, kullanıcının uygulamasında belirlediğim rastgele kod ile sunucuda barındırdım. Bu kodun 64 karakterli olması, başka kullanıcıların bu kişinin kimliğine bürünebilme ihtimalini imkansıza yakın bir hale getirdi. İşin özü bu kod onların kimlik şifresi oldu.

index.html hakkında

Bu kısmı çok basit tutmaya çalıştım. Bu kısımda herhangi bir arayüz işlemi yapmadım. Sadece iskelet kısmını yaptım. Daha sonra app.js ve app.css'i dahil ederek tasarım ve işlevleri dahil etmiş oldum. Ekstra olarak jquery ve fontawesome kütüphanelerini kullandım.

src/app.js hakkında

Sunucu bağlantısı ve arayüz işlemlerini bu kısımda yazdım. Sunucuya kullanıcı adı belirleme isteği, mesaj atma, aktif üye işlemleri, emoji işlemleri, canlı sohbet işlemleri gibi tüm arayüz işlemleri bu dosyada bulunuyor. Kısacası arayüzün bel kemiği.

src/app.css hakkında

Bu kısımda arayüzün tasarım işlemlerini yaptım. Tasarım responsive bir şekilde yapıldı. Sayfa boyutu değiştirildiğinde o boyutlara göre düzen sağlanmaya çalışıldı. Fakat Electron penceresinin yatay boyutu sabit olacağından dolayı yatay boyutlandırmaya herhangi bir kod yazılmadı.

src/css, src/js, src/resimler hakkında

Burada "jQuery, FontAwesome, Google Fonts..." gibi ekstra kaynakları dışa bağlı kalmamak için barındırıyorum. Cihazın internet bağlantısı olmasa bile uygulamamız yerel ağımızda sorunsuz çalışacaktır.
