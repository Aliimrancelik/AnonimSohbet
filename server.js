const { ipcMain } = require('electron');

const expressApp = require('express')();

const server = require('http').createServer(expressApp);
const io = require('socket.io')(server);

//Soket sunucusunu başlatıyoruz
server.listen(3030);
console.log('Sunucu 3030 portunda başlatıldı!')

var AKTIF = 0;
var KULLANICILAR = {};
var KULLANICILAR_IDLER = [];
var KULLANICILAR_KULLANICI_ADLARI = [];

var MESAJLAR = [];

//Program ilk başlatıldığında ilk mesajı belirliyoruz
MESAJLAR.push({
    KullaniciAdi: "Sunucu",
    Mesaj: "Sohbet programı başlatıldı. Bu bölümden sohbet edebilirsiniz."
});

io.on('connection', (socket) => {
    let kullaniciID = socket.handshake.query.kullaniciID;

    //Yeni bir soket bağlatnısı olduğunda aktif verisini arttırıyoruz
    AKTIF++;
    //Tüm kullanıcılara aktif sayısını iletiyoruz
    io.emit('aktifSayisi', {s: AKTIF})

    console.log('Yeni giriş, toplam aktif: ' + AKTIF);
    
    socket.emit('baglanti', {});
    //Soket numarası ile kullanıcı daha önce kullanıcı adı belirlemişmi kontrol ediyoruz
    if(KULLANICILAR_IDLER.indexOf(kullaniciID) > -1){
        //Belirlemiş ise bilgiyi iletiyoruz
        socket.emit('kullaniciOlusturuldu', {e: false, k: KULLANICILAR[kullaniciID].KullaniciAdi, mesajlar: MESAJLAR});
    }

    socket.on('kullaniciAdiBelirle', function(veri){
        if(KULLANICILAR_IDLER.indexOf(kullaniciID) >= 0){
            socket.emit('kullaniciOlusturuldu', {e: true, m: "Kullanıcı adı zaten belirlenmiş.", k: KULLANICILAR[kullaniciID].KullaniciAdi, mesajlar: MESAJLAR});
        }else{
            let KullaniciAdi = veri.KullaniciAdi;
            if(KullaniciAdi.length < 3 || KullaniciAdi.length > 30){
                socket.emit('kullaniciOlusturuldu', {e: true, m: "Kullanıcı adı 3-30 karakter aralığında olmalıdır!"});
                return;
            }
            if(KULLANICILAR_KULLANICI_ADLARI.indexOf(KullaniciAdi) >= 0){
                socket.emit('kullaniciOlusturuldu', {e: true, m: "Bu kullanıcı adı daha önce alınmış!"});
                return;
            }
            KULLANICILAR[kullaniciID] = {
                KullaniciID: kullaniciID,
                KullaniciAdi: KullaniciAdi
            }
            KULLANICILAR_IDLER.push(kullaniciID);
            KULLANICILAR_KULLANICI_ADLARI.push(KullaniciAdi);

            socket.emit('kullaniciOlusturuldu', {e: false, k: KullaniciAdi, mesajlar: MESAJLAR});
        }
    })

    socket.on('mesajGonder', function(veri){
        if(veri.m){
            if(KULLANICILAR_IDLER.indexOf(kullaniciID) >= 0){
                let Mesaj = veri.m;
                let MesajVeri = {
                    KullaniciAdi: KULLANICILAR[kullaniciID].KullaniciAdi,
                    Mesaj: Mesaj
                }
                MESAJLAR.push(MesajVeri)
                io.emit('yeniMesaj', MesajVeri);
            }else{
                console.log('Giriş yapmadan mesaj yollama denemesi başarısız.');
            }
        }
    })

    //Kullanıcı sayfayı programı kapattığında aktif verisini düşürüyoruz ve tekrar tüm kullanıcılara yeni veriyi gönderiyoruz
    socket.on('disconnect', function(){
        AKTIF--;
        io.emit('aktifSayisi', {s: AKTIF})
    })
});