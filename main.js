const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require("url")

const createWindow = () => {
    const win = new BrowserWindow({
      width: 610,
      minWidth: 610,
      maxWidth: 610,
      height: 1100,
      webPreferences: {        
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      }
    })
  
    win.loadURL(url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol:'file',
      slashes: true
    }))
}

app.whenReady().then(() => {
    createWindow()
  
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

//Her bir electron uygulamasına özel id oluşturuyoruz
var kullaniciID = rastgele(64);
//Bu ID verisini daha sonra uygulamadan çekip sunucuya göndereceğiz ve işlemlerimizi bununla yapacağız
ipcMain.on('kullaniciID', (event, arg) => {
  event.returnValue = kullaniciID;
})
//Rastgele yazı oluşturma fonksiyonu
function rastgele(length) {
  var sonuc = '';
  var karakterler = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( var i = 0; i < length; i++ ) {
    sonuc += karakterler.charAt(Math.floor(Math.random() * karakterler.length));
  }
  return sonuc;
}