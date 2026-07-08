async function fetchVisitorGeo() {
  const providers = [
    async () => {
      const data = await fetch("https://ipapi.co/json/", { cache: "no-store" }).then((r) =>
        r.json()
      );
      return {
        ip: data.ip,
        country: data.country_name,
        countryCode: data.country_code,
        city: data.city,
        region: data.region,
      };
    },
    async () => {
      const data = await fetch("https://ipwho.is/", { cache: "no-store" }).then((r) => r.json());
      if (!data.success) throw new Error("ipwho failed");
      return {
        ip: data.ip,
        country: data.country,
        countryCode: data.country_code,
        city: data.city,
        region: data.region,
      };
    },
  ];

  for (const provider of providers) {
    try {
      const geo = await provider();
      return {
        ip: geo.ip || "desconocida",
        country: geo.country || "desconocido",
        countryCode: geo.countryCode || "",
        city: geo.city || "desconocida",
        region: geo.region || "",
      };
    } catch {
      // Try next provider
    }
  }

  return {
    ip: "desconocida",
    country: "desconocido",
    countryCode: "",
    city: "desconocida",
    region: "",
  };
}

function buildAnalyticsPayload(eventType, geo) {
  return {
    fecha: new Date().toISOString(),
    evento: eventType,
    ip: geo.ip,
    pais: geo.country,
    codigo_pais: geo.countryCode,
    ciudad: geo.city,
    region: geo.region,
    navegador: navigator.userAgent.slice(0, 180),
    idioma: navigator.language || "",
    pantalla: `${window.screen.width}x${window.screen.height}`,
    pagina: window.location.href,
  };
}

async function trackVisit(eventType) {
  const webhookUrl = window.APP_CONFIG?.analyticsWebhookUrl;
  if (!webhookUrl) return;

  const geo = await fetchVisitorGeo();
  const payload = buildAnalyticsPayload(eventType, geo);
  const params = new URLSearchParams(payload);
  const url = `${webhookUrl}?${params.toString()}`;

  try {
    await fetch(url, { mode: "no-cors", keepalive: true });
  } catch {
    // Silent fail — la página sigue funcionando aunque falle el registro
  }
}
