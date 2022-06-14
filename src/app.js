var ipcRenderer = require('electron').ipcRenderer;
window.$ = window.jQuery = require('jquery');

var EmojilerTam = "😀 😃 😄 😁 😆 😅 😂 🤣 😊 🙂 🙃 😉 😍 🥰 😘 😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎 🤩 🥳 😒 😞 😔 😕 🙁 ☹️ 😣 😖 😫 🥺 😢 😭 😤 😠 😡 🤬 🤯 😳 🥶 😱 🤗 🤔 🤫 😶 😐 😑 😬 😲 🥱 😴 🤢 🤧 😷 🤕 🤑 🤠 😈 💩 👋 ✋ 👌 🤏 ✌️ 🤞 🤟 🤙 👈 👉 👍 👎 👊 👏";
var Emojiler = EmojilerTam.split(" ");

var KullaniciAdi = "";
var ScrollAktif = true;
var ChatHazirmi = false;


var MesajCounter = 0;
var MaxMesaj = 100; //SAYFADA GÖZÜKECEK MAKSİMUM MESAJ MİKTARI

var MesajCooldown = false;
var MesajCooldownSuresi = 1500; //MESAJ GÖNDEREBİLMEK İÇİN MS CİNSİNDEN COOLDOWN

$(document).ready(function(){
    
    var kullaniciID = ipcRenderer.sendSync('kullaniciID', '');
    console.log(kullaniciID);

    var Yukleyici = $("#mainYukleyici");
    var KullaniciAdiInput = $("#KullaniciAdiInput");
    var KullaniciAdiBelirleButon = $("#KullaniciAdiBelirleButon");

    var KullaniciAdiEkrani = $("#KullaniciAdiEkrani");
    var SohbetEkrani = $("#SohbetEkrani");

    var SohbetBolumu = $("#SohbetBolumu");
    var MesajInput = $("#MesajGonderInput");
    var SohbetGeriDon = $("#SohbetGeriDon");

    var EmojiListesi = $("#EmojiListesi");
    var RastgeleEmoji = $("#RastgeleEmoji");
    var EmojiKutusu = $("#EmojiKutusu");

    var socket = io("http://localhost:3030",{ query: { kullaniciID: kullaniciID } });


    socket.on('baglanti', function(){
        YukleyiciFonksiyon();
        $("#YukleyiciBaslik").html("Yükleniyor...");
    });

    //Aktif üye sayısı geldiğinde
    socket.on('aktifSayisi', function(data){
        //AktifSayisi sınıfına sahip olan elementleri çekiyoruz
        $(".AktifSayisi").each(function(){
            //İçeriğini gelen veri ile değiştiriyoruz
            $(this).html(data.s);
        })
    })

    //Sol alttaki emoji iconuna basıldığında listeyi açıyoruz. Aynı zamanda tekrar basıldığında kapatıyoruz.
    RastgeleEmoji.click(function(){
        if(EmojiKutusu.css("display") == "none") EmojiKutusu.css("display", "block");
        else EmojiKutusu.css("display", "none");
    })
    //Mesaj kutusuna basıldığında Emojiler kutusunu kapatıyoruz
    MesajInput.click(function(){
        EmojiKutusu.css("display", "none")
    })
    //Mesajların olduğu bölüme basınca Emojiler kutusunu kapatıyoruz
    $(".SohbetBolumu").click(function(){
        EmojiKutusu.css("display", "none");
    });
    
    //Sayfa yüklendiğinde verideki emojileri içeriye aktarıyoruz
    Emojiler.forEach(function(Emoji){
        EmojiKutusu.append(`<div class="Emoji">${Emoji}</div>`);
    })
    //İçeriye aktarılan emojilere 0.5 saniye gecikme ile fonksiyon ekliyoruz
    setTimeout(function(){
        $(".Emoji").click(function(){
            MesajInput.val(MesajInput.val() + $(this).html());
        })
    },500)

    //Sol alttaki emojinin üstüne gelince emojiyi rastgele bir emoji ile değiştiriyoruz
    RastgeleEmoji.mouseover(function(){
        let RastgeleID = Math.floor(Math.random() * Emojiler.length);
        RastgeleEmoji.html(Emojiler[RastgeleID]);
    })

    //Mesaj kutusunda tuşa basıldığında
    MesajInput.keypress(function(event){
        let keycode = (event.keyCode ? event.keyCode : event.which);
        //Eğer basılan tuş enter ise
        if(keycode == '13'){
            MesajGonder();
        }
    });
    //Kullanıcı adı kutusunda tuşa basıldığında
    KullaniciAdiInput.keypress(function(event){
        let keycode = (event.keyCode ? event.keyCode : event.which);
        //Eğer basılan tuş enter ise
        if(keycode == '13'){
            KullaniciAdiBelirle();
        }
    });
    //Canlı sohbete geri dönme butonuna basıldığında
    SohbetGeriDon.click(function(){
        ScrollAktif = true;
        $(this).addClass("kapali");

        //Animasyon ile en aşşağı kaydırıyoruz
        SohbetBolumu.animate({
            scrollTop: SohbetBolumu[0].scrollHeight
        }, 1000);

        ChatHazirmi = false;
        setTimeout(function(){
            ChatHazirmi = true;
        },1000)
    })
    //Sohbet yukarı doğru kaydırıldığında sohbetin aşşağı kaymasını önlüyoruz
    SohbetBolumu.scroll(function(){
        if(ScrollAktif === true && ChatHazirmi === true){
            ScrollAktif = false;
            SohbetGeriDon.removeClass("kapali");
        }
        if(ScrollAktif === false){
            let elem = $(this)[0];
            let diff = elem.scrollHeight - elem.offsetHeight - elem.scrollTop;
            if(diff < 10){
                ScrollAktif = true;
                SohbetGeriDon.addClass("kapali");
            }
        }
    })

    //Yeni mesaj geldiğinde
    socket.on('yeniMesaj', function(veri){
        MesajCounter++;
        let Ben = KullaniciAdi == veri.KullaniciAdi ? "Ben" : "Diger";
        SohbetBolumu.append(`<div class="SohbetMesaji ${Ben}">
                <div class="SohbetMesaji__Yollayan">${veri.KullaniciAdi}</div>
                <div class="SohbetMesaji__MesajKutusu">${veri.Mesaj}</div>
        </div>`);

        //Eğer sayfa yukarıya kaydırılmamışsa yani canlı sohbetteyse kaydırma animasyonu yapıyoruz
        if(ScrollAktif === true){
            SohbetBolumu.animate({
                scrollTop: SohbetBolumu[0].scrollHeight
            }, 1000);

            ChatHazirmi = false;
            setTimeout(function(){
                ChatHazirmi = true;
            },1000)
        }

        //Eğer sayfadaki mesaj sayısı önceden belirlediğimiz mesaj sayısını geçiyorsa en üstteki mesajlardan eksiltiyoruz
        if(MesajCounter >= MaxMesaj){
            let Mesajlar = $(".SohbetMesaji");
            let Silinecek = (MesajCounter - MaxMesaj);
            MesajCounter = MaxMesaj;
            for(var i = 0; i < Silinecek; i++){
                Mesajlar[i].remove();
            }
        }
    })

    //Kullanıcı adı belirlerken sunucudan geri gelen yanıt
    socket.on('kullaniciOlusturuldu', function(veri){
        if(veri.e === true){
            //Eğer kabul edilmediyse kutuyu kırmızı yapıyoruz ve hata verdiriyoruz
            $("#KullaniciAdiBelirleKutu").addClass("kirmizi");
            $("#KullaniciAdiBelirleMesaj").html(veri.m);
        }else{
            $("#KullaniciAdiBelirleKutu").removeClass("kirmizi");
            $("#KullaniciAdiBelirleMesaj").html("");
        }
        if(veri.k){
            KullaniciAdi = veri.k;
            $("#KullaniciAdi").html(KullaniciAdi);

            //Kullanıcı adı belirleme sayfasını kapatıp sohbet penceresini açıyoruz
            KullaniciAdiEkrani.addClass("kapali");
            SohbetEkrani.removeClass("kapali");
        }
        //Giriş yapıldıktan sonra mesajları sunucudan aldığımız veriler doğrultusunda yazıyoruz
        if(veri.mesajlar){
            SohbetBolumu.html("");
            veri.mesajlar.forEach(function(mesaj){
                MesajCounter++;
                let Ben = KullaniciAdi == mesaj.KullaniciAdi ? "Ben" : "Diger";
                SohbetBolumu.append(`<div class="SohbetMesaji ${Ben}">
                        <div class="SohbetMesaji__Yollayan">${mesaj.KullaniciAdi}</div>
                        <div class="SohbetMesaji__MesajKutusu">${mesaj.Mesaj}</div>
                </div>`);
            })
            SohbetBolumu.animate({
                scrollTop: SohbetBolumu[0].scrollHeight
            }, 1000);
            
            ChatHazirmi = false;
            setTimeout(function(){
                ChatHazirmi = true;
            },1000)
        }
    })

    //Sunucu bağlantımız kesildiğinde
    socket.on('disconnect', function(){
        //Loaderimizi aktifleştiriyoruz
        Yukleyici.removeClass("kapali");
        Yukleyici.css("opacity",1);
        $("#YukleyiciBaslik").html("Sunucu bağlantısı koptu!");
    });

    KullaniciAdiBelirleButon.click(function(){
        KullaniciAdiBelirle();
    })

    //Kullanıcı adı belirleme fonksiyonumuz
    function KullaniciAdiBelirle(){
        let KullaniciAdi = $("#KullaniciAdiInput").val();
        //Sunucuya veri gönderiyoruz
        socket.emit('kullaniciAdiBelirle', { KullaniciAdi: KullaniciAdi });
    }

    //Mesaj gönderme fonksiyonumuz
    function MesajGonder(){
        if(MesajCooldown === false){
            //Mesaj kutusunu çektik
            let Mesaj = MesajInput.val();

            //Eğerki mesajda boşluk harici karakter yoksa iptal ediyoruz
            if(Mesaj.replaceAll(' ','').length == 0) return;

            if(Mesaj.length > 0 && Mesaj.length <= 400){

                socket.emit('mesajGonder', {m: Mesaj});
                //Mesaj kutusunu sıfırlıyoruz
                MesajInput.val("");

                //Mesaj gönderdikten sonra cooldown ekliyoruz
                MesajCooldown = true;
                setTimeout(function(){
                    MesajCooldown = false;
                }, MesajCooldownSuresi);
            }
        }else{
            //Eğerki tarayıcı buga girerse cooldownu tekrar resetliyoruz
            setTimeout(function(){
                MesajCooldown = false;
            }, MesajCooldownSuresi);
        }
    }

    //Loader fonksiyonumuz toplam olarak 750 milisaniye yani 0.75 saniye sürüyor.
    function YukleyiciFonksiyon(){
        //Sayfa yüklendikten 250 milisaniye sonra animasyonumuzu başlatıyoruz
        setTimeout(function(){
            //Şeffaflığımızı 1% oranında belirli aralıklarla düşürüyoruz. Animasyon süresi toplam 500 milisaniye yani 0.5 saniye sürüyor.
            for(let i = 1; i > 0; i -= 0.01){
                setTimeout(function(){
                    Yukleyici.css("opacity",i);
                    if(i <= 0.01) Yukleyici.addClass("kapali");
                }, (1-i)*500)
            }
        },250)
    }
})