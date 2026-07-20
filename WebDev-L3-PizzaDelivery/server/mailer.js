require("dotenv").config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendLowStockEmail(items) {
  if (items.length === 0) return;

  const html = `
    <h2>⚠️ Low Stock Alert</h2>
    <p>The following inventory items are below their threshold:</p>

    <table border="1" cellpadding="8" cellspacing="0">
      <tr>
        <th>Item</th>
        <th>Stock</th>
        <th>Threshold</th>
      </tr>

      ${items
        .map(
          (item) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.stock}</td>
              <td>${item.threshold}</td>
            </tr>
          `
        )
        .join("")}
    </table>

    <br/>
    <p>Please restock these ingredients.</p>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: "🍕 Pizza Inventory Low Stock Alert",
    html,
  });

  console.log("✅ Low stock email sent");
}

module.exports = sendLowStockEmail;