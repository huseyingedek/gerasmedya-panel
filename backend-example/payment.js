/**
 * GERAS MEDYA — iyzico Ödeme Entegrasyonu
 * 
 * Kurulum:
 *   npm install iyzipay bcryptjs jsonwebtoken nodemailer
 * 
 * .env dosyasına ekle:
 *   IYZICO_API_KEY=sandbox-xxxxx         (iyzico panelinden alınır)
 *   IYZICO_SECRET_KEY=sandbox-xxxxx
 *   IYZICO_BASE_URL=https://sandbox-api.iyzipay.com   (canlıda: https://api.iyzipay.com)
 *   JWT_SECRET=cok-gizli-bir-anahtar
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_USER=email@gmail.com
 *   SMTP_PASS=uygulama-sifresi
 */

const Iyzipay = require("iyzipay");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer"); // e-posta için aktif et
// const User = require("../models/User");   // kendi User modelini ekle

// ── iyzico başlat
const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY,
  secretKey: process.env.IYZICO_SECRET_KEY,
  uri: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
});

// ── Plan fiyatları
const PLANS = {
  aylik:  { price: "499.00",  currency: "TRY", name: "Aylık Plan"  },
  yillik: { price: "3990.00", currency: "TRY", name: "Yıllık Plan" },
};

/**
 * POST /api/payment/create
 * Body: { plan, user: { name, email, password }, card: { holder, number, expireMonth, expireYear, cvv } }
 */
async function createPayment(req, res) {
  try {
    const { plan, user, card } = req.body;

    // Plan kontrolü
    const planInfo = PLANS[plan];
    if (!planInfo) return res.status(400).json({ message: "Geçersiz plan." });

    // E-posta kontrolü — kendi DB kontrolünü yaz
    // const existing = await User.findOne({ email: user.email });
    // if (existing) return res.status(400).json({ message: "Bu e-posta zaten kayıtlı." });

    // ── iyzico ödeme isteği
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: `geras-${Date.now()}`,
      price: planInfo.price,
      paidPrice: planInfo.price,
      currency: planInfo.currency,
      installment: "1",
      basketId: `basket-${Date.now()}`,
      paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup: Iyzipay.PAYMENT_GROUP.SUBSCRIPTION,

      paymentCard: {
        cardHolderName: card.holder,
        cardNumber: card.number,
        expireMonth: card.expireMonth,
        expireYear: card.expireYear,
        cvc: card.cvv,
        registerCard: "0",
      },

      buyer: {
        id: `buyer-${Date.now()}`,
        name: user.name.split(" ")[0],
        surname: user.name.split(" ").slice(1).join(" ") || user.name.split(" ")[0],
        gsmNumber: "+905000000000",  // kullanıcıdan alabilirsin
        email: user.email,
        identityNumber: "74300864791", // sandbox için sabit, canlıda gerçek TC
        registrationAddress: "Türkiye",
        ip: req.ip || "127.0.0.1",
        city: "Istanbul",
        country: "Turkey",
      },

      shippingAddress: {
        contactName: user.name,
        city: "Istanbul",
        country: "Turkey",
        address: "Türkiye",
      },

      billingAddress: {
        contactName: user.name,
        city: "Istanbul",
        country: "Turkey",
        address: "Türkiye",
      },

      basketItems: [
        {
          id: plan,
          name: planInfo.name,
          category1: "Dijital Eğitim",
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: planInfo.price,
        },
      ],
    };

    // ── iyzico'ya gönder
    iyzipay.payment.create(request, async (err, result) => {
      if (err || result.status !== "success") {
        console.error("iyzico hata:", err || result.errorMessage);
        return res.status(400).json({
          message: result?.errorMessage || "Ödeme işlemi başarısız.",
          errorCode: result?.errorCode,
        });
      }

      // ── Ödeme başarılı → kullanıcı oluştur
      try {
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Kendi DB'ne kaydet:
        // const newUser = await User.create({
        //   name: user.name,
        //   email: user.email,
        //   password: hashedPassword,
        //   plan: plan,
        //   planExpiry: plan === "yillik"
        //     ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        //     : new Date(Date.now() + 30  * 24 * 60 * 60 * 1000),
        //   paymentId: result.paymentId,
        // });

        // JWT token oluştur
        const token = jwt.sign(
          { id: "user_id_from_db", email: user.email, plan },
          process.env.JWT_SECRET,
          { expiresIn: plan === "yillik" ? "365d" : "30d" }
        );

        // E-posta gönder (opsiyonel):
        // await sendWelcomeEmail(user.email, user.name);

        return res.status(200).json({
          success: true,
          message: "Ödeme başarılı, hesabınız oluşturuldu.",
          token,
          paymentId: result.paymentId,
        });

      } catch (dbErr) {
        console.error("DB hatası:", dbErr);
        // ÖNEMLI: Ödeme alındı ama DB'ye yazılamadı — loglayıp manüel düzelt
        return res.status(500).json({ message: "Ödeme alındı ancak hesap oluşturulamadı. Lütfen bize ulaşın." });
      }
    });

  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ message: "Sunucu hatası." });
  }
}

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 */
function getMe(req, res) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token bulunamadı." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // DB'den kullanıcıyı çek:
    // const user = await User.findById(decoded.id).select("-password");
    // return res.json({ user });

    // Şimdilik token içinden döndür:
    return res.json({ user: { id: decoded.id, email: decoded.email, plan: decoded.plan } });

  } catch {
    return res.status(401).json({ message: "Geçersiz token." });
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // const user = await User.findOne({ email });
    // if (!user) return res.status(400).json({ message: "Kullanıcı bulunamadı." });
    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) return res.status(400).json({ message: "Şifre hatalı." });

    // const token = jwt.sign({ id: user._id, email: user.email, plan: user.plan, name: user.name }, process.env.JWT_SECRET, { expiresIn: "30d" });
    // return res.json({ token, user: { id: user._id, name: user.name, email: user.email, plan: user.plan } });

    res.json({ message: "Login endpoint — DB bağlantısı ekle" });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası." });
  }
}

module.exports = { createPayment, getMe, login };
