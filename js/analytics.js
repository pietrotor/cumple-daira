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

function formatEventLabel(eventType) {
  if (eventType === "abrio_sobre") return "💌 Abrió el sobre";
  return "👀 Visitó la página";
}

function formatTelegramMessage(payload) {
  const when = new Date(payload.fecha).toLocaleString("es-VE", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return [
    "<b>🎂 Cumple Daira — visita</b>",
    "",
    formatEventLabel(payload.evento),
    `📅 ${when}`,
    `🌍 ${payload.pais}${payload.codigo_pais ? ` (${payload.codigo_pais})` : ""}`,
    `📍 ${payload.ciudad}${payload.region ? `, ${payload.region}` : ""}`,
    `🔗 IP: ${payload.ip}`,
    `📱 ${payload.pantalla} · ${payload.idioma}`,
  ].join("\n");
}

async function sendToGoogleSheets(payload) {
  const webhookUrl = window.APP_CONFIG?.analyticsWebhookUrl;
  if (!webhookUrl) return;

  const params = new URLSearchParams(payload);
  const url = `${webhookUrl}?${params.toString()}`;

  await fetch(url, { mode: "no-cors", keepalive: true });
}

async function sendToTelegram(payload) {
  const token = window.APP_CONFIG?.telegramBotToken;
  const chatId = window.APP_CONFIG?.telegramChatId;
  if (!token || !chatId) return;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: formatTelegramMessage(payload),
      parse_mode: "HTML",
    }),
    keepalive: true,
  });
}

async function trackVisit(eventType) {
  const hasGoogle = Boolean(window.APP_CONFIG?.analyticsWebhookUrl);
  const hasTelegram = Boolean(
    window.APP_CONFIG?.telegramBotToken && window.APP_CONFIG?.telegramChatId
  );

  if (!hasGoogle && !hasTelegram) return;

  const geo = await fetchVisitorGeo();
  const payload = buildAnalyticsPayload(eventType, geo);

  await Promise.allSettled([sendToGoogleSheets(payload), sendToTelegram(payload)]);
}
